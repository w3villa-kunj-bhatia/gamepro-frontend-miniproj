import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth(); // Use login from context
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData = await login(email, password);

      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("Please verify your email before logging in.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white shadow-md rounded-lg w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">Login</h2>
        {error && (
          <p className="mb-4 text-sm text-red-500 text-center font-semibold">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full p-2 text-white bg-red-600 rounded hover:bg-red-700 font-semibold flex justify-center items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full p-2 text-white bg-[#1877F2] rounded hover:bg-[#166fe5] font-semibold flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.647 4.504-4.647 1.299 0 2.657.232 2.657.232v2.922h-1.497c-1.49 0-1.956.925-1.956 1.874v2.25h3.297l-.527 3.47h-2.77v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Sign in with Facebook
          </button>
        </div>

        <p className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
