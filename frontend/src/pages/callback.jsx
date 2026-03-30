import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Directly using Elastic Beanstalk backend URL
    fetch("http://Visual-debugger-backend-env-2.eba-6fwipzcc.ap-south-1.elasticbeanstalk.com/api/session", { 
      credentials: "include" 
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          // If logged in, redirect to home automatically
          navigate("/home");
        } else {
          // If not logged in, redirect to login
          navigate("/");
        }
      })
      .catch(err => {
        console.error(err);
        navigate("/");
      });
  }, [navigate]);

  return <p>Logging you in...</p>;
}
