const mongoose  = require('mongoose')
const User = require('./user')
const todo = new mongoose.Schema({
    description:String,
        //required:[true,"task cannot be empty"]
    
    time:Date,
    user:String,

})


module.exports = mongoose.model('Todo', todo)