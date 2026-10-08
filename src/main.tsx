import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store";
import { setupAxiosInterceptors } from "./Slices/Utils/axiosInstance";
import { logout } from "./Slices/authSlice";

setupAxiosInterceptors(store, logout);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
