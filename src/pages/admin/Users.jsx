// src/pages/admin/Users.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../../api/axios";
import Loader from "../../components/Loader";

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get values from URL or set defaults
  const search = searchParams.get("search") || "";
  const planFilter = searchParams.get("plan") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      // The backend service now searches both email and profile username
      const res = await axios.get("/admin/users", {
        params: { search, plan: planFilter, page: targetPage, limit: 10 },
      });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(page), 300);
    return () => clearTimeout(timer);
  }, [search, planFilter, page]);

  const updateFilters = (newParams) => {
    // Reset to page 1 on new search/filter to avoid empty results on high pages
    const nextParams = {
      search: newParams.search !== undefined ? newParams.search : search,
      plan: newParams.plan !== undefined ? newParams.plan : planFilter,
      page: newParams.page || 1,
    };
    setSearchParams(nextParams);
  };

  const handleToggleBlock = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/status`);
      fetchUsers(page); // Refresh list to reflect changes
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Search by email or username..."
          className="p-2 border rounded w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
        />
        <select
          className="p-2 border rounded outline-none focus:ring-2 focus:ring-indigo-500"
          value={planFilter}
          onChange={(e) => updateFilters({ plan: e.target.value, page: 1 })}
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-bold text-slate-500 tracking-wider">
              <tr>
                <th className="p-4">User Identity</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Current Plan</th>
                <th className="p-4">Expiry Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{user.email}</div>
                    <div className="text-xs text-slate-500 italic">
                      Role: {user.role}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        user.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.plan === "gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : user.plan === "silver"
                          ? "bg-slate-200 text-slate-800"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.planExpiresAt ? (
                      <span className="text-xs text-red-600 font-medium">
                        Expires: {new Date(user.planExpiresAt).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        N/A (Lifetime)
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleBlock(user._id)}
                      className={`min-w-[80px] px-3 py-1.5 rounded-lg text-white text-[10px] font-black uppercase tracking-widest transition-all ${
                        user.isBlocked
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-rose-600 hover:bg-rose-500"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div className="text-xs text-slate-500 font-medium">
              Total Records: {pagination.total}
            </div>
            <div className="flex items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => updateFilters({ page: page - 1 })}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-black text-slate-700 uppercase">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => updateFilters({ page: page + 1 })}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
