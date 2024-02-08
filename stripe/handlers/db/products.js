var AWS = require("aws-sdk");
const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const config = require('../../../env')
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

function getResponse(statusCode, body, error) {
    if (error) console.log('error is  - ', error);
    console.log('statusCode - ', statusCode)
    console.log('body - ', body, error)
    console.log('error - ', error)
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

module.exports.Create = async function (event) {
    const request = JSON.parse(event.body);
    // event.pathParameters?.id
    const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: request.price * 100,
        recurring: {
            interval: request.interval,
        },
        product_data: {
            name: request.productName,
        },
    });
    if (!price?.id) {
        return getResponse(
            400,
            JSON.stringify({
                status: 'error',
                message: 'Failed to generate stripe product'
            }),
            null
        )
    }

    var params = {
        TableName: "products",
        Item: { ...price, name: request.productName }
    };
    docClient.put(params, function (err, data) {
        console.log(err, data)
        if (err) {
            console.log("users::save::error - " + JSON.stringify(err, null, 2));
            return getResponse(
                200,
                JSON.stringify({
                    status: 'error',
                    message: 'Failed to generate stripe product'
                }),
                null
            )
        } else {
            console.log("users::save::success", data);
            return getResponse(
                200,
                JSON.stringify({
                    status: 'success',
                    data,
                }),
                null
            )
        }
    });
}

// List 

exports.List = async () => {
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
