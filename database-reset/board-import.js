(function() {
  "use strict";

  var board = {
    "name": "The Big Bang Theory",
    "categories": [{
      "name": "To Do",
      "tasks": [{
        "name": "Chinese takeway night",
        "users": [],
        "comments": []
      }, {
        "name": "Laundry",
        "users": [0, 4],
        "comments": []
      }, {
        "name": "Convince Bernadette to move in with Howard's mum",
        "users": [],
        "comments": []
      }, {
        "name": "Find girlfriend for Raj",
        "users": [],
        "comments": [{
          "user": 3,
          "content": "I am never lucky guys!!",
          "date": Date.now() - 60 * 24 * 60 * 60 * 1000
        }]
      }, {
        "name": "Solve the singularity",
        "users": [0],
        "comments": []
      }]
    }, {
      "name": "Underway",
      "tasks": [{
        "name": "Visit the comic book store 7pm",
        "users": [1, 3, 0],
        "comments": [{
          "user": 1,
          "content": "I'm so excited about this!",
          "date": Date.now() - 3 * 60 * 60 * 1000
        }, {
          "user": 3,
          "content": "Yeah, the new X-men is out!",
          "date": Date.now() - 2 * 60 * 60 * 1000
        }]
      }, {
        "name": "Date night",
        "users": [4, 2],
        "comments": []
      }]
    }, {
      "name": "Finished",
      "tasks": [{
        "name": "Star War movie marathon",
        "users": [2, 1, 0, 3],
        "comments": [{
          "user": 4,
          "content": "..."
        }]
      }]
    }],
    "members": [],
    "admins": []
  };

  module.exports = board;
})();
