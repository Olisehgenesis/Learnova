import React, { useState } from "react";
import {
  Button,
  Input,
  TextareaAutosize,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Alert,
  AlertTitle,
  CircularProgress,
} from "@mui/material";
import { saveDocument, saveQuiz, saveReward } from "../../../lib/db";

const QuizCreationPage = ({ genAI }) => {
  const [step, setStep] = useState(1);
  const [quizData, setQuizData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    coverImage: null,
    description: "",
    rewards: [{ token: "LLT", amount: 50 }],
    quizContent: "",
    quizFile: null,
    numQuestions: 10,
    requiredPassScore: 70,
    limitTakers: false,
    takerLimit: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQuizData((prev) => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setQuizData((prev) => ({ ...prev, [name]: files[0] }));
      if (name === "coverImage") {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(files[0]);
      }
    } else if (type === "checkbox") {
      setQuizData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setQuizData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRewardChange = (index, field, value) => {
    const updatedRewards = [...quizData.rewards];
    updatedRewards[index][field] = value;
    setQuizData((prev) => ({ ...prev, rewards: updatedRewards }));
  };

  const addReward = () => {
    setQuizData((prev) => ({
      ...prev,
      rewards: [...prev.rewards, { token: "", amount: 0 }],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let quizContent = quizData.quizContent;
      if (quizData.quizFile) {
        const fileContent = await readFileContent(quizData.quizFile);
        quizContent += "\n\n" + fileContent;
      }

      // Generate summary
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const summaryResult = await model.generateContent(
        `Summarize this text in 2-3 sentences: ${quizContent}`
      );
      const summary = await summaryResult.response.text();

      // Generate questions
      const questionsResult = await model.generateContent(`
        Based on the following text, generate ${quizData.numQuestions} multiple-choice questions. 
        Each question should directly relate to the content of the text.
        For each question, 
        provide 4 options labeled A, B, C, and D, where only one option is correct and 
        the other three plausible but incorrect options.
        Ensure that the questions cover different aspects of the text and vary in difficulty.
        Format the output exactly as follows:

        Question 1: [Question text]
        A. [Option A]
        B. [Option B]
        C. [Option C]
        D. [Option D]

        Question 2: [Question text]
        A. [Option A]
        B. [Option B]
        C. [Option C]
        D. [Option D]

        (... and so on for all ${quizData.numQuestions} questions)

        Text: ${quizContent}
      `);

      const questionsText = await questionsResult.response.text();
      const questions = questionsText.split("\n\n").map((q, index) => {
        const [questionText, ...options] = q.split("\n");
        return {
          id: index + 1,
          text: questionText.replace(/^Question \d+: /, ""),
          options: options.map((opt) => opt.substring(3)),
        };
      });

      // Save document
      const documentId = await saveDocument(quizContent, summary);

      // Save quiz
      const quizId = await saveQuiz({
        name: quizData.name,
        documentId,
        questions: JSON.stringify(questions),
        numQuestions: quizData.numQuestions,
        requiredPassScore: quizData.requiredPassScore,
        limitTakers: quizData.limitTakers,
        takerLimit: quizData.limitTakers ? quizData.takerLimit : null,
        startDate: quizData.startDate,
        endDate: quizData.endDate,
        coverImage: quizData.coverImage,
        courseDistribution: "equal", // Or however you're determining this
      });

      // Save rewards
      for (const reward of quizData.rewards) {
        await saveReward(quizId, reward.token, reward.amount, "equal");
      }

      console.log("Quiz created successfully with ID:", quizId);
      // Handle successful creation (e.g., show success message, redirect)
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Create New Quiz</h1>

      {/* Step Indicator */}
      <div className="flex mb-2">
        <div className="relative w-full h-2 bg-gray-600 rounded">
          <div
            className={`absolute h-full bg-blue-700 rounded ${
              step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
            }`}
          />
        </div>
      </div>
      <div className="flex justify-between w-full">
        <span
          className={`text-sm ${
            step === 1 ? "text-blue-700" : "text-gray-400"
          }`}
        >
          Step 1
        </span>
        <span
          className={`text-sm ${
            step === 2 ? "text-blue-700" : "text-gray-400"
          }`}
        >
          Step 2
        </span>
        <span
          className={`text-sm ${
            step === 3 ? "text-blue-700" : "text-gray-400"
          }`}
        >
          Step 3
        </span>
      </div>

      {/* Step 1: Quiz Details */}
      {step === 1 && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="name" className="text-lg font-bold">
                Quiz Name
              </FormLabel>
              <Input
                id="name"
                name="name"
                value={quizData.name}
                onChange={handleInputChange}
                placeholder="Enter quiz name"
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            <div className="flex mb-4 space-x-4">
              <div className="w-1/2">
                <FormControl fullWidth margin="normal">
                  <FormLabel htmlFor="startDate" className="text-lg font-bold">
                    Start Date
                  </FormLabel>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={quizData.startDate}
                    onChange={handleInputChange}
                    className="border border-gray-500 rounded-md text-lg p-2"
                  />
                </FormControl>
              </div>
              <div className="w-1/2">
                <FormControl fullWidth margin="normal">
                  <FormLabel htmlFor="endDate" className="text-lg font-bold">
                    End Date
                  </FormLabel>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={quizData.endDate}
                    onChange={handleInputChange}
                    className="border border-gray-500 rounded-md text-lg p-2"
                  />
                </FormControl>
              </div>
            </div>

            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="coverImage" className="text-lg font-bold">
                Cover Image
              </FormLabel>
              <Input
                id="coverImage"
                name="coverImage"
                type="file"
                onChange={handleFileChange}
                className="border border-gray-500 rounded-md text-lg p-2"
                accept="image/*"
              />
            </FormControl>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto border rounded-md"
                />
              </div>
            )}

            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="description" className="text-lg font-bold">
                Description
              </FormLabel>
              <TextareaAutosize
                id="description"
                name="description"
                value={quizData.description}
                onChange={handleInputChange}
                placeholder="Enter quiz description"
                minRows={4}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Quiz Rewards */}
      {step === 2 && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Quiz Rewards</h2>
            {quizData.rewards.map((reward, index) => (
              <div key={index} className="mb-4 flex items-center space-x-4">
                <div className="w-1/3">
                  <FormControl fullWidth margin="normal">
                    <FormLabel
                      htmlFor={`token-${index}`}
                      className="text-lg font-bold"
                    >
                      Token
                    </FormLabel>
                    <Input
                      id={`token-${index}`}
                      value={reward.token}
                      onChange={(e) =>
                        handleRewardChange(index, "token", e.target.value)
                      }
                      placeholder="Token name"
                      className="border border-gray-500 rounded-md text-lg p-2"
                    />
                  </FormControl>
                </div>
                <div className="w-1/3">
                  <FormControl fullWidth margin="normal">
                    <FormLabel
                      htmlFor={`amount-${index}`}
                      className="text-lg font-bold"
                    >
                      Amount
                    </FormLabel>
                    <Input
                      id={`amount-${index}`}
                      type="number"
                      value={reward.amount}
                      onChange={(e) =>
                        handleRewardChange(index, "amount", e.target.value)
                      }
                      placeholder="Reward amount"
                      className="border border-gray-500 rounded-md text-lg p-2"
                    />
                  </FormControl>
                </div>
                {index === 0 && (
                  <Button
                    onClick={addReward}
                    className="mt-6 font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded"
                  >
                    Add Reward
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Quiz Content */}
      {step === 3 && (
        <Card className="shadow-lg mb-6">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold mb-4">Quiz Content</h2>
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="numQuestions" className="text-lg font-bold">
                Number of Questions (max 20)
              </FormLabel>
              <Input
                id="numQuestions"
                name="numQuestions"
                type="number"
                min="1"
                max="20"
                value={quizData.numQuestions}
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel
                htmlFor="requiredPassScore"
                className="text-lg font-bold"
              >
                Required Pass Score (%)
              </FormLabel>
              <Input
                id="requiredPassScore"
                name="requiredPassScore"
                type="number"
                min="0"
                max="100"
                value={quizData.requiredPassScore}
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel className="text-lg font-bold">
                <Input
                  type="checkbox"
                  name="limitTakers"
                  checked={quizData.limitTakers}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Limit Number of Takers
              </FormLabel>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="takerLimit" className="text-lg font-bold">
                Taker Limit
              </FormLabel>
              <Input
                id="takerLimit"
                name="takerLimit"
                type="number"
                min="1"
                value={quizData.takerLimit}
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="quizContent" className="text-lg font-bold">
                Quiz Questions
              </FormLabel>
              <TextareaAutosize
                id="quizContent"
                name="quizContent"
                value={quizData.quizContent}
                onChange={handleInputChange}
                placeholder="Enter quiz questions or upload a file"
                minRows={10}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
            <FormControl fullWidth margin="normal">
              <FormLabel htmlFor="quizFile" className="text-lg font-bold">
                Or Upload Quiz File
              </FormLabel>
              <Input
                id="quizFile"
                name="quizFile"
                type="file"
                onChange={handleInputChange}
                className="border border-gray-500 rounded-md text-lg p-2"
              />
            </FormControl>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-between items-center">
        {step > 1 && (
          <Button
            onClick={() => setStep(step - 1)}
            disabled={isLoading}
            className="font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded disabled:opacity-50"
          >
            Previous
          </Button>
        )}
        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={isLoading}
            className="ml-auto font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded disabled:opacity-50"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="ml-auto font-bold shadow-2xl hover:shadow-lg transition duration-300 bg-gray-800 text-white border border-gray-600 py-3 px-6 rounded disabled:opacity-50"
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Quiz (50 LLT fee)"
            )}
          </Button>
        )}
      </div>

      {error && (
        <Alert className="mt-6" severity="error">
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Alert className="mt-6" severity="info">
        <AlertTitle>Note</AlertTitle>
        Creating a quiz requires a fee of 50 LLT tokens.
      </Alert>
    </div>
  );
};

export default QuizCreationPage;
