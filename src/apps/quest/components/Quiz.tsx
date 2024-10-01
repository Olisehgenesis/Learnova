//
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

function Quiz({ quizData, onQuizCompleted, genAI }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[quizData.questions[currentQuestionIndex - 1].id] || null);
    }
  };

  const handleSubmit = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(`
        Evaluate these answers for the quiz and give a score out of 100:
        Quiz Data: ${JSON.stringify(quizData)}
        User Answers: ${JSON.stringify(answers)}
        
        For each question, compare the user's answer to the correct answer.
        Provide a breakdown of correct and incorrect answers, and calculate a final score.
        Format the response as JSON like this:
        {
          "score": 80,
          "feedback": "You got 4 out of 5 questions correct. Great job!",
          "questionFeedback": [
            {
              "id": 1,
              "correct": true,
              "feedback": "Correct! Paris is indeed the capital of France."
            },
            // ... feedback for other questions
          ]
        }
      `);
      const response = await result.response.text();
      // Remove any markdown formatting if present
      const jsonString = response.replace(/```json\s?|\s?```/g, '').trim();
      const parsedResponse = JSON.parse(jsonString);
      onQuizCompleted(parsedResponse);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;
  return (
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Quiz Challenge</h2>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-4">
          <p className="text-sm text-gray-600 mb-4">{quizData.summary}</p>
          <div className="flex justify-between items-center mb-4">
            <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="p-2 rounded-full bg-gray-200 disabled:opacity-50"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-semibold">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </span>
            <button
                onClick={handleNext}
                disabled={isLastQuestion || !selectedOption}
                className="p-2 rounded-full bg-gray-200 disabled:opacity-50"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <p className="text-lg font-semibold mb-4">{currentQuestion.text}</p>
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((option) => (
                <button
                    key={option}
                    onClick={() => handleOptionSelect(option)}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                        selectedOption === option
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  <span className="font-semibold mr-2">{option}.</span>
                  {currentQuestion[`option${option}`]}
                </button>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
          {isLastQuestion && (
              <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
              >
                <Check size={18} className="mr-2" />
                Submit
              </button>
          )}
        </div>
      </div>
  );
}

export default Quiz;