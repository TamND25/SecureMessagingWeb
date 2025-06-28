import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);
};

export default useAuthCheck;