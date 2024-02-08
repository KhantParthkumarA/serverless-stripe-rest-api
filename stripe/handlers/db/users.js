var AWS = require("aws-sdk");

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);

const config = require('../../../env')
const { v4: uuidv4 } = require('uuid');

let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};

console.log(awsConfig)
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

function getResponse(statusCode, body, error) {
    if (error) console.log('error is  - ', error);

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

module.exports.registration = async function (data) {
    console.log('data os - ', data)
    const body = JSON.parse(data.body);
    var input = {
        "email_id": body.email,
        "password": body.password,
        "id": uuidv4()
    };

    const customers = await stripe.customers.list({
        limit: 1,
        email: body.email
    });

    if (!customers?.data?.length) {
        const stripeCustomer = await stripe.customers.create({
            description: 'customer',
            email: body.email,
            metadata: {
                userid: body.userId, // signed up user id for link stripe customer with db customer
            }
        });
        if (!stripeCustomer?.id) {
            return getResponse(
                400,
                JSON.stringify({
                    status: 'error',
                    isExisting: failed,
                    data: {
                        message: 'Failed to generate stripe customer'
                    }
                }),
                null
            )
        }
        input.stripeCustomerId = stripeCustomer.id
    } else {
        input.stripeCustomerId = customers.data[0].id;
    }

    var params = {
        TableName: "users",
        Item: input
    };
    let responseBody = "";

    try {
        responseBody = await docClient.scan({
            TableName: "users",
            FilterExpression: "email_id = :email",
            ExpressionAttributeValues: {
                ":email": body.email
            },
        }).promise();
        console.log('responseBody - ', responseBody)
        if (responseBody?.Items?.length) {
            return getResponse(
                200,
                JSON.stringify({
                    status: 'success',
                    isExisting: true,
                    data: responseBody
                }),
                null
            )
        }
    } catch (err) {
        return getResponse(
            200,
            JSON.stringify({
                status: 'error',
                isExisting: failed,
                data: {
                    message: 'Failed to fetch user details'
                }
            }),
            null
        )
        console.log('Error from fetch user details - ', err);
    }
    return new Promise((rs, rj) => {
        docClient.put(params, function (err, data) {
            console.log(err, data)
            if (err) {
                console.log("users::save::error - " + JSON.stringify(err, null, 2));
                const result = getResponse(400, JSON.stringify({ status: 'failed' }), err)
                rj(err)
            } else {
                console.log("users::save::success", data);
                const result = getResponse(200, JSON.stringify({ status: 'success', data }), null)
                rs(result)
            }
        });
    })
    // {
    //     statusCode: 200,
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //         'Access-Control-Allow-Credentials': 'true',
    //         'content-type': 'application/json'
    //     },
    //     body: 'success',
    // };
}

module.exports.login = async function (data) {
    console.log('data - ', data)
    data = JSON.parse(data.body)
    var input = {
        "email_id": data.email,
        "password": data.password
    };
    let responseBody = "";

    const params = {
        TableName: "users",
        Key: input,
    };

    console.log(params)
    try {
        responseBody = await docClient.scan({
            TableName: "users",
            FilterExpression: "email_id = :email and password = :password",
            ExpressionAttributeValues: {
                ":email": input.email_id,
                ":password": input.password
            },
        }).promise();
        console.log('responseBody - ', responseBody)
        if (!responseBody.Count) {
            return getResponse(200, JSON.stringify({ status: 'error', message: 'Unauthorised' }), null)
        }
        return getResponse(200, JSON.stringify({ status: 'success', data: { ...responseBody, token: '123' } }), null)
    } catch (err) {
        console.log('err - ', err)
        return getResponse(400, JSON.stringify({ status: 'error', data: null }), null);
    }
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

exports.GetByFilter = async (query) => {
    // const request = JSON.parse(event.body);
    // event.pathParameters?.id
    let responseBody = "";
    let statusCode = 0;

    const params = {
        TableName: "users",
        ...query,
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
    console.log('id - ', id)

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
    console.log('data - ', data)
    const params = {
        TableName: "users",
        Item: data
    };
    let result;
    try {
        result = await docClient.put(params).promise();
    } catch (err) {
        result = `Unable to put Product: ${err}`;
        statusCode = 403;
        console.log('err - ', err)
    }

    return result;
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