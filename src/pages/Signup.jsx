import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", {
        email: formData.email,
        password: formData.password,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleFacebookSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/facebook";
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <h1 className="text-3xl font-bold text-green-600">Check Your Email!</h1>
        <p className="mt-4 text-gray-600 max-w-md">
          A verification link has been sent to <strong>{formData.email}</strong>
          . Please verify your account before logging in.
        </p>
        <Link to="/login" className="mt-6 text-blue-500 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full p-2 text-white bg-red-600 rounded hover:bg-red-700 font-semibold flex justify-center items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Sign up with Google
          </button>

          <button
            type="button"
            onClick={handleFacebookSignup}
            className="w-full p-2 text-white bg-[#1877F2] rounded hover:bg-[#166fe5] font-semibold flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.647 4.504-4.647 1.299 0 2.657.232 2.657.232v2.922h-1.497c-1.49 0-1.956.925-1.956 1.874v2.25h3.297l-.527 3.47h-2.77v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Sign up with Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
