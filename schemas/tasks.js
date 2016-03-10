(function() {
	"use strict";

	var mongoose = require("mongoose");
	var Schema = mongoose.Schema;
	var userSchema = require(process.cwd() + "/schemas/users.js");
	var commentSchema = require(process.cwd() + "/schemas/comments.js");

	var taskSchema = new Schema({
		name: String,
		position: Number,
		users: [{
			type: Schema.Types.ObjectId,
			ref: "User"
		}],
		comments: [commentSchema]
	});

	module.exports = taskSchema;
})();
