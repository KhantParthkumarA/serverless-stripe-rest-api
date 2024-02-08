import axios from "axios";

export const getUserDetails = async () => {
  try {
    const response = await axios.get(`/api/users`, {
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const updateUserSetting = async (data) => {
  try {
    const response = await axios.put(`/api/users`, data, {
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};
