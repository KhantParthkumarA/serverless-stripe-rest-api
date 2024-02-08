import axios from "axios";

export const getCheckoutList = async () => {
  try {
    const response = await axios.get("/api/users/checkouts", {
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};


export const addCheckoutList = async (data) => {
  try {
    const response = await axios.post("/api/users/checkouts", data ,{
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};


export const deleteCheckoutList = async (data) => {
    try {
      const response = await axios.post("/api/users/checkouts/delete", data ,{
        headers: { token: localStorage.getItem("token") },
      });
      return response.data;
    } catch (error) {
      return { error };
    }
  };
  

  export const verifyExistingPlan = async (data) => {
      try {
        const response = await axios.post("/api/payment/exisitng-plan", data ,{
          headers: { token: localStorage.getItem("token") },
        });
        return response.data;
      } catch (error) {
        return { error };
      }
    };