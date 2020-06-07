const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const { sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

//For users]

//Sign Up
router.post('/users', async (req,res)=>{
    const user = new User(req.body)
 
    try{
     await user.save()
     sendWelcomeEmail(user.email, user.name)
     const token = await user.generateAuthToken()
    // res.status(201).send(user)
   
    res.status(201).send({user, token})
    } catch(e){
     res.status(400).send(e)
    }
 })

 //Login
 router.post('/users/login', async (req,res)=>{
    try{
       // const users = await User.find({})
       
        const user = await User.findByCredentials(req.body.email, req.body.password)
        
      const token = await user.generateAuthToken()
     
       res.send({user: user, token})
    }catch(e){
       res.status(400).send()
    }
})

 //Logout

 router.post('/users/logout' , auth, async(req,res)=>{
     try{
         req.user.tokens = req.user.tokens.filter((token)=>{
             return token.token !== req.token
         })
         await req.user.save()
         res.send()
     }
     catch(e)
     {
         res.status(500).send(e)
     }
 })


//Logout all sessions

router.post('/users/logoutAll', auth, async(req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
 }
 
catch(e)   {
    res.status(500).send(e)
}
})
 
 //Read users
//  router.get('/users', auth, async (req,res)=>{
//      try{
//          const users= await User.find({})
//          res.send(users)
//      }
//     //res.send(req.user)
//     catch(e){
//         res.status(500).send()
//     }
//  })
 

 //Reading own data
 router.get('/users/me', auth, async (req,res)=>{
    res.send(req.user)
})
 
 
//  router.get('/users/:id', async (req,res)=>{
//     const _id = req.params.id
//    try{
//      const user = await User.findById(_id)
//      if(!user)
//      {
//          return res.status(404).send()
//      }
//      res.send(user)
//    }
//    catch(e)
//    {
//      res.status(500).send()
//    }
     
//  })



 
//Updating User
router.patch('/users/me', auth,  async (req,res)=>{
    const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'email', 'password', 'age']
    
        const isValidOp = updates.every((update)=> allowedUpdates.includes(update))
    
        if(!isValidOp)
        {
            res.status(400).send({ error: 'Invalid error'})
        }
        try{

            //const user = await User.findById(req.params.id)

            updates.forEach((update)=>{
                req.user[update] = req.body[update]
            })

            await req.user.save()
            //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true})
            res.send(req.user)
        }
        catch(e)
        {
            res.status(400).send(e)
        }
    })

 //Deleting an user by ID
 router.delete('/users/me', auth, async (req,res)=>{
    try{

        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        // {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }
    catch(e)
    {
        res.status(500).send()
    }
})

const upload = multer({
   
    limits : {
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('File must be jpg, png or jpeg'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
   const buffer = await sharp(req.file.buffer).resize({ width :250, height : 250}).png().toBuffer()
    req.user.avatar =  buffer
   await req.user.save()
    res.send()
}, (error, req, res, next)=>{
    res.status(400).send({
        error: error.message
    })
})

//Deleting avatar
router.delete('/users/me/avatar', auth , async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


//Fetching avatar
router.get('/users/:id/avatar', async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)
        {
            throw new Error('User or User image not found!')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = router