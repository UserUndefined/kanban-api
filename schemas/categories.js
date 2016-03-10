(function() {
	"use strict";

	var mongoose = require("mongoose");
	var Schema = mongoose.Schema;
	var taskSchema = require(process.cwd() + "/schemas/tasks.js");

	var categorySchema = new Schema({
		name: String,
		position: Number,
		tasks: [taskSchema]
	});

	module.exports = categorySchema;
})();
