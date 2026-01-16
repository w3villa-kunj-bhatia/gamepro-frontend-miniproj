import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CheckIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 011.04-.207z"
      clipRule="evenodd"
    />
  </svg>
);

const Plans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "free",
      name: "Free Agent",
      price: 0,
      description: "Basic access to the command center.",
      features: [
        "3 Games in Library",
        "3 Saved Profiles",
        "Standard Support",
        "Community Access",
      ],
      color: "blue",
      popular: false,
    },
    {
      id: "silver",
      name: "Silver Operative",
      price: 9.99,
      description: "Enhanced clearance for serious players.",
      features: [
        "5 Games in Library",
        "5 Saved Profiles",
        "Priority Support",
        "30-Minute Sessions",
        "Profile Badge ⚔️",
      ],
      color: "slate",
      popular: false,
    },
    {
      id: "gold",
      name: "Gold Commander",
      price: 19.99,
      description: "Top-tier access with maximum limits.",
      features: [
        "10 Games in Library",
        "10 Saved Profiles",
        "VIP 24/7 Support",
        "1-Hour Sessions",
        "Profile Badge 👑",
        "Early Access Features",
      ],
      color: "amber",
      popular: true,
    },
  ];

  const handleUpgrade = async (planId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (planId === "free") return;

    if (user.plan === planId) return;

    try {
      setLoading(true);
      const res = await api.post("/payment/create-session", { planId });

      if (res.data?.data?.url) {
        window.location.href = res.data.data.url;
      } else {
        alert("Failed to initialize payment gateway.");
      }
    } catch (err) {
      console.error("Upgrade failed", err);
      const msg =
        err.response?.data?.message || "Payment initialization failed.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300 py-20 px-4">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-blue-600 dark:text-blue-400 font-bold tracking-wide uppercase text-sm mb-3">
          Membership Tiers
        </h2>
        <h1 className="text-4xl md:text-5xl font-black mb-6">
          Choose Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Clearance Level
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock more slots, exclusive badges, and extended session times.
          Upgrade your arsenal today.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = user?.plan === plan.id;
          const isGold = plan.id === "gold";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col p-8 bg-white dark:bg-slate-900 rounded-3xl transition-all duration-300
                ${
                  isGold
                    ? "border-2 border-amber-500 shadow-amber-500/20 shadow-xl scale-105 z-10"
                    : "border border-gray-200 dark:border-slate-800 shadow-lg hover:border-blue-500/50"
                }
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 capitalize">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="text-gray-500 font-medium">/month</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <CheckIcon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isGold ? "text-amber-500" : "text-blue-500"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || isCurrentPlan || plan.id === "free"}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg
                  ${
                    isCurrentPlan
                      ? "bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-default border border-transparent"
                      : isGold
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25 active:scale-95"
                      : "bg-gray-900 dark:bg-white text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-95"
                  }
                  ${loading ? "opacity-70 cursor-wait" : ""}
                `}
              >
                {loading && !isCurrentPlan ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : isCurrentPlan ? (
                  "Current Plan"
                ) : plan.id === "free" ? (
                  "Basic Plan"
                ) : (
                  `Upgrade to ${
                    plan.id.charAt(0).toUpperCase() + plan.id.slice(1)
                  }`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-20 text-center space-y-4">
        <p className="text-gray-400 text-sm">
          Secure payment via{" "}
          <span className="font-bold text-gray-500">Stripe</span>. Cancel
          anytime from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default Plans;
