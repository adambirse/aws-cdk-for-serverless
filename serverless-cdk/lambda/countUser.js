const AWS = require('aws-sdk');

var TableName = process.env.TABLE_NAME
var region = process.env.AWS_REGION
AWS.config.update({region: region})

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const params = {
        ExpressionAttributeValues: {
            ':age':  event.queryStringParameters.age
        },
        FilterExpression: 'age = :age',
        TableName: TableName
    };

    dynamo.scan(params, function(err, data) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            const response = {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
                },
                body: JSON.stringify(data.Count),
                // body: JSON.stringify(data.Items),
                isBase64Encoded: false
            };
            callback(null, response);
        }
    });
};
