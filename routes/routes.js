(function() {
  "use strict";

  var TOKEN_SECRET = "danielsiteisbestsite";


  var JWT = require("jsonwebtoken");
  var mongoose = require("mongoose");
  var Q = require("q");
  var Task = mongoose.model("Task", require(process.cwd() + "/schemas/tasks.js"));
  var User = mongoose.model("User", require(process.cwd() + "/schemas/users.js"));
  var Board = mongoose.model("Board", require(process.cwd() + "/schemas/boards.js"));
  var Category = mongoose.model("Category", require(process.cwd() + "/schemas/categories.js"));
  var Comment = mongoose.model("Comment", require(process.cwd() + "/schemas/comments.js"));


  exports.deleteUserFromBoard = function(req, res, next) {
    Board
      .findOne({
        _id: req.params.boardId
      })
      .exec(function(err, board) {
        if (err || !board) {
          return res.send(err);
        }

        var iAdmin = board.admins.indexOf(req.params.userId);
        var iMember = board.members.indexOf(req.params.userId);

        if (iMember < 0 && iAdmin < 0 || err) {
          return res.status(500).send(err);
        }

        if (iAdmin >= 0) {
          board.admins.splice(iAdmin, 1);
        }

        if (iMember >= 0) {
          board.members.splice(iMember, 1);
        }
        board._v++;
        board.save(function(err, board) {
          if (err) return res.status(500).send(err);
          res.sendStatus(204);
        });
      });

  };


  // has to be idempotent
  exports.addMemberToBoard = function(req, res, next) {
    User
      .findOne({
        email: req.body.userEmail
      })
      .exec(function(err, user) {
        if (err || !user) {
          return res.status(404).send("err: could not find user");
        }

        var userId = user._id;

        Board
          .findOne({
            _id: req.body.boardId
          })
          .populate("admins members")
          .exec(function(err, board) {
            if (err || !board) {
              return err.send(err);
            }

            //check first that user is not already in the board
            if (board.admins.indexOf(userId) != -1) return res.sendStatus(403);
            if (board.members.indexOf(userId) != -1) return res.sendStatus(403);
            board.members.push(user);
            board._v++;
            board.save(function(err, board) {
              if (err || !board) {
                return res.status(500).send(err);
              }
              res.status(200).send(user);
            });
          });
      });
  };


  exports.findBoard = function(req, res, next) {
    findAndPopulateBoard(req.params.boardId)
      .then(function(board) {
        return res.status(200).json(board);
      }, function(err) {
        console.log("findBoardErr: " + err);
        return res.sendStatus(404);
      });
  };

  var findAndPopulateBoard = function(boardId) {
    var deferBoard = Q.defer();

    var populateTask = function(task) {
      var deferTask = Q.defer();

      User.populate(task, {
          path: "users"
        },
        function(err, res) {
          if (err) defer.reject(err);
          deferTask.resolve();
        });

      return deferTask.promise;
    };

    Board
      .findOne({
        _id: boardId
      })
      .populate("admins members")
      .exec(function(err, board) {
        if (err || !board) {
          return deferBoard.reject(err);
        }

        var promises = [];
        var defers = [];

        if (board.categories.length) {
          for (var i = 0; i < board.categories.length; i++) {
            if (board.categories[i].tasks.length) {
              for (var j = 0; j < board.categories[i].tasks.length; j++) {
                promises.push(populateTask(board.categories[i].tasks[j]));
              }
            }
          }
        }


        if (promises.length) {
          for (var k = 0; k < promises.length; k++) {
            promises[k].then(0, function(err) {
              console.log("findAndPopErr: " + err);
              return deferBoard.reject(err);
            });
          }

          Q.allSettled(promises)
            .then(function() {
              return deferBoard.resolve(board);
            });

        } else {
          return deferBoard.resolve(board);
        }
      });

    return deferBoard.promise;
  };


  exports.findBoardsForUser = function(req, res, next) {
    Board
      .find({
        $or: [{
          members: {
            $elemMatch: {
              $eq: req.params.userId
            }
          }
        }, {
          admins: {
            $elemMatch: {
              $eq: req.params.userId
            }
          }
        }]
      })
      .populate("admins members")
      .exec(function(err, boards) {
        if (err || !boards.length) {
          return res.sendStatus(404);
        }
        res.status(200).json(boards);
      });

  };

  exports.createComment = function(req, res, next) {
    Board
      .findById(req.body.boardId)
      .exec(function(err, board) {
        if (err || !board) {
          return res.status(500).send(err);
        }

        var category = board.categories.id(req.body.catId);
        var task = category.tasks.id(req.body.taskId);
        var comment = new Comment({
          username: req.body.username,
          userPicUrl: req.body.userPicUrl,
          content: req.body.content,
          date: Date.now()
        });

        task.comments.push(comment);

        board._v++;
        board.save(function(err) {
          if (err) return res.status(500).send(err);
          res.status(201).json(comment);
        });
      });
  };


  exports.authenticate = function(req, res, next) {
    User.findOne({
      username: req.body.username,
      pwd: req.body.pwd
    }, function(err, user) {
      if (err) return res.status(500).send(err);
      if (!user) return res.sendStatus(404);

      var token = JWT.sign({
        username: user.username,
        pwd: user.pwd
      }, TOKEN_SECRET, {
        expiresInMinutes: 180
      });

      return res.status(200).json({
        user: user,
        token: token
      });
    });
  };

  exports.authorize = function(req, res, next) {
    JWT.verify(req.headers.token, TOKEN_SECRET, function(err, decoded) {
      if (err) {
        return res.sendStatus(401);
      }

      next();
    });
  };

  exports.deleteBoard = function(req, res, next) {
    Board
      .findById(req.params.boardId)
      .remove(function(err, board) {
        if (err || !board) {
          return res.status(500).send(err);
        }

        res.sendStatus(204);
      });
  };


  exports.deleteCategory = function(req, res, next) {
    Board
      .findById(req.params.boardId)
      .exec(function(err, board) {
        if (err || !board) {
          return res.status(500).send(err);
        }

        board.categories.id(req.params.categoryId).remove();
        board._v++;
        board.save(function(err) {
          if (err) return send(err);
          res.sendStatus(204);
        });
      });
  };


  exports.deleteTask = function(req, res, next) {
    Board
      .findById(req.params.boardId)
      .exec(function(err, board) {
        if (err || !board) {
          return res.status(500).send(err);
        }

        var category = board.categories.id(req.params.categoryId);
        category.tasks.id(req.params.taskId).remove();
        board._v++;
        board.save(function(err) {
          if (err) return send(err);
          res.sendStatus(204);
        });
      });
  };


  exports.updateBoard = function(req, res, next) {
    Board
      .findById(req.body.board._id)
      .exec(function(err, board) {
        if (err || !board) {
          return res.status(500).send(err);
        }

        var rBoard = req.body.board;
        if (board._v > rBoard._v) {
          return res.status(500).send("board is out of date, please refresh yo page, sir");
        }

        board.name = rBoard.name;
        board.categories = rBoard.categories;
        board.admins = rBoard.admins;
        board.members = rBoard.members;
        board.increment();

        board.save(function(err, board) {
          if (err) return res.status(500).send(err);
          res.sendStatus(200);
        });
      });
  };

  var deepCopy = function(src, dest) {
    var srcKeys = Object.keys(src);

    for (var i = 0; i < srcKeys.length; i++) {
      dest[srcKeys[i]] = JSON.parse(JSON.stringify(src[srcKeys[i]]));
    }
  };


  exports.findUser = function(req, res, next) {
    User
      .findById(req.params.userId)
      .exec(function(err, user) {
        if (err) return res.status(500).send(err);
        res.status(200).json(user);
      });
  };


  exports.createTask = function(req, res, next) {
    Board
      .findById(req.body.boardId)
      .exec(function(err, board) {
        if (err) return res.status(500).send(err);
        var category = board.categories.id(req.body.categoryId);
        category.tasks.push(new Task({
          name: req.body.name,
          position: Number(req.body.position),
          users: [],
          comments: []
        }));
        board._v++;
        board.save(function(err) {
          if (err) return res.status(500).send(err);
          res.status(201).json(category.tasks[category.tasks.length - 1]);
        });
      });
  };


  exports.createCategory = function(req, res, next) {
    Board
      .findById(req.body.boardId)
      .exec(function(err, board) {
        if (err) return res.status(500).send(err);
        board.categories.push(new Category({
          name: req.body.name,
          tasks: []
        }));
        board._v++;
        board.save(function(err) {
          if (err) return res.status(500).send(err);
          res.status(201).json(board.categories[board.categories.length - 1]);
        });
      });
  };


  exports.createBoard = function(req, res, next) {
    Board.create(new Board({
      name: req.body.name,
      admins: [req.body.userId],
      members: [],
      categories: []
    }), function(err, board) {
      if (err) res.status(500).send(err);
      res.status(201).json(board);
    });
  };


  exports.createUser = function(req, res, next) {

    User.create(new User({
      username: req.body.username,
      pwd: req.body.pwd,
      pictureUrl: req.body.pictureUrl
    }), function(err, user) {
      if (err || !user) {
        return res.status(500).send(err);
      }

      var token = JWT.sign({
        username: user.username,
        pwd: user.pwd
      }, TOKEN_SECRET, {
        expiresInMinutes: 30
      });

      res.status(201).json({
        user: user,
        token: token
      });
    });
  };


  module.exports = exports;
})();
