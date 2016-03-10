(function() {
	"use strict";

	var mongoose = require("mongoose");
	var Schema = mongoose.Schema;

	var commentSchema = new Schema({
		username: String,
		userPicUrl: String,
		content: String,
		date: Date
	});

	module.exports = commentSchema;
})();
