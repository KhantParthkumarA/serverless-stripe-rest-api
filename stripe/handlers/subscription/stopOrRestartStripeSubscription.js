'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');
const subscriptionService = require('../db/subscriptions')
const userService = require('../db/users')

module.exports.stopOrRestartStripeSubscription = async (event) => {
  console.log('running');

  if (!event.body || !event.pathParameters?.id) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
    const stopRequest = JSON.parse(event.body);
    
    const userId = event.pathParameters.id;
    const userDetails = await userService.Get(userId);
    if (!userDetails.Items.length) {
      return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    }
    if (!userDetails.Items[0].stripeCustomerId) {
      return getResponse(404, JSON.stringify({ message: 'User stripe customer details does not exists' }), null);
    }
    const subscription = await subscriptionService.Get({
      userId,
      subscriptionId: stopRequest.subscriptionId
    });

    if (!subscription.length) {
      return getResponse(404, JSON.stringify({ message: 'User does not have any subscription' }), null);
    }

    const updatedSubscription = await stripe.subscriptions.update(
      stopRequest.subscriptionId,
      { cancel_at_period_end: stopRequest.cancel }
    );

    console.log(subscription)

    const updateDbSubscription = await subscriptionService.Post({
      ...subscription[0],
      userId,
      stripeSubscriptionId: stopRequest.subscriptionId,
      status: stopRequest.cancel === true ? 'inactive' : 'active',
      updatedAt: new Date()
    })

    return getResponse(200, JSON.stringify(updateDbSubscription), null);
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
