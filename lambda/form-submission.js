'use strict'

var AWS = require('aws-sdk')
var dynamoDB = new AWS.DynamoDB()

var FormSubmission = module.exports = function FormSubmission() {}

FormSubmission.prototype.save = function FormSubmission_save(item, callback) {
    var params = {
        TableName:"form_submissions",
        Item: item
    }

    dynamoDB.putItem(params, callback)    
}