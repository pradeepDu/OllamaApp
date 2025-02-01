import { useState, useEffect } from "react";
import { storageKey } from "../utils";

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(storageKey);
    setIsAuthenticated(!!token); // Set to true if token exists, otherwise false
  }, []);

  return isAuthenticated;
}

export default useAuth;
