import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data.user);
    } catch (err) {
      console.error("Session check failed:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      localStorage.setItem("token", urlToken);

      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkUser();
  }, [checkUser]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const userData = res.data.data.user;
      const token = res.data.data.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout backend call failed", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkUser }}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
