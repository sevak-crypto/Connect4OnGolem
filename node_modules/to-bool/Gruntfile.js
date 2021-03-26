module.exports = function(grunt) {

	"use strict";

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		nodeunit: {
			all: ['tests/*.js'],
			options: {
				reporter: 'junit',
				reporterOptions: {
					output: 'test-results'
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js', 'source/**/*.js']
		}
	});

	grunt.registerTask("default", ["test"]);

	grunt.registerTask("test", [
		"jshint",
		"nodeunit"
	]);

};