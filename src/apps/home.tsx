// src/apps/Home.tsx

import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Add login logic here
    // For now, let's just redirect to the invoicing app
    navigate("/quests");
  };

  return (
    <div>

    </div>
  );
}

export default Home;
