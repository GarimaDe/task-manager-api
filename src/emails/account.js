//File responsible to send all the emails related to the account
const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to:'garimade3@gmail.com',
//     from : 'garimade3@gmail.com',
//     subject : 'This is my first mail',
//     text : 'I hope this gets send'
// }).then(()=>{
//     console.log('Message sent')
// }).catch((e)=>{
//     console.log(e.response.body)
// })

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from : 'garimade3@gmail.com',
        subject: 'Thanks for joining',
        text: `Welcome to the app ${name}. Let me know how you get along with the message`,
        
    })
}

const sendCancellationEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from : 'garimade3@gmail.com',
        subject : 'It is sad to see you go',
        text : `Oops you left. ${name} let us know what troubled you!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}