
//fileupload
import React, { useState, useRef } from 'react';
import { Upload, FileText, Loader } from 'lucide-react';

function FileUpload({ onFileProcessed, genAI }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/plain') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a valid text file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Generate summary
        const summaryResult = await model.generateContent(`
          Summarize the following text in about 2-3 sentences:
          ${text}
        `);
        const summary = summaryResult.response.text();

        // Generate questions
        const questionsResult = await model.generateContent(`
          Based on the following text, generate 5 multiple-choice questions. 
          For each question, provide 4 options (A, B, C, D) and indicate the correct answer.
          Format your response as a JSON array of question objects, like this:
          [
            {
              "id": 1,
              "text": "What is the capital of France?",
              "optionA": "London",
              "optionB": "Berlin",
              "optionC": "Paris",
              "optionD": "Madrid",
              "correctAnswer": "C"
            },
            // ... more questions
          ]
          
          Text to base the questions on:
          ${text}
        `);
        const questionsJson = questionsResult.response.text();
        const questions = JSON.parse(questionsJson);

        onFileProcessed({ summary, questions });
      } catch (error) {
        console.error('Error processing file:', error);
        setError("An error occurred while processing the file. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  return (
      <div className="max-w-md mx-auto mt-10">
        <form onSubmit={handleSubmit} className="mb-4">
          <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
          >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt"
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-1 text-sm text-gray-600">
              {file ? file.name : 'Drag and drop your file here, or click to select'}
            </p>
          </div>
          {file && (
              <div className="mt-4 flex items-center justify-between bg-gray-100 p-2 rounded">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                </div>
                <button
                    type="submit"
                    disabled={isProcessing}
                    className={`${
                        isProcessing ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white px-4 py-2 rounded transition-colors flex items-center`}
                >
                  {isProcessing ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Processing...
                      </>
                  ) : (
                      'Generate Quiz'
                  )}
                </button>
              </div>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
      </div>
  );
}

export default FileUpload;