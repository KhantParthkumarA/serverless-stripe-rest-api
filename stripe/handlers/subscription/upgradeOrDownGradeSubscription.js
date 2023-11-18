'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

const subscriptionService = require('../db/subscriptions')
const userService = require('../db/users')

module.exports.upgradeOrDownGradeSubscription = async (event) => {
  console.log('running');

  if (!event.body || !event.pathParameters?.id) {
    console.log('Nothing submitted.');

    return getResponse(400, null, 'Request not found');
  }

  try {
    const request = JSON.parse(event.body);
    const userId = event.pathParameters.id;

    const user = await userService.Get(userId)
    if (!user.Items.length) {
      return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    }
    if (!user.Items[0].stripeCustomerId) {
      return getResponse(404, JSON.stringify({ message: 'User stripe customer details does not exists' }), null);
    }

    const subscription = await subscriptionService.Get({
      userId,
    });
    if (!subscription.length) {
      return getResponse(404, JSON.stringify({ message: 'User does not have any subscription' }), null);
    }

    const currentSubscription = await stripe.subscriptions.retrieve(subscription[0].subscriptionId);

    try {
      const updateSubscription = await stripe.subscriptions.update(
        currentSubscription.id,
        {
          cancel_at_period_end: false,
          items: [
            {
              id: currentSubscription.items.data[0].id,
              price: request.priceId
            }
          ]
        }
      );
    } catch (error) {

    }

    // price key will be exist in db in case user upgrade or downgrade subscription else we can use default for any conditional verification in project 
    const updateDbSubscription = await subscriptionService.Post({
      ...subscription[0],
      userId,
      stripeSubscriptionId: currentSubscription.id,
      price: request.priceId,
      updatedAt: new Date()
    })

    const updatedUserDetails = await userService.Post({
      ...user.Items[0],
      id: user.Items[0].id,
      status: 'active',
      currentSubscriptionId: currentSubscription.id,
      updatedAt: new Date(),
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
