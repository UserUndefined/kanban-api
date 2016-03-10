(function() {
	"use strict";

	var express = require("express"),
		routes = require(process.cwd() + "/routes/routes.js"),
		bodyParser = require("body-parser");


	exports.createRoutes = function(app) {
		var router = express.Router();

		app.use(bodyParser.json());

		router.all("*", function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods", "OPTIONS, POST, GET, PUT, DELETE");
			res.header("Access-Control-Allow-Headers", "Content-Type, Accept, Token");
			next();
		});

		router.get("/user/:userId", routes.authorize, routes.findUser);
		router.get("/board/:boardId", routes.authorize, routes.findBoard);
		router.get("/board/user/:userId", routes.authorize, routes.findBoardsForUser);

		router.post("/user/login", routes.authenticate);
		router.post("/user", routes.createUser);
		router.post("/board", routes.authorize, routes.createBoard);
		router.post("/category", routes.authorize, routes.createCategory);
		router.post("/task", routes.authorize, routes.createTask);
		router.post("/comment", routes.authorize, routes.createComment);

		router.put("/board", routes.authorize, routes.updateBoard);
		router.put("/board/members", routes.authorize, routes.addMemberToBoard);

		router.delete("/category/:boardId/:categoryId", routes.authorize, routes.deleteCategory);
		router.delete("/task/:boardId/:categoryId/:taskId", routes.authorize, routes.deleteTask);
		router.delete("/board/:boardId", routes.authorize, routes.deleteBoard);
		router.delete("/board/:boardId/user/:userId", routes.authorize, routes.deleteUserFromBoard);

		app.use("/api", router);
	};

	module.exports = exports;
})();
