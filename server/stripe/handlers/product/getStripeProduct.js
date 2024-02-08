'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);

const userService = require('../db/users')
const subcriptionService = require('../db/subscriptions')
const productService = require('../db/products')

module.exports.getStripeProduct = async (event) => {
  console.log('running');

  if (!event.pathParameters?.id) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
    let productDetails = await productService.Get(event)
    if (productDetails.statusCode !== 204) {
      return getResponse(404, JSON.stringify({ message: 'Product details does not exists' }), null); 
    }
    productDetails = JSON.parse(productDetails.body)
    console.log('productDetails - ', productDetails)
    if (!productDetails.Count) {
      return getResponse(404, JSON.stringify({ message: 'Product details does not exists' }), null); 
    }
    productDetails = productDetails.Items[0];

    return getResponse(200, JSON.stringify(productDetails), null);
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
