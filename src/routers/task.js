const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()
const Tasks = require('../models/tasks')


//For Task

router.post('/tasks', auth, async (req,res)=>{
    //const task = new Tasks(req.body)
    const task = new Tasks({
        ...req.body,
        owner : req.user._id
    })
    
    try 
    {
        await task.save()
        res.send(task)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
 })




//Fetching all tasks
router.get('/tasks' , auth, async (req,res)=>{

    const match = { }
    const sort = { }

    if(req.query.completed){
        match.completed = req.query.completed==='true'
    }
    if(req.query.sortBy)
    {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]=== 'desc' ? -1  : 1
    }
    try{
        //const tasks = await Tasks.find({owner: req.user._id})
        await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit:parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    }
   catch(e){
        res.status(500).send()
    }
})

//Fetching a single task by ID

router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id
    try{
      
        const task = await Tasks.findOne({_id, owner : req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }
        res.send(task)
    }
        catch(e)
        {
            res.status(500).send()   
        }
    
    // Tasks.findById(_id).then((task)=>{
    //     if(!task)
    //     {
    //         return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})





//To update task

router.patch('/tasks/:id', auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOp = updates.every((update)=> allowedUpdates.includes(update))
    if(!isValidOp)
    {
        res.status(400).send({ error: 'Invalid error'})
    }
    try{

       
        const task = await Tasks.findOne({_id : req.params.id, owner : req.user._id})

        
        

        if(!task)
        {
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update] = req.body[update])
        await task.save()
        res.send(task)
    }
    catch(e)
    {
        res.status(500).send(e)
    }


})


router.delete('/tasks/:id', auth, async (req,res)=>{
    try{

        const task = await Tasks.findOneAndDelete({_id: req.params.id , owner:req.user._id})
        if(!task)
        {
            res.status(404).send()
        }
        res.send(task)
    }
    catch(e)
    {
        res.status(500).send(e)
    }
})

module.exports = router