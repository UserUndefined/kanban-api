(function() {
	"use strict";

	var mongoose = require("mongoose");
	var Schema = mongoose.Schema;

	var userSchema = new Schema({
		username: String,
		salt: String,
		pwd: String,
		email: {
			type: String,
			default: ""
		},
		hideEmail: Boolean,
		siteRbac: {
			type: String,
			default: "Member"
		},
		telephone: String,
		hideTelephone: Boolean,
		pictureUrl: {
			type: String,
			default: "http://imgur.com/MCcP2Le.jpg"
		},
		Log: [{
			action: String,
			date: Date
		}],
		facebookAPI: String,
		googleAPI: String,
		twitterAPI: String,
		gitHubAPI: String,
		caption: {
			type: String,
			default: ""
		}
	});

	module.exports = userSchema;

})();
