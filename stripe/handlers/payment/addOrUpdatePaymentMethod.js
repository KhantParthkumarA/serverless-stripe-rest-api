'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

module.exports.addOrUpdatePaymentMethod = async (event) => {
  console.log('running');

  if (!event.body) {
    console.log('Nothing submitted.');

    return getResponse(400, null, 'Request not found');
  }

  const request = JSON.parse(event.body);

    if (!request.paymentMethodId) {
      return getResponse(400, JSON.stringify({ message: 'payment method id is required' }), null);
    }
    const userDetails = await userService.Get(request.userId);
    if (!userDetails.Items.length) {
      return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    }
    if (!userDetails.Items[0].stripeCustomerId) {
      return getResponse(404, JSON.stringify({ message: 'User stripe customer details does not exists' }), null);
    }

    try {
      // TODO: This will attached payment method into stripe customer so for future payments this same payment method (card) will be used
      await stripe.paymentMethods.attach(
        request.paymentMethodId,
        {
          customer: userDetails.Items[0].stripeCustomerId
        }
      );

      // TODO: for future auto debit from same card will required to set as default 
      let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
        userDetails.Items[0].stripeCustomerId,
        {
          invoice_settings: {
            default_payment_method:
              request.paymentMethodId
          }
        }
      );
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
