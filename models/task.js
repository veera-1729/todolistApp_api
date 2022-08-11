const mongoose  = require('mongoose')
const User = require('./user')
const todo = new mongoose.Schema({
    description:String, 
    time:Date,
    user:String,

})


module.exports = mongoose.model('Todo', todo)