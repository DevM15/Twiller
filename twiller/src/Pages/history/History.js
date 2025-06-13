import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUserAuth } from "../../context/UserAuthContext";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logOut, user } = useUserAuth()

  const result = user?.email;

  const port = process.env.PORT || "localhost:5000";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://${port}/history`, {
          params: { email: result }
        });
        setHistory(response.data.history.flat().reverse());
      } catch (err) {
        setError("Failed to fetch history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (result) {
      fetchHistory(); // Only fetch if user email is available
    }
  }, [result]); // Re-run if email changes

  if (loading) return <p>Loading history...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>History</h2>
      <ul>
        {history.map((item, index) => (
          <li key={index}>
            <p>IP: {item.ip}</p>
            <p>Browser: {item.browser}</p>
            <p>OS: {item.os}</p>
            <p>Device: {item.device}</p>
            <p>Time: {item.istTimeString}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPage;
