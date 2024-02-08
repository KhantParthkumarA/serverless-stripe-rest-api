'use strict';

const AWS = require('aws-sdk');
const stripeSecret = 'sk_test_51O3ObsJDvifNBMqnhYzPwcePEGfPf8ZvRIdkyt5r4l1QAKhliKFWhVeVYCzDiuui1W6HvvZX1DTn0oCsdpCDC5k100TwErhOon';
const stripe = require('stripe')(stripeSecret);
const config = require('../../../env')
let awsConfig = {
  "region": "us-east-1",
  "endpoint": "http://dynamodb.us-east-1.amazonaws.com",
  "accessKeyId": config.accesskey, "secretAccessKey": config.secretkey
};
AWS.config.update(awsConfig);

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'subscriptions';

const userService = require('../db/users')
const subscriptionService = require('../db/subscriptions')

module.exports.webhook = async (event) => {
  console.log('running');
  if (!event.body) {
    console.log('Nothing submitted.');

    return getResponse(400, null, 'Request not found');
  }

  try {
    const { data, type } = JSON.parse(event.body);
    switch (type) {
      case 'invoice.payment_failed': return await invoicePaymentFailed(data);
      case 'invoice.payment_succeeded': return await invoicePaymentSucceeded(data);
      case 'customer.subscription.deleted': return await customerSubscriptionDeleted(data);
      case 'customer.subscription.updated': return await customerSubscriptionUpdated(data);
      case 'customer.subscription.created': return await customerSubscriptionCreated(data);
      default: return await handleUnknownType(type, data);
    }
  } catch (error) {
    return getResponse(400, JSON.stringify({ message: error.message }), null);
  }
};

async function invoicePaymentFailed(data) {
  console.log(`\n stripe_debug >>>>>>>>`, JSON.stringify(data));
  // console.log("🚀 ~ file: subscription.controller.ts:575 ~ webhook ~ data.object.billing_reason ==:", data.object.billing_reason == "subscription_cycle")
  try {
    console.log("🚀 ~ file: subscription.controller.ts:490 ~ webhook ~ data.object.billing_reason:", data.object.billing_reason == "subscription_cycle")
    console.log("🚀 ~ file: subscription.controller.ts:502 ~ webhook ~ data.object.metadata.user_id:", data.object.subscription_details.metadata.userid)
    if (data.object.billing_reason == "subscription_cycle") {
      const user_id = data.object.metadata.userid;

      const userDetials = await userService.Get(user_id);

      if (userDetials.Items.length) {
        // update record in db by userid
        const result = await userService.Post({
          ...userDetials.Items[0],
          id: user_id,
          currentSubscriptionId: null
        })
      }
      const updateDbSubscription = await subscriptionService.Delete(data.object.id)

      return getResponse(200, JSON.stringify({ message: `subscription ${data.object.status}` }), null)

    }

  } catch (err) {
    console.log("Error in payment failed evenr:", err)
    return res.status(500).json({ Error: JSON.stringify(err) })
  }

  return getResponse(200, null, null);
}

async function invoicePaymentSucceeded(data) {
  // TODO: update dynamo

  // TODO: send out notification
  handlePayment(data, 'invoice.payment_succeeded')
  return getResponse(200, null, null);
}

async function customerSubscriptionDeleted(data) {
  // TODO: update dynamo
  console.log(`\n stripe_debug >>>>>>>>`, JSON.stringify(data));
  // This Event is used to reset usage in USER table and Deleting subscription from Subscription table

  const deactiveStatus = ["canceled", "ended"];
  const userDetials = await userService.GetByFilter({
    FilterExpression: "stripeCustomerId = :stripeCustomerId",
    ExpressionAttributeValues: {
      ":stripeCustomerId": data.object.customer
    }
  });
  try {
    if (deactiveStatus.includes(data.object.status)) {
      if (userDetials.Items.length) {
        // update record in db by userid
        const result = await userService.Post({
          ...userDetials.Items[0],
          currentSubscriptionId: null
        })
      }
      const updateDbSubscription = await subscriptionService.Delete(data.object.id)
    }
    return getResponse(200, JSON.stringify({ message: `subscription ${data.object.status}` }), null)

  } catch (error) {
    console.log(error.message)
    return getResponse(200, JSON.stringify({ message: `Fail to delete subscription ${data.object.id}` }), error)
  }

}

async function customerSubscriptionUpdated(data) {
  // TODO: update dynamo
  // TODO: update dynamo
  console.log(`\n stripe_debug >>>>>>>>`, JSON.stringify(data));
  // This Event is used to reset usage in USER table and Deleting subscription from Subscription table

  const deactiveStatus = ["canceled", "ended"];
  const activeStatus = ["active"];

  const userDetials = await userService.GetByFilter({
    FilterExpression: "stripeCustomerId = :stripeCustomerId",
    ExpressionAttributeValues: {
      ":stripeCustomerId": data.object.customer
    }
  });
  console.log('userDetials - ', userDetials)
  try {
    if (deactiveStatus.includes(data.object.status)) {
      if (userDetials.Items.length) {
        // update record in db by userid
        const result = await userService.Post({
          ...userDetials.Items[0],
          currentSubscriptionId: null
        })
        console.log('result - ', result)
      }

      const updateDbSubscription = await subscriptionService.Delete(data.object.id);
      console.log('updateDbSubscription - ', updateDbSubscription)
    } else if (activeStatus.includes(data.object.status)) {
      console.log('hereeeeee - ', {
        ":a": data.object.cancel_at,
        ":b": data.object.cancel_at_period_end,
        ":c": data.object.canceled_at,
        userId: userDetials.Items[0].id,
        currentSubscriptionId: data.object.id,
      })

      const getItemParams = {
        TableName: "subscriptions",
        FilterExpression: "userId = :userId and currentSubscriptionId = :currentSubscriptionId",
        ExpressionAttributeValues: {
          ":userId": userDetials.Items[0].id,
          ":currentSubscriptionId": data.object.id,
        }
      };
      console.log('getItemParams - ', getItemParams)
      try {
        const existingItem = await docClient.scan(getItemParams).promise();
        console.log('existingItems - ', existingItem)
        if (existingItem?.Items?.length) {
          const params = {
            TableName: "subscriptions",
            Item: {
              ...existingItem.Items[0],
              userId: userDetials.Items[0].id,
              currentSubscriptionId: data.object.id,
              cancel_at: data.object.cancel_at,
              cancel_at_period_end: data.object.cancel_at_period_end,
              canceled_at: data.object.canceled_at,
            },
          };
          console.log('params - ', params)
          const subscriptionData = await docClient.put(params).promise();
          console.log('subscriptionData - ', subscriptionData)
          return getResponse(200, JSON.stringify({ message: `subscription ${subscriptionData}` }), null)
        } else {
          return getResponse(404, JSON.stringify({ message: `Subscription not found.` }), null);
        }
      } catch (err) {
        console.log('err - ', err)
        return getResponse(403, JSON.stringify({ message: `Unable to update Product: ${err}` }), null)
      }
    }
    return getResponse(200, JSON.stringify({ message: `subscription ${data.object.status}` }), null)
  } catch (error) {
    console.log(error.message)
    return getResponse(200, JSON.stringify({ message: `Fail to delete subscription ${data.object.id}` }), error)
  }
}

async function customerSubscriptionCreated(data) {
  // TODO: update dynamo

  return getResponse(200, null, null);
}

async function handleUnknownType(type, data) {
  console.log('Event Type is not configured:', type);
  console.log(JSON.stringify(data));

  // TODO: send out notification

  return getResponse(200, null, null);
}

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

// M.A : This is basically a clone of handleSuccess function , but with a couple of changes
const handlePaymentSuccess = async (
  customer_id,
  subscription_id,
  price,
  product,
  cancel_at,
  cancel_at_period_end,
  canceled_at
) => {
  // const invoice_id = session.invoice;

  // Initialize start_date and end_date
  let start_date = undefined;
  let end_date = undefined;

  /** Retrive stripe subscription */
  let stripeSubscriptionDetails;
  try {
    stripeSubscriptionDetails = await stripe.subscriptions.retrieve(
      subscription_id
    );

    if (stripeSubscriptionDetails.id) {
      start_date = new Date(stripeSubscriptionDetails.current_period_start * 1000);
      end_date = new Date(stripeSubscriptionDetails.current_period_end * 1000);
    }

    if (stripeSubscriptionDetails.default_payment_method) {
      // set customer's default payment method
      await stripe.customers.update(customer_id, {
        invoice_settings: {
          default_payment_method:
            stripeSubscriptionDetails?.default_payment_method,
        },
      });
    }

    const userDetials = await userService.GetByFilter({
      FilterExpression: "stripeCustomerId = :stripeCustomerId",
      ExpressionAttributeValues: {
        ":stripeCustomerId": customer_id
      }
    });

    if (!userDetials?.Items?.length) {
      return getResponse(
        400,
        JSON.stringify({ message: `Userdetails does not exists` }),
        null
      )
    }

    const id = userDetials?.Items[0]?.id

    const createDbSubscription = await subscriptionService.create({
      userId: id,
      currentSubscriptionId: subscription_id,
      status: 'active',
      updatedAt: String(new Date()),
      start_date: String(start_date),
      end_date: String(end_date),
      price,
      product,
      cancel_at: cancel_at,
      cancel_at_period_end: cancel_at_period_end,
      canceled_at: canceled_at,
    })
    await stripe.subscriptions.update(subscription_id, {
      metadata: {
        useid: id
      },
    });

    if (userDetials.Items.length) {
      // update record in db by userid
      const result = await userService.Post({
        ...userDetials.Items[0],
        id: id,
        currentSubscriptionId: subscription_id
      })
    }

  } catch (error) {
    console.log("Error in handlePaymentSuccess :", error)
    /** Handle retrive stripe subscription error */
  }

};


const handlePayment = async (data, eventType) => {
  try {
    console.log(`\n stripe_debug_${eventType} >>>>>>>>`, JSON.stringify(data));
    // calculate for subscription update and add login to update usage
    // "billing_reason": "subscription_update",
    console.log(
      'data.object.subscription_details.metadata.userid', data.object.subscription_details.metadata.userid,
      'data.object.customer - ', data.object.customer,
      'data.object.subscription - ', data.object.subscription
    )
    await handlePaymentSuccess(
      data.object.customer,
      data.object.subscription,
      data.object.lines.data[0].price.id,
      data.object.lines.data[0].price.product,
      data.object.cancel_at,
      data.object.cancel_at_period_end,
      data.object.canceled_at
    );

    return getResponse(
      200,
      JSON.stringify({ message: `billing_reason: ${data.object.billing_reason}, User:${data.object.customer} :  Success` }),
      null
    )
  } catch (error) {
    console.log(`\n Error:billing_reason: ${data.object.billing_reason}, User:${data.object.customer}  `, error)
    return getResponse(
      400,
      JSON.stringify({ message: `billing_reason: ${data.object.billing_reason}, User:${data.object.customer}:  failed` }),
      error
    )
  }
}
