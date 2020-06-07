const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne,setupDatabase} = require('./fixtures/db')
beforeEach(setupDatabase)

test('Should signup new user' , async()=>{
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email :'andrew@example.com',
        password: 'Mypasss1234'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()


    //Assertions about the tesponse
    //expect(response.body.user.name).toBe('Andrew')
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token : user.tokens[0].token
    })

    //Ensure password saved isnot is plaintext format
    expect(user.password).not.toBe('Mypasss1234')
})

test('Should login existing user', async()=>{
    const response = await request(app).post('/users/login').send({
        email : userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

//Login failure
test('Should not login nonexistent user', async()=>{
    await request(app).post('/users/login').send({
        email : 'abc@example.com',
        password :'abc1234'
    }).expect(400)
})



//Fetching user profile
test('Should get profile for user', async ()=>{
    await request(app)
    .get('/users/me')
    .set('Authorization' , `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})


//It should fail when we aren't authenticated

test('Should not get profile for unauthenticated user' , async()=>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})


//Delete account for user
test('Should delete account for user' , async()=>{
     await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})


//Deeletion fails if not authorized
test('Should not delete account for unauthorized user' , async()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})


test('Should upload avatar image', async()=>{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/profile-pic.jpg')
    .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})


test('Should update valid user field', async()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Jess'
    })
    .expect(200)

    //Confirming name has changed
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jess')
})


//Shouldnot update invalid user fields
test('Should not update invalid user fields', async()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location : 'India'
    })
    .expect(400)
})