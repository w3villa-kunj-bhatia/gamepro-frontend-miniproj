import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (userData.role === "admin") {
        navigate("/admin/users");
      } else {
        try {
          await api.get("/profile/me");

          const from = location.state?.from?.pathname || "/dashboard";
          navigate(from);
        } catch (err) {
          if (err.response?.status === 404) {
            navigate("/create-profile");
          } else {
            navigate("/dashboard");
          }
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

const handleGoogleLogin = () => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${baseURL}/auth/google`;
  };

  const handleFacebookLogin = () => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${baseURL}/auth/facebook`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-200"
      >
        <h2 className="mb-6 text-3xl font-black text-center text-gray-800 tracking-tighter uppercase">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center font-bold">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 text-white font-black uppercase tracking-widest rounded-xl transition-all ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200"
            }`}
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </div>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-400 text-xs font-bold tracking-widest uppercase">
            OR
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full p-3 text-white bg-red-600 rounded-xl hover:bg-red-700 font-bold flex justify-center items-center gap-2 shadow-lg shadow-red-100 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full p-3 text-white bg-[#1877F2] rounded-xl hover:bg-[#166fe5] font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.647 4.504-4.647 1.299 0 2.657.232 2.657.232v2.922h-1.497c-1.49 0-1.956.925-1.956 1.874v2.25h3.297l-.527 3.47h-2.77v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Sign in with Facebook
          </button>
        </div>

        <p className="mt-6 text-sm text-center text-gray-600">
          New Operative?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-bold hover:underline"
          >
            Join Now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
