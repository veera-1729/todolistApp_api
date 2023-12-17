require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const authRoutes = require('./routes/autentication/index')
const taskRoutes = require('./routes/tasks')

app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))//this statement parses the body of the incoming request

app.use('/auth', authRoutes)
app.use("/tasks",taskRoutes)
app.use((err,req, res,next) => {
    
    const errorStatus = err.status || 500
    const errorMessage = err.message || "Something went wrong!!"
    res.status(errorStatus).json({
        success:false,
        staus:errorStatus,
        message:errorMessage,
        stack:err.stack
    })
})

const port = process.env.PORT || 3000
app.listen(port, (req, res) => {
    console.log("Serving on port 3000")
})

//connecting to mongo
mongoose.connect(process.env.mongodburl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err)
        console.log("Connected to DB")
    else
        console.log("err while connecting to DB", err)
})