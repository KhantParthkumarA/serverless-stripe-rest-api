'use strict';

const AWS = require('aws-sdk');
const config = require('../../env')
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Product';

module.exports.deleteProduct = async (event) => {
  console.log('running');

  const id = event.pathParameters?.id;

  if (!id) {
    console.log('Nothing submitted.');

    return getResponse(400, null, 'Request not found');
  }

  try {
    await docClient
      .delete({
        TableName: tableName,
        Key: { productId: id }
      })
      .promise();

    return getResponse(204, null, null);
  } catch (error) {
    return getResponse(400, JSON.stringify({ message: error.message }), null);
  }
};

function getResponse(statusCode, body, error) {
  if (error) console.error(error);

  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'content-type': 'application/json'
    },
    body: body,
    error: error
  };
}
