var toBool = require("../source/to-bool.js");

module.exports = {
	setUp: function(done) {
		(done)();
	},
	tearDown: function(done) {
		// clean up
		(done)();
	},

	testConvertsBools: function(test) {
		test.strictEqual(toBool(true), true);
		test.strictEqual(toBool(false), false);
		test.done();
	},

	testConvertsFunctions: function(test) {
		test.strictEqual(toBool(function() {}), true);
		test.done();
	},

	testConvertsNull: function(test) {
		test.strictEqual(toBool(null), false);
		test.done();
	},

	testConvertsNumbers: function(test) {
		test.strictEqual(toBool(1), true);
		test.strictEqual(toBool(234.5), true);
		test.strictEqual(toBool(0), false);
		test.strictEqual(toBool(-12), true);
		test.done();
	},

	testConvertsObjects: function(test) {
		test.strictEqual(toBool({}), true);
		test.done();
	},

	testConvertsStrings: function(test) {
		test.strictEqual(toBool("true"), true);
		test.strictEqual(toBool("1"), true);
		test.strictEqual(toBool("false"), false);
		test.strictEqual(toBool("fsdfsdf"), false);
		test.strictEqual(toBool(""), false);
		test.done();
	},

	testConvertsUndefined: function(test) {
		var a = {};
		test.strictEqual(toBool(undefined), false);
		test.strictEqual(toBool(a.b), false);
		test.done();
	}

};