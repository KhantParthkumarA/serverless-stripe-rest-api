'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

const userService = require('../db/users')
const subcriptionService = require('../db/subscriptions')

module.exports.getStripeSubscription = async (event) => {
  console.log('running');

  if (!event.pathParameters?.id) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
    const user = await userService.Get(event.pathParameters.id)
    console.log('user - ', user)
    if (!user.Items.length) {
      return getResponse(400, JSON.stringify({ message: 'User details does not exists' }), null);
    }

    const subscriptionDetails = await subcriptionService.Get({ userId: event.pathParameters.id, status: 'active' })
    console.log('subscriptionDetails - ', subscriptionDetails, typeof subscriptionDetails)
    if (!subscriptionDetails.length) {
      return getResponse(400, JSON.stringify({ message: 'User does not have any active subscription' }), null);
    }

    if (!subscriptionDetails[0].id) {
      return getResponse(400, JSON.stringify({ message: 'Invalid subscription details' }), null);
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionDetails[0].subscriptionId);

    return getResponse(200, JSON.stringify(subscription), null);
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
