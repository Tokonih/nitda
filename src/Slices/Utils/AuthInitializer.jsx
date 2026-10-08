// components/AuthInitializer.jsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loadUserFromStorage, logout } from "../authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    dispatch(loadUserFromStorage());
    setInitialized(true);

    // Sync auth state across tabs
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (!e.newValue) {
          // Logout detected in another tab
          dispatch(logout());
          window.location.href = "/login";
        } else if (e.newValue && !e.oldValue) {
          // Login detected in another tab
          dispatch(loadUserFromStorage());
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);

  if (!initialized) return null;

  return children;
};

export default AuthInitializer;
