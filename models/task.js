const mongoose  = require('mongoose')
const todo = new mongoose.Schema({
    description:String, 
    time:Date,
    userID:String,
    status:{
        type:String,
        default:"Pending"
    }
})


module.exports = mongoose.model('Todo', todo)