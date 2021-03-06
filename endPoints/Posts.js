const express = require("express");
const Users = require("../models/User");
const posts = require("../endPoints/PostsController");
const PostRouter = express.Router();

/****** API Endpoints for comments insert for corresponding post ********/
PostRouter.put("/comments", (req, res) => {
  const { postID } = req.query;
  const { userID } = req.query;
  const { content } = req.body;

  const comment = {
    user: userID,
    content: content
  };

  posts
    .insertComment(postID, comment)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => console.log(err));
});

/****** API Endpoints for Likes  ********/
// Add like
PostRouter.post("/likes", (req, res) => {
  const { postID } = req.query;
  const { userID } = req.query;
  posts
    .addLike(postID, userID)
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err));
});

// Remove like
PostRouter.delete("/likes", (req, res) => {
  const { postID } = req.query;
  const { userID } = req.query;
  posts
    .removeLike(postID, userID)
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err));
});

// Get liked posts
PostRouter.get("/likes", (req, res) => {
  const { userID } = req.query;
  posts
    .getLikedByUser(userID)
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err));
});

/****** API Endpoints for Posts ********/
// PostRouter.get('', (req, res) => {
//     posts
//         .getAll()
//         .then(result => res.status(200).json(result))
//         .catch(err => console.log(err));
// });

// PostRouter.get('', (req, res) => {
//     const { id } = req.query;
//     console.log(id);
//     posts
//         .getById(id)
//         .then(result => {
//             console.log(result);
//             res.status(200).json(result);
//         })
//         .catch(err => console.log(err));
// });

PostRouter.get("", (req, res) => {
  const { owner } = req.query;

  Users.findById(owner)
    .then(user => {
      const owners = user.friends;
      owners.push(owner);
      return posts
        .getByOwners(owners)
        .populate("owner", "username thumbnail _id")
        .populate("comments.user", "username thumbnail _id");
    })
    .then(result => res.status(200).json(result))
    .catch(err => console.log(err));
});

PostRouter.post("", (req, res) => {
  const newPost = req.body;
  posts
    .insert(newPost)
    .then(post => res.status(201).json({ success: true, post }))
    .catch(err => console.log(err));
});

PostRouter.delete("", (req, res) => {
  const { id } = req.query;
  posts
    .delete(id)
    .then(result => res.status(201).json({ success: true, result }))
    .catch(err => console.log(err));
});

module.exports = PostRouter;
