var uuid = require('node-uuid')
var GoogleRecaptcha = require('./google-recaptcha-v3')
var FormSubmission = require('./form-submission')
var Mail = require('./mail')

var formSubmission = new FormSubmission()
var mail = new Mail()

// Recaptcha v3
const CAPTHA_RESPONSE_SCORE_MINIMUM = parseFloat(process.env.CAPTHA_RESPONSE_SCORE_MINIMUM)
var captcha = new GoogleRecaptcha({
    secret: process.env.CAPTCHA_SITE_SECRET
})

var headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.ACCESS_CONTROL_ALLOW_ORIGIN
}

exports.handler = (event, _context, callback) => {
    let data = JSON.parse(event.body)
    captcha.verify({response: data.captcha_token})
        .then((response) => {
            if (response.score >= CAPTHA_RESPONSE_SCORE_MINIMUM) {
                formSubmission.save({
                    form_submission_id: { S:uuid.v4() },
                    form: { S:"sign-up" },
                    event : { S:data.event },
                    name : { S:data.name },
                    email : { S:data.email },
                    message : { S:data.message },
                    status: { S:"created"}
                }, (err) => {
                    if (err) {
                        callback(null, {
                            statusCode: 500,
                            headers,
                            body: '{"result": "Error"}'
                        })
                    } else {
                        mail.send(
                            'Aanmelding van ' + data.name + ' voor ' + data.event,
                            'Evenement:\n' + data.event + '\n\nNaam:\n' + data.name + '\n\nE-mailt:\n' + data.email + '\n\nVraag of opmerking:\n' + data.message,
                            (error) => {
                                if (error) {
                                    callback(null, {
                                        statusCode: 500,
                                        headers,
                                        body: '{"result": "Error"}'
                                    })
                                } else {
                                    callback(null, {
                                        statusCode: 200,
                                        headers,
                                        body: '{"result": "Success"}'
                                    })
                                }
                            }
                        )
                    }
                })
            } else {
                callback(null, {
                    statusCode: 500,
                    headers,
                    body: '{"result": "Error"}'
                })
            }
        }, (errors) => {
            callback(null, {
                statusCode: 500,
                headers,
                body: '{"result": "Error", "errors": "'  + JSON.stringify(errors) + '"}'
            })
        })
}