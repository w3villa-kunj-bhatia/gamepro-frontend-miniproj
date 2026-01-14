import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navbar />
      <AppRoutes />
    </div>
  );
};

export default App;
