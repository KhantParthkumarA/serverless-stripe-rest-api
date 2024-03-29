'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);

const userServices = require('../db/users')

// NOTE: call this function when user signup
module.exports.createStripeCustomer = async (event) => {

  if (!event.body) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
    const request = JSON.parse(event.body);

    validateRequest(request);

    const customer = await stripe.customers.create({
      description: 'customer',
      email: request.email,
      metadata: {
        userid: request.userId, // signed up user id for link stripe customer with db customer
      }
    });
    console.log('customer - ', customer)

    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ['card'],
      customer: customer.id
    });

    console.log('setupIntent - ', setupIntent)

    // update record in db by userid
    const result = await userServices.Post({
      id: request.userId,
      stripeCustomerId: customer.id,
      email_id: request.email
    })

    return getResponse(200, JSON.stringify({ customer, setupIntent, result }), null);
  } catch (error) {
    return getResponse(400, JSON.stringify({ message: error.message }), null);
  }
};

function validateRequest(request) {
  // TODO: validate more request properties
  var errors = [];

  if (!request.userId)
    errors.push('User Id is required.');

  if (!request.email)
    errors.push('Email is required.');

  if (errors.length)
    throw errors.join(' ');
}

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
