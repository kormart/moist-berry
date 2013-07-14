//create an app server
var express = require("express");
var fs = require('fs-extra');
var time = require('time');
var app = module.exports = express();

app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser({uploadDir:'./uploads'}));
    app.use(express.static(__dirname + '/public'));
});

app.get('/upload', function(req, res) {
    res.end('end-of-page')
});

app.post('/upload', function(req, res) {
    time.tzset('US/Pacific');
    var now_object = time.localtime(time.time());
    var time_path = '/data/images/image_' + (1900+now_object.year).toString() + '-' + ('0'+(1+now_object.month).toString()).substr(-2) + '-' + ('0'+now_object.dayOfMonth.toString()).substr(-2) + '_' + ('0'+now_object.hours.toString()).substr(-2) + '-' + ('0'+now_object.minutes.toString()).substr(-2) + '.jpg';
    // get the temporary location of the file
    var tmp_path = req.files.file.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/images/' + req.files.file.name;
    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        // copy file to storage place
        fs.copy('./public/images/lastsnap.jpg', time_path, function(err){
          if (err) throw err;
        }); //copies file
        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
        });
    });
});

app.listen(3000)
