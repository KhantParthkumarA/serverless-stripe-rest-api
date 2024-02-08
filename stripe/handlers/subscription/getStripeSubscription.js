'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);

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
    if (!user.Items.length) {
      return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    }
    if (!user.Items[0].stripeCustomerId) {
      return getResponse(404, JSON.stringify({ message: 'User stripe customer details does not exists' }), null);
    }
    const subscriptionDetails = await subcriptionService.Get({ 
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
          ":userId": event.pathParameters.id
      }
    })
    console.log('subscriptionDetails - ', subscriptionDetails, typeof subscriptionDetails)

    const stripeSubscription = await Promise.all(subscriptionDetails.map(async data => {
      try {
        data.stripeSubscription = await stripe.subscriptions.retrieve(data.currentSubscriptionId)
        return data;
      } catch (error) {
        return data;
      }
    }))

    return getResponse(200, JSON.stringify(stripeSubscription), null);
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
