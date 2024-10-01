import {useState} from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./apps/home";
import QuizzApp from "./apps/quest/Index";
import "./index.css";
import ErrorBoundary from './ErrorBoundary';

import ChainContext from "./lib/chainContext";
import { ThirdwebProvider } from "thirdweb/react";


// Initialize Google AI

function App() {
  const [selectedChainId, setSelectedChainId] = useState("1");

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
                  <Route path="/quests" element={<QuizzApp/>} />
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