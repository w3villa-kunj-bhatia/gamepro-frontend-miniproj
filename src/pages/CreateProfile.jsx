import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateProfile = () => {
  const [formData, setFormData] = useState({ username: "", bio: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/profiles", formData);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create profile", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 dark:text-white text-center">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">
              Username
            </label>
            <input
              required
              className="w-full p-3 mt-1 border rounded dark:bg-slate-800 dark:text-white"
              placeholder="GamerTag123"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300">
              Bio
            </label>
            <textarea
              className="w-full p-3 mt-1 border rounded dark:bg-slate-800 dark:text-white h-32"
              placeholder="Tell us about your gaming setup..."
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-blue-400"
          >
            {loading ? "Saving..." : "Start Gaming"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
