const AWS = require('aws-sdk');

var TableName = process.env.TABLE_NAME
var region = process.env.AWS_REGION
AWS.config.update({region: region})

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    const Key = {};
    Key['name'] = event.queryStringParameters.name;

    try {
        const data = await dynamo.get({TableName, Key}).promise();
        var response = {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: JSON.stringify(data.Item),
            isBase64Encoded: false
        };
        callback(null, response);
    } catch(err) {
        callback(err, null);
    }
};
