'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

const subscriptionService = require('../db/subscriptions')

module.exports.deleteStripeSubscription = async (event) => {
  console.log('running');

  if (!event.pathParameters?.id) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
    const request = JSON.parse(event.body);
    const userId = event.pathParameters.id;

    const subscription = await subscriptionService.Get({
      userId,
    });

    if (!subscription.length) {
      return getResponse(404, JSON.stringify({ message: 'User does not have any subscription' }), null);
    }

    const currentSubscription = await stripe.subscriptions.retrieve(subscription[0].subscriptionId);

    await stripe.subscriptions.cancel(currentSubscription.id);

    // price key will be exist in db in case user upgrade or downgrade subscription else we can use default for any conditional verification in project 
    const updateDbSubscription = await subscriptionService.Post({
      ...subscription[0],
      userId,
      stripeSubscriptionId: currentSubscription.id,
      price: subscription.price,
      updatedAt: new Date(),
      status: 'canceled'
    })

    return getResponse(200, JSON.stringify(updateDbSubscription), null);

  } catch (error) {
    return getResponse(400, null, error);
  }

  // try {
  //   const subscriptionId = event.pathParameters.id;
  //   const subscription = await stripe.subscriptions.cancel(subscriptionId);

  //   return getResponse(200, JSON.stringify(subscription), null);
  // } catch (error) {
  //   return getResponse(400, null, error);
  // }
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
