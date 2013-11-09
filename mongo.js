var mongodb = require('mongodb');

module.exports.init = function (callback) {
    var server = new mongodb.Server("127.0.0.1", 27017, {});
    new mongodb.Db('test', server, {w: 1}).open(function (error, client) {
	//export the client and maybe some collections as a shortcut
	module.exports.client = client;
	module.exports.dataCollection = new mongodb.Collection(client, 'dataCollection');
	callback(error);
    });
};