import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Dashboard from "components/Dashboard";
import { PrivateRoute, PublicRoute } from "Routes/protectedRoute";
import LoginForm from "auth/Login";
import RegistrationForm from "auth/Registration";

const PrivateRoutes = [
  { path: "/", element: Dashboard },
];

const PublicRoutes = [
  { path: "/login", element: LoginForm },
  { path: "/registration", element: RegistrationForm },
];

const Page404 = (
  <>Not found</>
)

function HandleRoutes() {
  return (
    <Router>
      <Routes>
        {PrivateRoutes.map(({ path, element: Component }) => {
          const role = path.split("/")[1] === "admin" ? "admin" : "user";
          return (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute path={path} role={role}>
                  <Component />
                </PrivateRoute>
              }
            />
          );
        })}
        {PublicRoutes.map(({ path, element: Component }) => {
          return (
            <Route
              key={path}
              path={path}
              element={
                <PublicRoute>
                  <Component />
                </PublicRoute>
              }
            />
          );
        })}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </Router>
  );
}

export default HandleRoutes;
