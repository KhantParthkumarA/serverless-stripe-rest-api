var AWS = require("aws-sdk");
require('dotenv').config()
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": process.env.accesskey, "secretAccessKey": process.env.secretkey
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

module.exports.create = function (data) {
    var input = {
        "email_id": `example${Date.now()}@gmail.com`,
        "username": "username -  "
    };
    var params = {
        TableName: "users",
        Item: input
    };
    docClient.put(params, function (err, data) {
        console.log(err, data)
        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
        } else {
            console.log("users::save::success", data);
        }
    });
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'content-type': 'application/json'
        },
        body: 'success',
    };
}


// GET 

exports.Get = async (id) => {
    // const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "users",
        Key: {
            id: id
        },
    };

    try {
        responseBody = await docClient.scan(params).promise();
    } catch (err) {
        responseBody = `Unable to get Products: ${err}`;
    }
    return responseBody;
};


// delete
exports.Delete = async (id) => {
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "users",
        Key: {
            id
        }
    };

    try {
        const data = await docClient.delete(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 204;
    } catch (err) {
        responseBody = `Unable to delete Product: ${err}`;
        statusCode = 403;
    }

    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };

    return response;
};

// Hardcoded PUT (post)
exports.Post = async (data) => {
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "users",
        Item: data
    };

    try {
        const data = await docClient.put(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 201;
    } catch (err) {
        responseBody = `Unable to put Product: ${err}`;
        statusCode = 403;
    }

    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };

    return response;
};

// Hardcoded UPDATE (put)

exports.Put = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "users",
        Key: {
            id: '12345'
        },
        UpdateExpression: "set productName = :n",
        ExpressionAttributeValues: {
            ":n": "Water pumps"
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const data = await documentClient.update(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 204;
    } catch (err) {
        responseBody = `Unable to update Product: ${err}`;
        statusCode = 403;
    }

    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };

    return response;
};

// UPDATE (put)'use strict';

exports.putStrict = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const { id, productName } = JSON.parse(event.body);

    const params = {
        TableName: "users",
        Key: {
            id: id
        },
        UpdateExpression: "set productName = :n",
        ExpressionAttributeValues: {
            ":n": productName
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const data = await docClient.update(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 204;
    } catch (err) {
        responseBody = `Unable to update Product: ${err}`;
        statusCode = 403;
    }

    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };

    return response;
};

// DELETE

exports.DeleteNew = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const { id } = event.pathParameters;

    const params = {
        TableName: "users",
        Key: {
            id: id
        }
    };

    try {
        const data = await docClient.delete(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 204;
    } catch (err) {
        responseBody = `Unable to delete Product: ${err}`;
        statusCode = 403;
    }

    const response = {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: responseBody
    };

    return response;
};