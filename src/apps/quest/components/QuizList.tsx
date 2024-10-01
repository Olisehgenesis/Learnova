import React, { useEffect, useState } from 'react';
import { getQuizzes, getDocumentById } from '../../../lib/db';

function QuizList() {
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const quizData = await getQuizzes();
                console.log("Quizes", quizData)
                if (!Array.isArray(quizData)) {
                    throw new Error('Quiz data is not in the expected format');
                }
                const quizzesWithDocuments = await Promise.all(quizData.map(async (quiz) => {
                    const document = await getDocumentById(quiz.document_id);
                    return { ...quiz, document };
                }));
                setQuizzes(quizzesWithDocuments);
            } catch (err) {
                console.error('Error fetching quizzes:', err);
                setError('Failed to load quizzes. Please try again later.');
            }
        };

        fetchQuizzes();
    }, []);

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
            {quizzes.length === 0 ? (
                <p>No quizzes available at the moment.</p>
            ) : (
                quizzes.map((quiz) => (
                    <div key={quiz.id} className="mb-4 p-4 border rounded">
                        <h3 className="text-xl font-semibold">
                            {quiz.document?.summary ? quiz.document.summary.substring(0, 100) + '...' : 'Quiz'}
                        </h3>
                        <p>Created: {new Date(quiz.created_at).toLocaleString()}</p>
                        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Take Quiz</button>
                    </div>
                ))
            )}
        </div>
    );
}

export default QuizList;
