const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) =>{

    //console.log('Auth middleware')
    try{
       const token = req.header('Authorization').replace('Bearer ','')
       // console.log(token)
     const decoded = jwt.verify(token, process.env.JWT_SECRET)
       // console.log(decoded)
        const user = await User.findOne({ _id : decoded._id, 'tokens.token': token}) //tokens.token makes sure the user has its property
        
        if(!user)
        {
            console.log('No user found')
            throw new Error()
        }
        req.token = token
        req.user = user
        next()

    }
    catch(e){
        res.status(401).send({error: "Please authenticate."})
    }
   
// }
//next()
}
module.exports = auth