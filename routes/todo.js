var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo');

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
  const todos = await Todo.find().where('author').equals(req.payload.id).exec()
  return res.status(200).json({"todos": todos})
});

router.get('/:todoId', async function(req, res, next) {
    const todo = await Todo.findOne().where('_id').equals(req.params.todoId).exec()
    return res.status(200).json(todo)
}); 

router.delete('/:todoId',  (req,res) => {
    const { todoId } = req.params;

    Todo.findOneAndDelete( {_id: todoId} ).exec((error, todo) => {
        if(error)
          return res.status(500).json({code: 500, message: 'Error occured when deleting todo', error: error})
        res.status(200).json(todo)
      });
})

router.put('/:todoId',  (req,res) => {
    const { todoId } = req.params;
    const { complete, completedOn } = req.body;

    Todo.findOneAndUpdate( {_id: todoId}, {complete: complete, completedOn: completedOn} ).exec((error, todo) => {
        if(error)
          return res.status(500).json({code: 500, message: 'Error occured updating todo', error: error})
        res.status(200).json(todo)
      });
})

router.post('/', async function(req, res) {
  const todo = new Todo({
    "title": req.body.title,
    "description": req.body.description,
    "author": req.payload.id
  })
    
  await todo.save().then( savedTodo => {
    return res.status(201).json({
      "id": savedTodo._id,
      "title": savedTodo.title,
      "description": savedTodo.description,
      "author": savedTodo.author,
      "complete": savedTodo.complete,
      "completedOn": savedTodo.completedOn})
    }).catch( error => {
      return res.status(500).json({"error": error.message})
    });
})

module.exports = router;
