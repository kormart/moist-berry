//create an app server
var express = require("express");
var app = express();

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'}); 
var dynamoTable = 'moist-berry';

var dataStore = new Array();
var dataObjectStore = new Array();
var dataElements = new Array();
var dataMoist0Max = 0;
var dataMoist0Min = 1000;
var dataMoist0 = 0;
var dataMoist1 = 0;
var index = 0;
var length = 25;
var mode = "7";
var pageViewCounter = 0;

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
    data2 = [ {time: 1, users: 20, other: 30}, {time: 2, users: 23, other: 29}, {time: 3, users: 25, other: 28} ];
    res.render('index.jade', {title: 'Awesome', data2: data2});
});

app.get('/test-page', function(req, res) {
    var client = req.ip;
    dataStore[index] = req.query.name;
    dataElements = dataStore[index].split(':');
    dataObject = {"time": dataElements[0], "ardtime": dataElements[1], "m0": dataElements[2], "m1": dataElements[3], "t": dataElements[4], "version": dataElements[5], "client": client};
    dataObjectStore[index] = dataObject;
    dataMoist0 = dataElements[2];
    dataMoist1 = dataElements[3];
    dataMoist0Max = (dataMoist0 > dataMoist0Max)?dataMoist0:dataMoist0Max;
    dataMoist0Min = (dataMoist0 < dataMoist0Min)?dataMoist0:dataMoist0Min;
    var item = {};
    item.time = {S: dataObject.time};
    item.ardtime = {S: dataObject.ardtime};
    item.m0 = {S: dataObject.m0};
    item.m1 = {S: dataObject.m1};
    item.t = {S: dataObject.t};
    item.version = {S: dataObject.version};
    item.client = {S: dataObject.client};

    // write to AWS DynamoDb
    var params = {};
    params.TableName = dynamoTable;
    params.Item = item;
    dynamodb.putItem(params, function(err, data) {
      if (err)       
        console.log(err)     
//      else       
//       console.log("Successfully wrote data to aws-dynamodb/moist-berry:", data);   
    });

    index++;
    if (index==length) { index=0; }

    res.end(mode)
});

app.get('/mode', function(req,res) {
	mode = req.query.mode;
	res.end(mode)
});

app.get('/time', function(req, res) {
  var client = req.ip;
  res.write('Max=' + dataMoist0Max.toString() + ' Min=' + dataMoist0Min.toString() + ' Mode= ' + mode + ' Views= ' + pageViewCounter + ' Client= ' + client + '\n');
  for (var i=0;i<length;i++) { 
    res.write(JSON.stringify(dataObjectStore[(i+index)%length]) + '\n');
  }
  res.end()
});

app.get('/data', function(req, res, next){
  pageViewCounter++;
  var outputItems = [ ];
  var maxItems = 100;

  function pad(num, size){ return ('000000000' + num).substr(-size); }

  // down sample array
  function sampleArray(numItems, array) {
    step=(array.length-1)/(numItems-1);
    var outArray =[];
    for (i=0; i < numItems; i++) {
        outArray.push(array[Math.floor(step*i)]);
    }
    return outArray;
  }

  var days = '0';
  if ( !(req.query.days === undefined) ) {
    days = req.query.days;
  }

  var minutes = '0';
  if ( !(req.query.minutes === undefined)) {
    minutes = req.query.minutes;
  }

  var d = new Date();
  d = new Date(d.getTime() - days * (24*60*60*1000) - minutes * (60*1000));
  var y = d.getFullYear();
  var mon = d.getMonth() + 1;
  var day = d.getDate();
  var hour = d.getHours();
  var minute = d.getMinutes();
  from = pad(y,4) + '.' + pad(mon,2) + '.' + pad(day,2) + '.' + pad(hour,2) + '.' + pad(minute,2);
//  console.log("query from: ", from);

  var params = {};
  params.TableName = dynamoTable;
  params.ScanFilter = {time: {ComparisonOperator: 'GE', AttributeValueList: [{S: from}]}};
  params.Limit = 100;

  dynamodb.scan(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
//    else     console.log(data.Count, data.Items);           // successful response

    var resultItems = data.Items;
    resultItems.forEach(function(item) {
      outputItems.push({time: item.time.S, 
        ardtime: item.ardtime.S.split(".")[2],
        m0: item.m0.S,
        m1: item.m1.S,
        t: item.t.S,
        version: item.version.S,
        client: item.client.S }); 
    }); //forEach

    outputItems.sort(function (a, b) {
      if (a.time > b.time) {
        return 1;
      }
      if (a.time < b.time) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    // sample down to maxItems items
    var outputItems2 = sampleArray(maxItems, outputItems);

    res.write(JSON.stringify(outputItems2));
    res.end();
  }); // scan
});

app.listen(8000)
