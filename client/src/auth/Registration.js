import React, { useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { registrationUser } from "Api/User/authUser";

const RegistrationForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate();
  const handleSubmit = async () => {
    setIsLoading(true);
    const response = await registrationUser({ email: form.email, password: form.password });
    if (response.isExisting) {
      // setValue("Invalid Otp");
      alert('Email already used!!!')
      return false;
    }
    if (response?.status === 'success') {
      navigate("/login");
    }
    setIsLoading(false);
  };
  return (
    <>

      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
        marginTop: "20vh",
        width: "50vw",
        height: "50vh",
        border: '1px solid black'
      }}>
        <h1>Registration</h1>
        <input
          type="email"
          name="email"
          placeholder="Enter the email"
          value={form.email}
          onChange={(e) => {
            setForm(prev => {
              return {
                ...prev,
                email: e.target.value
              }
            })
          }}
          style={{
            padding: '1em',
            border: "2px solid green",
            width: '70%',
            backgroundColor: "white"
          }}
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Enter the password"
          value={form.password}
          onChange={(e) => {
            setForm(prev => {
              return {
                ...prev,
                password: e.target.value
              }
            })
          }}
          style={{
            padding: '1em',
            border: "2px solid green",
            width: '70%',
            backgroundColor: "white"
          }}
        /><br /><br />
        <button
          type="button"
          style={{
            padding: ".7em 2em",
            background: 'green',
            border: 'none',
            color: "#fff",
            cursor: 'pointer'
          }}
          disabled={isLoading}
          onClick={handleSubmit}
        >Registration</button>
        <p>Existing user? click <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/login")}>here</span></p>
      </div>
    </>
  );
};

export default RegistrationForm;
