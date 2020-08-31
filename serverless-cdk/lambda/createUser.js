const AWS = require('aws-sdk');

var TableName = process.env.TABLE_NAME
var region = process.env.AWS_REGION
AWS.config.update({region: region})

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {

    const Item = {};
    Item['name'] = event.queryStringParameters.name;
    Item['location'] = event.queryStringParameters.location;
    Item['age'] = event.queryStringParameters.age;

    try {
    const data = await dynamo.put({TableName, Item}).promise();
        var response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Access-Control-Allow-Credentials': 'true'
            },
            isBase64Encoded: false
        };
        console.log('success: returned ${data.Item}');
        callback(null, response);
    } catch (error) {
        callback(err, null);
    }
};
