var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const Post = require('../models/Post');

const privateKey = process.env.JWT_PRIVATE_KEY;

router.use(function(req, res, next) {
  console.log(req.header("Authorization"))
  if (req.header("Authorization")) {
    try {
      req.payload = jwt.verify(req.header("Authorization"), privateKey, { algorithms: ['RS256'] })
    } catch(error) {
      return res.status(401).json({"error": error.message});
    }
  } else {
    return res.status(401).json({"error": "Unauthorized"});
  }
  next()
})

/* GET home page. */
router.get('/', async function(req, res, next) {
  const posts = await Post.find().where('author').equals(req.payload.id).exec()
  return res.status(200).json({"posts": posts})
});

router.post('/', async function(req, res) {
  const post = new Post({
    "title": req.body.title,
    "content": req.body.content,
    "author": req.payload.id
  })
    
  await post.save().then( savedPost => {
    return res.status(201).json({
      "id": savedPost._id,
      "title": savedPost.title,
      "content": savedPost.content,
      "author": savedPost.author})
    }).catch( error => {
      return res.status(500).json({"error": error.message})
    });
})

module.exports = router;
