'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

module.exports.upcomingInvoices = async (event) => {
  console.log('running');
  try {
    if (!event.body) {
      console.log('Nothing submitted.');
      return getResponse(400, null, 'Request not found');
    }

    const request = JSON.parse(event.body);

    const userDetails = await userService.Get(request.userId);
    if (!userDetails.Items.length) {
      return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    }

    if (!userDetails.Items[0].stripeCustomerId) {
      return getResponse(404, JSON.stringify({ message: 'User stripe customer details does not exists' }), null);
    }

    const invoices = await stripe.invoices.retrieveUpcoming({
      customer: userDetails.Items[0].stripeCustomerId
    });

    return getResponse(200, JSON.stringify(invoices), null);
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
