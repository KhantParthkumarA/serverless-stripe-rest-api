'use strict';

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });
const tableName = 'Subscription';

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
    return getResponse(400, null, error);
  }
};

async function invoicePaymentFailed(data) {
  console.log(`\n stripe_debug_${eventType} >>>>>>>>`, JSON.stringify(data));
  // console.log("🚀 ~ file: subscription.controller.ts:575 ~ webhook ~ data.object.billing_reason ==:", data.object.billing_reason == "subscription_cycle")
  try {
    console.log("🚀 ~ file: subscription.controller.ts:490 ~ webhook ~ data.object.billing_reason:", data.object.billing_reason == "subscription_cycle")
    console.log("🚀 ~ file: subscription.controller.ts:502 ~ webhook ~ data.object.metadata.user_id:", data.object.subscription_details.metadata.userid)
    if (data.object.billing_reason == "subscription_cycle") {
      const user_id = data.object.metadata.userid;

      const userDetials = await userService.Get(user_id);

      if (userDetials.Items.length) {
        // update record in db by userid
        const result = await userServices.Post({
          ...userDetials.Items[0],
          id: user_id,
          stripeCustomerId: customer_id,
          email_id: request.email,
          currentPlanId: null
        })
      }
      const updateDbSubscription = await subscriptionService.delete(data.object.id)

      return getResponse(200, { message: `subscription ${data.object.status}` }, null)

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
  console.log(`\n stripe_debug_${eventType} >>>>>>>>`, JSON.stringify(data));
  // This Event is used to reset usage in USER table and Deleting subscription from Subscription table
  const user_id = data.object.metadata.userid;

  const deactiveStatus = ["canceled", "ended"];
  const userDetials = await userService.Get(user_id);
  try {
    if (deactiveStatus.includes(data.object.status)) {
      if (userDetials.Items.length) {
        // update record in db by userid
        const result = await userServices.Post({
          ...userDetials.Items[0],
          id: user_id,
          stripeCustomerId: customer_id,
          email_id: request.email,
          currentPlanId: null
        })
      }
      const updateDbSubscription = await subscriptionService.delete(data.object.id)
    }
    return getResponse(200, { message: `subscription ${data.object.status}` }, null)

  } catch (error) {
    return getResponse(200, { message: `Fail to delete subscription ${id}` }, error)
  }

}

async function customerSubscriptionUpdated(data) {
  // TODO: update dynamo

  return getResponse(200, null, null);
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
  id,
  customer_id,
  subscription_id
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

    const updateDbSubscription = await subscriptionService.Post({
      userId: id,
      stripeSubscriptionId: subscription_id,
      status: 'active',
      updatedAt: new Date(),
      start_date,
      end_date,
    })

    const userDetials = await userService.Get(id);

    if (userDetials.Items.length) {
      // update record in db by userid
      const result = await userServices.Post({
        ...userDetials.Items[0],
        id: id,
        stripeCustomerId: customer_id,
        email_id: request.email,
        currentPlanId: subscription_id
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

    await handlePaymentSuccess(
      data.object.subscription_details.metadata.userid,
      data.object.customer,
      data.object.subscription
    );

    return getResponse(
      200,
      { message: `billing_reason: ${data.object.billing_reason}, User:${data.object.customer} :  Success` },
      null
    )
  } catch (error) {
    console.log(`\n Error:billing_reason: ${data.object.billing_reason}, User:${data.object.customer}  `, error)
    return getResponse(
      400,
      { message: `billing_reason: ${data.object.billing_reason}, User:${data.object.customer}:  failed` },
      error
    )
  }
}
