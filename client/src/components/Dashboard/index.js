import { cancleActivePlan, checkout, getPlans, getSubscriptions } from 'Api/User/suggestPlan';
import Logout from 'auth/Logout'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([])
  const [subscriptions, setSubscriptions] = useState([])

  const getPlan = async () => {
    const response = await getPlans();
    if (response.length) {
      setPlans(response)
    }
    console.log('plans - ', response)
  };

  const getSubscription = async () => {
    const response = await getSubscriptions();
    if (response.length) {
      setSubscriptions(response)
    }
    console.log('subscriptions - ', response)
  };

  useEffect(() => {
    getPlan()
    getSubscription();
  }, [])

  const handleClickLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };
  const checkoutPlan = async (id) => {
    const result = await checkout({
      "success_url": "http://localhost:3000",
      "priceId": id,
      "userId": localStorage.getItem('userId')
    })
    console.log('checkout response - ', result)
    window.open(result.url)
  }

  const getPlanStatus = (id) => {
    const is = subscriptions.find(s => s.price === id)
    console.log('plssdd - ', is, subscriptions, id)
    if (is && is.stripeSubscription.status === 'active') {
      if (is.stripeSubscription.canceled_at && new Date(is.stripeSubscription.current_period_end * 1000).getTime() > new Date().getTime()) {
        return 'Canceled_Active'
      } else {
        return 'Active'
      }
    }
    else if (is && is.status === 'canceled') return 'Canceled'
    else return 'none'
    // todo handle cancled peroid still active case 
  }

  const canclePlan = async (price, cancel) => {
    const subscriptionDetails = subscriptions.find(s => s.price === price)
    const response = await cancleActivePlan(
      {
        cancel,
        currentSubscriptionId: subscriptionDetails.currentSubscriptionId
      }
    );
  }

  const getEndsIn = (id) => {
    const is = subscriptions.find(s => s.price === id)
    if (!is || !is?.stripeSubscription?.canceled_at) return "";

    // const canceledAtDate = new Date(is.stripeSubscription.canceled_at * 1000);

    // // Calculate the difference in milliseconds between now and canceledAtDate
    // const timeDifference = canceledAtDate - new Date();
    
    // // Calculate remaining days, hours, and minutes
    // const daysRemaining = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
    // const hoursRemaining = Math.floor((timeDifference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    // const minutesRemaining = Math.floor((timeDifference % (60 * 60 * 1000)) / (60 * 1000));
    return `Plan will ends at ${new Date(is.stripeSubscription.canceled_at * 1000)}`
  }

  return <div style={{ width: '100vw', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
    <h3>{localStorage.getItem('userName')}</h3>
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: '80%', height: 'auto', justifyContent: 'space-evenly' }}>
      {plans.map(plan => {
        const planStatus = getPlanStatus(plan.id)
        const endsInDurations = getEndsIn(plan.id)

        return (
          <div style={{ width: '20%', border: '1px solid black', textAlign: 'center', marginTop: '5em', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '1em' }}>
            <div>
              <h2>{plan.name}</h2>
              <h1>${plan.unit_amount / 100}</h1>
              <h3>{planStatus !== 'Canceled_Ative' ? endsInDurations : 'Active'}</h3>
            </div>
            {planStatus === 'Active'
              ? <button onClick={() => canclePlan(plan.id, true)} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', border: 'none', padding: '1em', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              : planStatus === 'Canceled_Active' ? <button onClick={() => canclePlan(plan.id, false)} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', border: 'none', padding: '1em', borderRadius: '10px', cursor: 'pointer' }}>Re Active</button>
                : planStatus === 'Canceled' ? <button onClick={() => checkoutPlan(plan.id)} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', border: 'none', padding: '1em', borderRadius: '10px', cursor: 'pointer' }}>Subscribe</button>
                  : <button onClick={() => checkoutPlan(plan.id)} style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', border: 'none', padding: '1em', borderRadius: '10px', cursor: 'pointer' }}>Subscribe</button>
            }
          </div>
        )
      })}
    </div>
    <button style={{ backgroundColor: 'red', color: 'white', fontWeight: 'bold', padding: '.5em', border: 'none', cursor: 'pointer', float: 'right', height: '30px' }} onClick={() => handleClickLogout()}>Logout</button>
  </div>
}

export default Dashboard
