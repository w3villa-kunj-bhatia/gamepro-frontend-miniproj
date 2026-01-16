import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-gray-500 mb-6">You have not been charged.</p>
      <Link
        to="/plans"
        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
      >
        Return to Plans
      </Link>
    </div>
  );
};

export default PaymentCancel;
