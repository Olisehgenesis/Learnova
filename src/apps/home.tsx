// src/apps/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Add login logic here
    // For now, let's just redirect to the invoicing app
    navigate("/invoicing");
  };

  return (
    <div>
      <h2>Welcome to the Multi-App Platform</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Home;
