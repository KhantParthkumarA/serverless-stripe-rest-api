'use strict';

const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const AWS = require('aws-sdk');

const subscriptionService = require('../db/subscriptions');
const userService = require('../db/users');

const config = require('../../../env')
let awsConfig = {
    "region": "us-east-1",
    "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
    "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

module.exports.createStripeProduct = async (event) => {
  console.log('running');

  if (!event.body) {
    console.log('Nothing submitted.');
    return getResponse(400, null, 'Request not found');
  }
  const request = JSON.parse(event.body);

  try {
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: request.price * 100,
      recurring: {
        interval: request.interval,
      },
      product_data: {
        name: request.productName,
      },
    });
    if (!price?.id) {
      return getResponse(
        400,
        JSON.stringify({
          status: 'error',
          message: 'Failed to generate stripe product'
        }),
        null
      )
    }

    var params = {
      TableName: "products",
      Item: { ...price, name: request.productName }
    };
    return new Promise((rs, rj) => {
      docClient.put(params, function (err, data) {
        console.log(err, data)
        if (err) {
          console.log("users::save::error - " + JSON.stringify(err, null, 2));
          const result = getResponse(
            200,
            JSON.stringify({
              status: 'error',
              message: 'Failed to generate stripe product'
            }),
            null
          )
          rs(result)
        } else {
          console.log("users::save::success", data);
          const result = getResponse(
            200,
            JSON.stringify({
              status: 'success',
              data,
            }),
            null
          )
          rs(result)
        }
      });
    })





    // const request = JSON.parse(event.body);

    // if (!request.paymentMethodId) {
    //   return getResponse(400, JSON.stringify({ message: 'payment method id is required' }), null);
    // }
    // const userDetails = await userService.Get(request.userId);
    // if (!userDetails.Items.length) {
    //   return getResponse(404, JSON.stringify({ message: 'User details does not exists' }), null);
    // }
    // if (!userDetails.Items[0].currentSubscriptionId) {
    //   return getResponse(404, JSON.stringify({ message: 'User stripe customer details does not exists' }), null);
    // }

    // try {
    //   // TODO: This will attached payment method into stripe customer so for future payments this same payment method (card) will be used
    //   await stripe.paymentMethods.attach(
    //     request.paymentMethodId,
    //     {
    //       customer: userDetails.Items[0].currentSubscriptionId
    //     }
    //   );

    //   // TODO: for future auto debit from same card will required to set as default 
    //   let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
    //     userDetails.Items[0].currentSubscriptionId,
    //     {
    //       invoice_settings: {
    //         default_payment_method:
    //           request.paymentMethodId
    //       }
    //     }
    //   );
    // } catch (error) {
    //   // return getResponse(400, JSON.stringify({ message: error.message }), null);
    // }

    // const subscriptions = await stripe.subscriptions.list({ customer: userDetails.Items[0].currentSubscriptionId, status: 'active' });
    // console.log('subscriptions.data?.length- ', subscriptions.data?.length)
    // // TODO: this will avoid to create multiple subscription and update only price of current subscription and only user subscription price upgraded not product price upgraded
    // if (subscriptions.data?.length) {
    //   const subscription = subscriptions.data[0];
    //   const updatedSubscription = await stripe.subscriptions.update(
    //     subscription.id,
    //     {
    //       cancel_at_period_end: false,
    //       items: [
    //         {
    //           // id: subscription.items.data[0].id,
    //           price: request.planId
    //         }
    //       ]
    //     }
    //   );
    //   console.log('updatedSubscription- ', updatedSubscription)

    //   const subscriptionDetails = await subscriptionService.create({
    //     userId: request.userId,
    //     status: 'active',
    //     currentSubscriptionId: subscription.id,
    //     updatedAt: new Date(),
    //     id: String(userDetails.Items[0].id) + Date.now()
    //   })
    //   console.log('subscriptionDetails- ', subscriptionDetails)
    //   const updatedUserDetails = await userService.Post({
    //     ...userDetails.Items[0],
    //     id: userDetails.Items[0].id,
    //     status: 'active',
    //     currentSubscriptionId: subscription.id,
    //     updatedAt: new Date(),
    //   })

    //   return getResponse(200, JSON.stringify({ subscriptionDetails, stripeSubscription: updatedSubscription }), null);
    // }
    // const subscription = await stripe.subscriptions.create({
    //   customer: userDetails.Items[0].currentSubscriptionId,
    //   items: [{ plan: request.planId }],
    //   expand: ['latest_invoice.payment_intent'],
    //   metadata: {
    //     userid: request.userId
    //   }
    // });
    // console.log('subscription1- ', subscription)

    // const subscriptionDetails = await subscriptionService.create({
    //   userId: userDetails.Items[0].id,
    //   status: 'active',
    //   currentSubscriptionId: subscription.id,
    //   updatedAt: new Date(),
    //   id: String(userDetails.Items[0].id) + Date.now()
    // })
    // console.log('subscriptionDetails1- ', subscriptionDetails)

    // const updatedUserDetails = await userService.Post({
    //   ...userDetails.Items[0],
    //   id: userDetails.Items[0].id,
    //   status: 'active',
    //   currentSubscriptionId: subscription.id,
    //   updatedAt: new Date(),
    // })
    // console.log('updatedUserDetails1- ', updatedUserDetails)

    // return getResponse(200, JSON.stringify({ subscriptionDetails, stripeSubscription: subscription }), null);
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
