import React, { useEffect, useState } from 'react';

const Quiz = () => {
    const [questionData, setQuestionData] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [loading, setLoading] = useState(true);
    const [quizEnded, setQuizEnded] = useState(false);

    useEffect(() => {
        const url = "https://opentdb.com/api.php?amount=10";
        if (questionData.length === 0) {
            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    const questionArray = data.results.map((elem) => {
                        const obj = {
                            question: elem.question,
                            options: [...elem.incorrect_answers, elem.correct_answer],
                            correct_answer: elem.correct_answer,
                            score: 0,
                        };
                        return obj;
                    });

                    setQuestionData(questionArray);
                    setLoading(false); // Marking loading as false once questions are fetched
                    localStorage.setItem("quiz_questions", JSON.stringify(questionArray));
                })
                .catch((error) => {
                    console.error('Error fetching questions:', error);
                    setLoading(false); // Mark loading as false in case of error
                });
        }
    }, []);

    

    useEffect(() => {
        if (!loading && currentQuestionIndex < questionData.length) {
            const countdown = setInterval(() => {
                setTimeLeft(prevTimeLeft => {
                    if (prevTimeLeft > 0) {
                        return prevTimeLeft - 1;
                    } else {
                        clearInterval(countdown);
                        handleNextQuestion();
                        return 5; 
                    }
                });
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [loading, currentQuestionIndex, questionData]);

    function handleNextQuestion() {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questionData.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
            setTimeLeft(5); // Reset timer for the next
        } else {
            setQuizEnded(true);
        }
    }

    function answerHandler(selectedAnswer) {
        const currentQuestion = questionData[currentQuestionIndex];
        if (selectedAnswer === currentQuestion.correct_answer) {
            setScore(prevScore => prevScore + 1);
        }
        handleNextQuestion();
    }

    function restartHandler() {
        setScore(0);
        setCurrentQuestionIndex(0);
        setQuizEnded(false);
    }

    return (
        <div id="container">
            <h1>Quiz App</h1>
            {loading ? (
                <p>Loading...</p>
            ) : !quizEnded ? (
                <div className='question_card'>
                    <h4>Question {currentQuestionIndex + 1}</h4>
                    <p>Question : {questionData[currentQuestionIndex].question} </p>
                    <div className='option-btns' style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {questionData[currentQuestionIndex].options.map((option, index) => (
                            <button key={index} className='btn' onClick={() => answerHandler(option)}>
                                {option}
                            </button>
                        ))}
                    </div>
                    <p>Time left : {timeLeft} seconds</p>
                    <button onClick={handleNextQuestion} className='btn skip_btn'>Skip Question</button>
                </div>
            ) : (
                <div id="quiz_end_card">
                    <p>Quiz Ended</p>
                    <p>Your Score: {score}</p>
                    <button onClick={restartHandler} className="btn">Restart</button>
                </div>
            )}
        </div>
    );
};

export default Quiz;
