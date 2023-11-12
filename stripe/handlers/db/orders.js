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
    // event.pathParameters?.id
    var input = {
        "email_id": data.email_id,
        "username": data.username
    };
    var params = {
        TableName: "orders",
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

exports.Get = async (event) => {
    // const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "orders"
    };

    try {
        const data = await docClient.scan(params).promise();
        responseBody = JSON.stringify(data.Items);
        statusCode = 200;
    } catch (err) {
        responseBody = `Unable to get Products: ${err}`;
        statusCode = 403;
    }

    const response = {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'content-type': 'application/json'
        },
        body: responseBody
    };

    return response;
};


// delete
exports.Delete = async (event) => {
    // const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "orders",
        Key: {
            id: '12345'
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

exports.Post = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "orders",
        Item: {
            id: '12345',
            productName: "Solar Panels"
        }
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
        TableName: "orders",
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

/* -------------- */

/* Now, using API Gateway. It uses event parameter */

// PUT (post)

exports.put = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const { id, productName } = JSON.parse(event.body);

    const params = {
        TableName: "orders",
        Item: {
            id: id,
            productName: productName
        }
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

// UPDATE (put)'use strict';

exports.putStrict = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const { id, productName } = JSON.parse(event.body);

    const params = {
        TableName: "orders",
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
        TableName: "orders",
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