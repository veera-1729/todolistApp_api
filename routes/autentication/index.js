const express = require('express')
const router = express.Router()
const User = require('../../models/user')
const todos = require('../../models/task')
const bcrypt = require('bcrypt')


const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {

        return res.render('login')
    }

    next()
}

router.get('/register', (req, res) => {
    res.render('register')
})

//saving the new user into database
router.post('/register', async (req, res) => {

    const { password, username } = req.body
    const isvalid = await User.findOne({ username: username })
    if (isvalid != null) {
        req.flash('error', 'username already exists')

        res.redirect('register')
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
router.get('/login', (req, res) => {
    res.render('login')
})

//validating the user to login
router.post('/login', async (req, res) => {

    const { username, password } = req.body
    const foundUser = await User.findOne({ username })
    if (foundUser != null) {
        const isValid = await bcrypt.compare(password, foundUser.password)
        if (isValid) {
            req.session.user_id = foundUser._id

            await foundUser.populate('tasks')
            await foundUser.save()
            const data = foundUser.tasks

            res.render('home', { foundUser, data })
        }
        else {
            req.flash('error', 'Invalid Username or password')

            res.redirect('register')
        }
    }
    else {
        req.flash('error', 'Invalid Username or password')
        res.redirect('register')
    }
})



//loggin out some one
router.get('/logout', requireLogin, (req, res) => {

    req.session.user_id = null
    //req.flash('success', "Logged out Successfully")
    res.render('login')
})



module.exports = router;