import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./apps/home";
import QuizzApp from "./apps/quest/Index";
import "./index.css";
import ErrorBoundary from "./ErrorBoundary";
import { genAI } from "./lib/genAI";
import QuestBrowser from "./apps/QuestBrowser";
import AttemptQuiz from "./apps/AttemptQuiz";

import ChainContext from "./lib/chainContext";
import { ThirdwebProvider } from "thirdweb/react";

function App() {
  const [selectedChainId, setSelectedChainId] = useState("1");
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        setDbInitialized(true);
        console.log("Database tables initialized successfully");
      } catch (error) {
        console.error("Error initializing database tables:", error);
      }
    };

    initDB();
  }, []);

  if (!dbInitialized) {
    return <div>Initializing application...</div>;
  }

  return (
    <Router>
      <ErrorBoundary>
        <ChainContext.Provider value={{ selectedChainId, setSelectedChainId }}>
          <ThirdwebProvider>
            <div className="min-h-screen bg-gray-100">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create" element={<QuizzApp genAI={genAI} />} />
                  <Route path="/quests" element={<QuestBrowser />} />
                  <Route
                    path="/attempt-quiz/:id"
                    element={<AttemptQuiz genAI={genAI} />}
                  />
                </Routes>
              </main>
            </div>
          </ThirdwebProvider>
        </ChainContext.Provider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
