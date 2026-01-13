import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import Loader from "../../components/Loader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  // Fetch users with query params
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/users", {
        params: { search, plan: planFilter, page, limit: 10 },
      });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on filter or search change
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, planFilter]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded shadow-sm">
        <input
          type="text"
          placeholder="Search users by email..."
          className="p-2 border rounded w-full md:w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* User List Table */}
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.plan === "gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.plan === "silver"
                          ? "bg-gray-200 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm ${
                        user.isVerified ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {user.isVerified ? "● Verified" : "○ Unverified"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="p-4 bg-gray-50 flex justify-center items-center gap-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-white"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
