import React, { useState } from 'react';
import { saveDocument, saveQuiz } from '../../../lib/db';

function FileUpload({ onFileProcessed, genAI }) {
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [requiredPassScore, setRequiredPassScore] = useState(70);
  const [limitTakers, setLimitTakers] = useState(false);
  const [takerLimit, setTakerLimit] = useState(0);
  const [totalRewardsUSDC, setTotalRewardsUSDC] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (totalRewardsUSDC < 0 || totalRewardsUSDC > 1000000) {
      setError("Total rewards must be between 0 and 1,000,000 USDC.");
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        // Generate summary
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const summaryResult = await model.generateContent(`Summarize this text: ${text}`);
        const summary = summaryResult.response.text();

        // Generate questions
        const questionsResult = await model.generateContent(`Generate ${numQuestions} multiple-choice questions based on this text. For each question, provide 4 options labeled A, B, C, and D. Format the output as follows:
        Question 1: [Question text]
        A. [Option A]
        B. [Option B]
        C. [Option C]
        D. [Option D]

        Repeat this format for all ${numQuestions} questions.`);
        const questionsText = questionsResult.response.text();
        const questions = questionsText.split('\n\n').map((q, index) => {
          const [questionText, ...options] = q.split('\n');
          return {
            id: index + 1,
            text: questionText.replace(/^Question \d+: /, ''),
            options: options.map(opt => opt.substring(3))
          };
        });

        // Save document and quiz to database
        const documentId = await saveDocument(text, summary);
        const quizId = await saveQuiz(
            documentId,
            JSON.stringify(questions),
            numQuestions,
            requiredPassScore,
            limitTakers,
            limitTakers ? takerLimit : null,
            totalRewardsUSDC
        );

        onFileProcessed({
          summary,
          questions,
          documentId,
          quizId,
          numQuestions,
          requiredPassScore,
          limitTakers,
          takerLimit: limitTakers ? takerLimit : null,
          totalRewardsUSDC,
          totalRewardsTokens: Number((totalRewardsUSDC / 0.00654).toFixed(6))
        });
      } catch (error) {
        console.error('Error processing file:', error);
        setError("An error occurred while processing the file. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Upload Document:</label>
          <input type="file" onChange={handleFileChange} className="w-full" />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Number of Questions (max 15):</label>
          <input
              type="number"
              min="1"
              max="15"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.min(15, parseInt(e.target.value)))}
              className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Required Pass Score (%):</label>
          <input
              type="number"
              min="0"
              max="100"
              value={requiredPassScore}
              onChange={(e) => setRequiredPassScore(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
                type="checkbox"
                checked={limitTakers}
                onChange={(e) => setLimitTakers(e.target.checked)}
                className="mr-2"
            />
            <span className="font-semibold">Limit Number of Takers</span>
          </label>
        </div>

        {limitTakers && (
            <div>
              <label className="block mb-2 font-semibold">Taker Limit:</label>
              <input
                  type="number"
                  min="1"
                  value={takerLimit}
                  onChange={(e) => setTakerLimit(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
              />
            </div>
        )}

        <div>
          <label className="block mb-2 font-semibold">Total Rewards (USDC):</label>
          <input
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              value={totalRewardsUSDC}
              onChange={(e) => setTotalRewardsUSDC(parseFloat(e.target.value))}
              className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <p className="font-semibold">Equivalent LearnNova Tokens: {(totalRewardsUSDC / 0.00654).toFixed(6)}</p>
        </div>

        <button
            type="submit"
            className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Upload and Process'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
  );
}

export default FileUpload;