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

//connecting to mongo
mongoose.connect("mongodb+srv://VeeraBhadrudu:Veera%409989@cluster0.akdpvfn.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err)
        console.log("Connected to DB")
    else
        console.log("err while connecting to DB", err)
})

//function to check whether user is logged in or not
//this function will be helpful to protect multiple end points
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }

    next()
}
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(express.urlencoded({ extended: true }))//this statement parses the body of the incoming request
app.use(session({ secret: "notagoodsecret" }))
app.use(flash())
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})


//adding a new todo
app.post('/addtodo/:id',requireLogin, async (req, res) => {
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
    //res.send('THIS IS THE HOME PAGE')
    res.render('index')
})

app.get('/register', (req, res) => {
    res.render('register')
})

//saving the new user into database
app.post('/register', async (req, res) => {

    const { password, username } = req.body
    const isvalid = await User.findOne({username:username})
    if(isvalid != null)
    {
        req.flash('error','username already exists')
        res.redirect('/register')
    }
    const newuser = new User({ username, password })
    //pre method in user model is called before newuser is going to be saved 
    await newuser.save();
    const foundUser = newuser
    req.session.user_id = newuser._id

    await foundUser.populate('tasks')
    await foundUser.save()
    const data = foundUser.tasks
    //req.flash('success',"Registration Successfull!!")
    res.render('home', { foundUser, data })
})

//displaying the login page
app.get('/login', (req, res) => { 
    res.render('login')
})

//validating the user to login
app.post('/login', async (req, res) => {

    const { username, password } = req.body
    const foundUser = await User.findOne({ username })
    if(foundUser != null){
    const isValid = await bcrypt.compare(password, foundUser.password)
    if (isValid) {
        req.session.user_id = foundUser._id

        await foundUser.populate('tasks')
        await foundUser.save()
        const data = foundUser.tasks

        res.render('home', { foundUser, data })
    }
    else {
        req.flash('error','Invalid Username or password')
        res.redirect('register')
    }}
    else {
        req.flash('error','Invalid Username or password')
        res.redirect('register')
    }
})



//loggin out some one
app.get('/logout',requireLogin, (req, res) => {
    req.session.user_id = null 
    req.flash('success',"Logged out Successfully")
    res.redirect('/login')
})

//editing the tasks
app.get('/edit/:id/:tid', requireLogin,async (req, res) => {


    const foundUser = await User.findById(req.params.id) 
    const task = await todos.findOne({ user: foundUser.username, _id: req.params.tid })  
    res.render('edit', { task, foundUser })
})

//saving the edited details 
app.post('/edit/:id/:tid',requireLogin, async (req, res) => {
    const foundUser = await User.findById(req.params.id)
    const updatetask = await todos.findOneAndUpdate({ user: foundUser.username, _id: req.params.tid }, { ...req.body.todo })
    await updatetask.save() 
    await foundUser.populate('tasks')
    await foundUser.save();
    const data = foundUser.tasks 
    res.render('home', { foundUser, data })
})

//deleting the task
app.get('/delete/:id/:tid', requireLogin,async (req, res) => {
    const foundUser = await User.findById(req.params.id)
    const task = await todos.findOneAndDelete({ user: foundUser.username, _id: req.params.tid }) 

    await foundUser.populate('tasks')
    await foundUser.save()
    const data = await foundUser.tasks 
    res.render('home', { foundUser, data })
})
app.listen(3000, (req, res) => {
    console.log("Serving on port 3000")
})