import React, { useState, useEffect } from 'react';
import FileUpload from "./components/FileUpload";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import { genAI } from "../../lib/genAI";

function QuizzApp() {
    const [stage, setStage] = useState('upload');
    const [quizData, setQuizData] = useState(null);
    const [quizResults, setQuizResults] = useState(null);

    useEffect(() => {
        console.log("genAI:", genAI);
    }, []);

    const handleFileProcessed = (data) => {
        setQuizData(data);
        setStage('quiz');
    };

    const handleQuizCompleted = (results) => {
        setQuizResults(results);
        setStage('results');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">LearNova Quests</h1>
            <p className="text-center mb-4">AI Status: {genAI ? 'Loaded' : 'Not loaded'}</p>
            {stage === 'upload' && <FileUpload onFileProcessed={handleFileProcessed} genAI={genAI} />}
            {stage === 'quiz' && quizData && (
                <Quiz quizData={quizData} onQuizCompleted={handleQuizCompleted} genAI={genAI} />
            )}
            {stage === 'results' && quizResults && <Results results={quizResults} quizData={quizData} />}
        </div>
    );
}

export default QuizzApp;