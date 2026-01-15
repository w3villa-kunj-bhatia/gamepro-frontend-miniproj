import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setUser(res.data.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("/auth/login", { email, password });
      const userData = res.data.data.user;
      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
