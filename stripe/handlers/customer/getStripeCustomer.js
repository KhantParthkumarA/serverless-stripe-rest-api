'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');
const userService = require('../db/users')

module.exports.getStripeCustomer = async (event) => {
  console.log('running');

  if (!event.pathParameters?.id) {
    console.log('Nothing submitted.');

    return getResponse(400, null, 'Request not found');
  }

  try {
    const customerId = event.pathParameters.id;

    const userDetials = await userService.Get(customerId);
    if (userDetials.Items.length) {
      if (userDetials.Items[0].stripeCustomerId) {
        const customer = await stripe.customers.retrieve(userDetials.Items[0].stripeCustomerId);
        userDetials.Items[0].stripeCustomerDetails = customer
        return getResponse(200, JSON.stringify(userDetials), null);
      }
    } else {
      return getResponse(200, JSON.stringify({ message: 'User Details does not exists' }), null);
    }
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
