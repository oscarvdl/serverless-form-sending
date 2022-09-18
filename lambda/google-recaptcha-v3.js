'use strict'

const https = require('https')

module.exports = class GoogleRecaptcha {
  constructor(options = {}) {
    if (typeof options.secret == 'undefined') {
      throw new Error('Missing secret in options')
    }

    this._secret = options.secret
  }
  verify(options = {}) {
    if (typeof options.response == 'undefined') {
      throw new Error('Missing response in options')
    }

    let requestBody = `secret=${this._secret}&response=${options.response}`
    if (typeof options.remoteip !== 'undefined') {
      requestBody += `&remoteip=${options.remoteip}`
    }
    const httpsRequestoptions = {
      host: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': requestBody.length
      }
    }

    return new Promise((resolve, reject) => {
      let responseString = ''
      let req = https.request(httpsRequestoptions, (res) => {
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          responseString += chunk
        })
        res.on('end', () => {
          let response = JSON.parse(responseString)
          if (response.success) {
            resolve({score: response.score})
          } else {
            reject({errors: response['error-codes']})
          }
        })
        res.on('timeout', () => {
          reject({errors: ['Connection timed out']})
        })
      })
      req.write(requestBody)
      req.end()
    })
  }
}