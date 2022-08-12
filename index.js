require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const User = require('./models/user')
const bcrypt = require('bcrypt')
const session = require('express-session')
const todos = require('./models/task')
const ejsMate = require('ejs-mate')
const layout = require('express-ejs-layouts')
const flash = require('connect-flash')
const auth = require('./routes/autentication/index')

//connecting to mongo
mongoose.connect(process.env.mongodburl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err)
        console.log("Connected to DB")
    else
        console.log("err while connecting to DB", err)
})

//function to check whether user is logged in or not
//this function will be helpful to protect multiple end points
const requireLogin = (req, res, next) => {
    
    if (!req.session.user_id) {
         
        return  res.render('login')
    }

    next()
}
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }))//this statement parses the body of the incoming request
app.use(session({
    secret: "notagoodsecret",
    resave: false,
    saveUninitialized: true,
}))
app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/auth', auth)



//adding a new todo
app.post('/addtodo/:id', requireLogin, async (req, res) => {
    //console.log("posting")
    const foundUser = await User.findById(req.params.id)
    const task = await todos.create(req.body.todo);
    task.user = foundUser.username
    await task.save()
    foundUser.tasks.push(task)
    await foundUser.populate('tasks')
    await foundUser.save()
    const data = foundUser.tasks

    //req.flash('success','Successfully added new task')


    res.render('home', { foundUser, data })
})
//Home page
app.get('/', (req, res) => {
     
    res.render('index')
})

//editing the tasks
app.get('/edit/:id/:tid', requireLogin, async (req, res) => {
     
    const foundUser = await User.findById(req.params.id)
    const task = await todos.findOne({ user: foundUser.username, _id: req.params.tid })
    res.render('edit', { task, foundUser })
})

//saving the edited details 
app.post('/edit/:id/:tid', requireLogin, async (req, res) => {
    const foundUser = await User.findById(req.params.id)
    const updatetask = await todos.findOneAndUpdate({ user: foundUser.username, _id: req.params.tid }, { ...req.body.todo })
    await updatetask.save()
    await foundUser.populate('tasks')
    await foundUser.save();
    const data = foundUser.tasks
    res.render('home', { foundUser, data })
})

//deleting the task
app.get('/delete/:id/:tid', requireLogin, async (req, res) => {
    const foundUser = await User.findById(req.params.id)
    const task = await todos.findOneAndDelete({ user: foundUser.username, _id: req.params.tid })

    await foundUser.populate('tasks')
    await foundUser.save()
    const data = await foundUser.tasks
    res.render('home', { foundUser, data })
}) 

const port = process.env.port || 3000
app.listen(port, (req, res) => {
    console.log("Serving on port 3000")
})