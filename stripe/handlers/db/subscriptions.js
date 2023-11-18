var AWS = require("aws-sdk");
const config = require('../../../env')
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

module.exports.create = async function (data) {
    var params = {
        TableName: "subscriptions",
        Item: data
    };
    console.log(data)
    const result = await docClient.put(params).promise();
    console.log('result - ', result)
    return result;
}


// GET 

exports.Get = async (query) => {
    // const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "subscriptions",
        ...query
    };

    try {
        const data = await docClient.scan(params).promise();
        responseBody = data.Items;
    } catch (err) {
        responseBody = { message: `Unable to get Products: ${err}` };
        statusCode = 403;
    }

    return responseBody;
};


// delete
exports.Delete = async (id) => {
    // const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "subscriptions",
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
    console.log('dataaa - ', data)
    const params = {
        TableName: "subscriptions",
        Item: {
            userId: data.userId,
            status: data.status,
            subscriptionId: data.stripeSubscriptionId,
            updatedAt: data.updatedAt,
            price: data.price ? data.price : undefined
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
        TableName: "subscriptions",
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
        TableName: "subscriptions",
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
        TableName: "subscriptions",
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
        TableName: "subscriptions",
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