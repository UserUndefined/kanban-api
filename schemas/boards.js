(function() {
	"use strict";

	var mongoose = require("mongoose");
	var Schema = mongoose.Schema;
	var categorySchema = require(process.cwd() + "/schemas/categories.js");
	var userSchema = require(process.cwd() + "/schemas/users.js");

	var boardSchema = new Schema({
		name: String,
		admins: [{
			type: Schema.Types.ObjectId,
			ref: "User"
		}],
		members: [{
			type: Schema.Types.ObjectId,
			ref: "User"
		}],
		categories: [categorySchema]
	});

	module.exports = boardSchema;
})();
