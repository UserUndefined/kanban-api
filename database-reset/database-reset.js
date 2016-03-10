(function() {
  "use strict";


  var mongoose = require("mongoose");
  var Q = require("q");
  var Task = mongoose.model("Task", require(process.cwd() + "/schemas/tasks.js"));
  var User = mongoose.model("User", require(process.cwd() + "/schemas/users.js"));
  var Board = mongoose.model("Board", require(process.cwd() + "/schemas/boards.js"));
  var Category = mongoose.model("Category", require(process.cwd() + "/schemas/categories.js"));
  var Comment = mongoose.model("Comment", require(process.cwd() + "/schemas/comments.js"));
  var usersImport = require(process.cwd() + "/database-reset/users-import.js");
  var boardImport = require(process.cwd() + "/database-reset/board-import.js");


  var resetDB = function(interval) {
    var users = [];


    setTimeout(function() {
      resetDB(interval);
    }, interval);


    // delete the database
    mongoose.connection.db.dropDatabase()
      .then(function(res) {
        console.log("Database is deleted");
      })
      .catch(function(err) {
        console.log("Could not delete the Database");
        console.log(err);
      })


    // import database
    .then(function() {
        return User.collection.insertMany(usersImport);
      })
      .then(function(_users_) {
        console.log("Users are imported");
        return _users_;
      })
      .catch(function(err) {
        console.log("Could not import users, reason:");
        console.log(err);
      })


    // create board
    .then(function(_users_) {
      users = _users_.ops;

      return Board.create(new Board({
        name: boardImport.name,
        admins: [_users_.insertedIds[0]], //Sheldon's _id
        members: _users_.insertedIds.slice(1, 5),
        categories: []
      }));
    })

    .then(function(board) {
      return Board.
      findOne({
        _id: board._id
      });
    })


    //create categories, tasks, comments
    .then(function(board) {
      console.log("Board is created");

      // create categories
      for (var i = 0; i < boardImport.categories.length; i++) {
        var category = boardImport.categories[i];

        board.categories.push(new Category({
          name: category.name,
          tasks: []
        }));


        // create tasks
        for (var j = 0; j < category.tasks.length; j++) {
          var task, taskUserIds;
          task = boardImport.categories[i].tasks[j];
          taskUserIds = [];

          // assign users
          for (var k = 0; k < task.users.length; k++) {
            taskUserIds.push(users[task.users[k]]._id);
          }

          board.categories[i].tasks.push(new Task({
            name: task.name,
            users: taskUserIds,
            comments: []
          }));


          // create comments
          for (k = 0; k < task.comments.length; k++) {
            var comment, commentUser;
            comment = task.comments[k];
            commentUser = users[comment.user];

            board.categories[i].tasks[j].comments.push(new Comment({
              username: commentUser.username,
              userPicUrl: commentUser.pictureUrl,
              content: comment.content,
              date: comment.date
            }));
          }
        }
      }

      return board.save();
    })

    //catch any errors in the board creation process
    .catch(function(err) {
      console.log("Could not fully create the board board, reason:");
      console.log(err);
    });
  };


  module.exports = resetDB;
})();
