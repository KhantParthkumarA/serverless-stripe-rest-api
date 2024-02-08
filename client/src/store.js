import { configureStore } from "@reduxjs/toolkit";
// import checkoutReducer from "./utils/checkoutSlice";

export const store = configureStore({
  reducer: {
    // user: checkoutReducer,
  },
});
