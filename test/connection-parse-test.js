var vows = require('vows'), assert = require('assert');

var connection = require('../connection');

vows.describe('connection.parse').addBatch({
	'parse with three modules, the last one of which returns a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				},
				desiredModule : true
			}];
			
			connection._parse(new Buffer(0) ,protocolModules, this.callback);
		},
		'should removesModules all other modules if a module successfully parses message' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 0);
			assert.equal(protocolModules.length, 1);
		}
	},
	'parse with two modules, the last one of which returns a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				},
				desiredModuleA : false
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				},
				desiredModuleA : true
			}];
			
			connection._parse(new Buffer(0) ,protocolModules, this.callback);
		},
		'should removesModules all other modules if a module successfully parses message' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 0);
			assert.equal(protocolModules.length, 1);
		}
	},
	'parse with one module that returns a error and none that return a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback("error", null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				},
				desiredModule : true
			}];

			connection._parse(new Buffer(7),protocolModules, this.callback);
		},
		'should remove module that returns an error' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.isNull(message); // no message was sent back
			assert.equal(data.length, 7); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 2); // the module that threw an error should have been removed
		}
	},
	'parse when first module returns a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, 'message', buffer);
					});
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, null, buffer);
					});
				}
			}];

			connection._parse(new Buffer(12),protocolModules, this.callback);
		},
		'should not call parse on second module in list' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, 'message');
			assert.equal(data.length, 12); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 1); // only the module that returned the message should callback
		}
	},
	'parse when first module thows an exception a message' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					throw "error";
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should ignore broken module' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, 'message');
			assert.equal(data.length, 2); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 1); // only the module that returned the message should callback
		}
	},
	'parse when first module callsback syncrhonously' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					callback(null, null, buffer);
				}
			}, {
				parse : function(buffer, callback) {
					process.nextTick(function() {
						callback(null, "message", buffer);
					});
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should call back' : function(err, message, data, protocolModules) {
			assert.isNull(err);
			assert.equal(message, "message");
			assert.equal(data.length, 2); // we get back the same buffer we passed in
			assert.equal(protocolModules.length, 1); // only the module that returned the message should callback
		}
	},
	'parse when parse function does not callback' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					// do nothing
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should time out' : function(err, message, data, protocolModules) {
			console.log(arguments);
			assert.equal(err, "timeout");
		}
	},
	'parse when parse function callsback in after timeout' : {
		topic : function() {
			var protocolModules = [{
				parse : function(buffer, callback) {
					setTimeout(function() {
						callback(null);
					}, 1500);
				}
			}];

			connection._parse(new Buffer(2),protocolModules, this.callback);
		},
		'should time out' : function(err, message, data, protocolModules) {
			assert.equal(err, "timeout");
		}
	}
}).export(module);
// Export the Suite