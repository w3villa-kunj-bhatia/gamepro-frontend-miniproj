import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../../api/axios";
import Loader from "../../components/Loader";

const Users = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const planFilter = searchParams.get("plan") || "";
  const page = parseInt(searchParams.get("page")) || 1;

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateFilters({ search: localSearch, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search]);

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
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
    fetchUsers(page);
  }, [search, planFilter, page]);

  const updateFilters = (newParams) => {
    const nextParams = {
      search: newParams.search !== undefined ? newParams.search : search,
      plan: newParams.plan !== undefined ? newParams.plan : planFilter,
      page: newParams.page || 1,
    };

    Object.keys(nextParams).forEach((key) => {
      if (nextParams[key] === "" || nextParams[key] === undefined) {
        delete nextParams[key];
      }
    });

    setSearchParams(nextParams);
  };

  const handleToggleBlock = async (userId) => {
    try {
      await axios.patch(`/admin/users/${userId}/status`);
      fetchUsers(page);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
        Manage Users
      </h1>

      <div className="flex flex-wrap gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <input
          type="text"
          placeholder="Search by email or username..."
          className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        <select
          className="p-2 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white cursor-pointer transition-colors"
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
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="p-4">User Identity</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Current Plan</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {user.email}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Role: <span className="uppercase">{user.role}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        user.isVerified
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {user.isVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="p-4 capitalize">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        user.plan === "gold"
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50"
                          : user.plan === "silver"
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                            : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50"
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleBlock(user._id)}
                      className={`min-w-[80px] px-3 py-1.5 rounded-lg text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
                        user.isBlocked
                          ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                          : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                      }`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Records: {pagination.total}
            </div>
            <div className="flex items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => updateFilters({ page: page - 1 })}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => updateFilters({ page: page + 1 })}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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
