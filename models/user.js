const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const todos = require('./task')
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be empty']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be empty']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    tasks: [
        {type:mongoose.Schema.Types.ObjectId, ref:todos}
    ]
})


 


 
//this function is called before the new user is going to be saved into the database 
//this function makes the user given pasword into hash password automatically
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next()//if we are going to modify the passwrod then execute the remaining code.
        //if the password is not modified then do not execute below code directly save and return
    this.password = await bcrypt.hash(this.password, 12)
    next()
})

module.exports = mongoose.model('User', userSchema);
//module.exports = mongoose.models.Todos || mongoose.model('Todo', todo)