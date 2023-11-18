var AWS = require("aws-sdk");
const config = require('../../../env')
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

module.exports.Create = function (event) {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    var params = {
        TableName: "products",
        Item: request
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

// List 

exports.List = async (event) => {
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "products"
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

// get
exports.Get = async (event) => {
    const id = event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "products",
        Key: {
            id
        }
    };

    try {
        const data = await docClient.scan(params).promise();
        responseBody = JSON.stringify(data);
        statusCode = 204;
    } catch (err) {
        responseBody = `Unable to get Product: ${err}`;
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

// delete
exports.Delete = async (event) => {
    const id = event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "products",
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

exports.Update = async (event) => {
    const request = JSON.parse(event.body);
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "products",
        Item: request
    };
    // pass id into body
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

exports.UpdateByExpression = async (event) => {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "products",
        Key: {
            id: '12345'
        },
        UpdateExpression: "set name = :n",
        ExpressionAttributeValues: {
            ":n": request.name
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
