import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Detect from "./pages/Detect"; // Ensure this file exists
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpConfirm from "./pages/OtpConfirm";
import Account from "./pages/Account";
import Gallery from "./pages/Gallery";
import Recover from "./pages/Recover";
import ChangePassword from "./pages/ChangePassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detect" element={<Detect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/confirm" element={<OtpConfirm />} />
        <Route path="/forgot_password/confirm" element={<OtpConfirm />} />
        <Route path="/account" element={<Account />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/reset_password" element={<ChangePassword />} />
        <Route path="/change_password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;
