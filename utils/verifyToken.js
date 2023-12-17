const jwt = require("jsonwebtoken");


const verifyToken = (req, res,next) => {
    // console.log(req.cookies.access_token,"\n")
    // console.log(req)
    const token = req.cookies.access_token

    if(!token)
    {
        return next(createError(401,"You are not authenticated!!"))
    }


    jwt.verify(token, process.env.JWT,(err,user) => {
        if(err) return next(createError(403,"Token not valid!!"))

        req.user = user;
        next()
    })
}

const verifyUser = (req, res, next) => {
    // console.log(req.cookies.access_token)
    verifyToken(req, res,next ,() => {
        if(req.user.id === req.params.id || req.user.isAdmin) {
            next()
        }else{
            return next(createError(403,"you are not authorized!!"))
        }
    })

}

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, next, () => {
        console.log(req.user)
        if(req.user.isAdmin) {
            next()
        }else{
            return next(createError(403,"you are not authorized!!"))
        }
    })
}

module.exports = {verifyToken,verifyUser,verifyAdmin}