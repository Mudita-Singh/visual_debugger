// src/hooks/useAuth.js
import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/session", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setUser(null);
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
