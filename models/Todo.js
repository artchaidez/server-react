const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TodoSchema = new Schema(
    {
        title: {type: String, required: true},
        description: {type: String, required: true,},
        author: {type: Schema.Types.ObjectId, ref: 'User'},
        complete: {type: Boolean},
        completedOn: {type: Number}
    }
);

//Export model
module.exports = mongoose.model('Todo', TodoSchema);