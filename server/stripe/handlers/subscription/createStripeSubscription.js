'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);

const subscriptionService = require('../db/subscriptions');
const userService = require('../db/users');

module.exports.createStripeSubscription = async (event) => {
  console.log('running');

  if (!event.body) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }

  try {
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
      // return getResponse(400, JSON.stringify({ message: error.message }), null);
    }

    const subscriptions = await stripe.subscriptions.list({ customer: userDetails.Items[0].stripeCustomerId, status: 'active' });
    console.log('subscriptions.data?.length- ', subscriptions.data?.length)
    // TODO: this will avoid to create multiple subscription and update only price of current subscription and only user subscription price upgraded not product price upgraded
    if (subscriptions.data?.length) {
      const subscription = subscriptions.data[0];
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.id,
        {
          cancel_at_period_end: false,
          items: [
            {
              // id: subscription.items.data[0].id,
              price: request.planId
            }
          ]
        }
      );
      console.log('updatedSubscription- ', updatedSubscription)

      const subscriptionDetails = await subscriptionService.create({
        userId: request.userId,
        status: 'active',
        currentSubscriptionId: subscription.id,
        updatedAt: new Date(),
        id: String(userDetails.Items[0].id) + Date.now()
      })
      console.log('subscriptionDetails- ', subscriptionDetails)
      const updatedUserDetails = await userService.Post({
        ...userDetails.Items[0],
        id: userDetails.Items[0].id,
        status: 'active',
        currentSubscriptionId: subscription.id,
        updatedAt: new Date(),
      })

      return getResponse(200, JSON.stringify({ subscriptionDetails, stripeSubscription: updatedSubscription }), null);
    }
    const subscription = await stripe.subscriptions.create({
      customer: userDetails.Items[0].stripeCustomerId,
      items: [{ plan: request.planId }],
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userid: request.userId
      }
    });
    console.log('subscription1- ', subscription)

    const subscriptionDetails = await subscriptionService.create({
      userId: userDetails.Items[0].id,
      status: 'active',
      currentSubscriptionId: subscription.id,
      updatedAt: new Date(),
      id: String(userDetails.Items[0].id) + Date.now()
    })
    console.log('subscriptionDetails1- ', subscriptionDetails)

    const updatedUserDetails = await userService.Post({
      ...userDetails.Items[0],
      id: userDetails.Items[0].id,
      status: 'active',
      currentSubscriptionId: subscription.id,
      updatedAt: new Date(),
    })
    console.log('updatedUserDetails1- ', updatedUserDetails)

    return getResponse(200, JSON.stringify({ subscriptionDetails, stripeSubscription: subscription }), null);
  } catch (error) {
    // return getResponse(400, JSON.stringify({ message: error.message }), null);
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
