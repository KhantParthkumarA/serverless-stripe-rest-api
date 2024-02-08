import axios from "axios";

export const isLoginUser = async () => {
  try {
    const response = await axios.get("/api/users", {
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};
export const getUserToken = async (param) => {
  try {
    const response = await axios.get("/api/auth/callback" + param);
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const registrationUser = async (data) => {
  try {
    const response = await axios.post("http://localhost:9090/customers/registration", data);
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const loginUser = async (data) => {
  try { // http://localhost:9090/customers/registration
    const response = await axios.post("http://localhost:9090/customers/login", data);
    return response.data;
  } catch (error) {
    return { error };
  }
};

export const updatePhone = async (data) => {
  try {
    const response = await axios.put("/api/auth/login/phone", data, {
      headers: { token: localStorage.getItem("token") },
    });
    return response.data;
  } catch (error) {
    return { error };
  }
};


