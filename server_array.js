//create an app server
var express = require("express");
//var dbURL = 'mongodb://localhost/data/db';
//var db = require('mongoose').connect(dbURL);
var app = express();
//var User = require('./data/models/user');

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
    dataStore[index] = req.query.name;
    dataElements = dataStore[index].split(':');
    dataObject = {"time": dataElements[0], "ardtime": dataElements[1], "m0": dataElements[2], "m1": dataElements[3], "t": dataElements[4], "version": dataElements[5]};
    dataObjectStore[index] = dataObject;
    dataMoist0 = dataElements[2];
    dataMoist1 = dataElements[3];
    dataMoist0Max = (dataMoist0 > dataMoist0Max)?dataMoist0:dataMoist0Max;
    dataMoist0Min = (dataMoist0 < dataMoist0Min)?dataMoist0:dataMoist0Min;
//    User.create(dataObject, function(err) {
//      if (err) {
//       return next(err);
//      }
//    });	  
//    console.log('%s', req.query);
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
//  console.log("client= ", client);
  var data2 = [ ];
  User.count(function(err, count) {
    if (err) {
      return next(err);
    }
    User.find({}, { _id: 0})
      .sort({"time": 1})
      .skip(count - req.query.last)
      .exec(function(err, data) {
        if (err) {
          return next(err);
        }
//        console.log(JSON.stringify(data));
//        data.forEach(function(item) {
        var items = parseInt (req.query.last / req.query.every);
        for (i=0; i < req.query.last/req.query.every; i++) {
          data2.push(data[(i+1)*req.query.every - 1]);
          var number = parseInt( data2[i].ardtime.split(".")[2] );
          data2[i].ardtime = number;
        }
        res.render('index', {title: 'Moist-Berry', data: data2, mode: mode, views: pageViewCounter});
      });
  });
});

app.listen(8000)
