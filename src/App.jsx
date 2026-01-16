import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen">
      {" "}
      <Navbar />
      <AppRoutes />
    </div>
  );
};

export default App;
