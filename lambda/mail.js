'use strict'

var nodemailer = require('nodemailer')

const MAIL_FROM = process.env.MAIL_FROM
const recipients = process.env.MAIL_TO.split(/\s*,\s*/);

// Node mailer
var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

var Mail = module.exports = function Mail() {}

Mail.prototype.send = function Mail_send(subject, text, done) {
    recipients.forEach((recipient) => {
        var mailOptions = {
            from: MAIL_FROM,
            to: recipient,
            subject: subject,
            text: text
        }
        
        transporter.sendMail(mailOptions, done)
    })
}