import axios from "axios";

export const getSuggestionPlan = async (data) => {
  try {
    const response = await axios.post("/api/plans/suggestion/all", data ,{
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const getPlans = async () => {
  try {
    const response = await axios.get("http://localhost:9090/stripe/products");
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const getSubscriptions = async () => {
  try {
    const userId = localStorage.getItem('userId')
    const response = await axios.get("http://localhost:9090/stripe/subscriptions/" + userId);
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const checkout = async (data) => {
  try {
    const response = await axios.post("http://localhost:9090/stripe/subscriptions/create", data);
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const cancleActivePlan = async (data) => {
  try {
    const userId = localStorage.getItem('userId')
    const response = await axios.put(`http://localhost:9090/stripe/subscriptions/${userId}/stop-or-restart`, data);
    return response.data;
  } catch (error) {
    return { error };
  }
};