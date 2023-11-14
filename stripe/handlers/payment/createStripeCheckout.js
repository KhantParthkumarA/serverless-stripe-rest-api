'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

module.exports.createStripeCheckout = async (event) => {
  console.log('running');
  try {
    if (!event.body) {
      console.log('Nothing submitted.');
      return getResponse(400, null, 'Request not found');
    }

    const request = JSON.stringify(event.body)
    if (!event.pathParameter?.id || request.userId) {
      console.log('Nothing submitted.');

      return getResponse(400, null, 'Request not found');
    }

    const userDetails = await userService.Get(request.userId);
    if (!userDetails.Items.length) {
      return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    }

    // TODO: build line items from source
    // should contain price (object) and quantity (number)
    const lineItems = request.lineItems;

    const data = {
      customer: userDetails.Items[0].stripeCustomerId,
      success_url: request.successUrl,
      line_items: lineItems,
      mode: request.paymentMode
    };

    const session = await stripe.checkout.sessions.create(data);

    return getResponse(200, JSON.stringify(session), null);
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
