'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

const userService = require('../db/users')

module.exports.deleteStripeCustomer = async (event) => {
  console.log('running');

  if (!event.pathParameters?.id) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
    const customerId = event.pathParameters.id;

    const userDetails = await userService.Get(customerId)
    if (userDetails.Items.length) {
      const deleted = await stripe.customers.del(userDetails.Items[0].stripeCustomerId);
      return getResponse(200, JSON.stringify(deleted), null);
    } else {
      return getResponse(200, JSON.stringify({ 'message': 'User does not exists' }), null);
    }
  } catch (error) {
    return getResponse(400, null, error);
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
