import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import './ws.css';

const LetterCard = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [answer, setAnswer] = useState('');
  const [randomLetters, setRandomLetters] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [tries, setTries] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const synth = window.speechSynthesis;

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      fetchWords(sessions[currentSessionIndex].words);
    }
  }, [currentWordIndex]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const currentTime = ((new Date() - startTime) / 1000).toFixed(2);
        setTimeTaken(currentTime);
      }, 1000);
  
      return () => clearInterval(interval);
    } else {
      setTimeTaken(0);
    }
  }, [startTime]);

  
  const formattedTime = typeof timeTaken === 'number' && !isNaN(timeTaken) ? timeTaken.toFixed(2) : 0;

  const fetchSessions = () => {
    fetch('/words.json')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched sessions:', data.sessions);
        setSessions(data.sessions);
        setCurrentSessionIndex(0);
        fetchWords(data.sessions[0].words);
      })
      .catch(error => console.error('Error fetching sessions:', error));
  };

  const fetchWords = (sessionWords) => {
    const currentWord = sessionWords[currentWordIndex];
    const lettersArray = currentWord.split('');

    setWords(sessionWords);
    setLetters(lettersArray);
    generateRandomLetters(lettersArray, currentWord); 
  };

  const generateRandomLetters = (lettersArray, currentWord) => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomChars = [...lettersArray];

    while (randomChars.length < 10) {
      const randomIndex = Math.floor(Math.random() * allLetters.length);
      const randomLetter = allLetters[randomIndex];
      if (!randomChars.includes(randomLetter)) {
        randomChars.push(randomLetter);
      }
    }

    randomChars.sort(() => Math.random() - 0.5);
    setRandomLetters(randomChars);

    setWords(prevWords => [...prevWords.filter(word => word !== currentWord), currentWord]);
  };

  const pronounceWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    synth.speak(utterance);
  };

  const handleNextWord = () => {
    const endTime = new Date();
    const timeTaken = startTime ? (endTime - startTime) / 1000 : 0;
  
    if (currentWordIndex + 1 < sessions[currentSessionIndex].words.length) {
      setCurrentWordIndex(prevIndex => prevIndex + 1);
    } else {
      if (currentSessionIndex + 1 < sessions.length) {
        setCurrentSessionIndex(prevIndex => prevIndex + 1);
        setCurrentWordIndex(0);
      } else {
        setCurrentSessionIndex(0);
        setCurrentWordIndex(0);
      }
    }
    setAnswer('');
    setShowConfetti(false);
    setTries(0);
    setStartTime(null);
    fetchWords(sessions[currentSessionIndex].words);
  };
  
    

  const handleLetterClick = (letter) => {
    setAnswer(answer + letter);
    pronounceWord(letter);
  };

  const handleChange = (event) => {
    setAnswer(event.target.value);
  };
  const checkAnswer = async () => {
    const currentAnswer = answer.toLowerCase();
    const currentWord = sessions[currentSessionIndex]?.words[currentWordIndex]?.toLowerCase();
  

    if (!startTime) {
      console.error('Error: startTime is not set');
      return;
    }
    
    
    if (!currentWord) {
      console.error('Error: currentWord is not defined');
      return;
    }
  
    if (currentAnswer === currentWord) {
      setShowConfetti(true);
      pronounceWord('Great job');
    } else {
      pronounceWord('Oops, try again');
    }
    const currentTries = tries + 1;
    setTries(currentTries); 
    console.log(tries)
    try {
      console.log('Sending time data to server...');
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 1000;
  
      
      const response = await fetch('http://localhost:4000/api/save-time-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeStarted: startTime,
          timeEnded: endTime,
          timeTaken: timeTaken,
          tries: currentTries,
          currentWord: currentWord, 
        }),
      });
    
      if (response.ok) {
        console.log('Time data saved successfully');
      } else {
        console.error('Failed to save time data:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving time data:', error);
    }
  };
  
  const clearInput = () => {
    setAnswer('');
  };

  const handleCheckStart = () => {
    if (!startTime) {
      console.log('Setting startTime...');
      setStartTime(new Date());
      checkAnswer(); 
    } else {
      checkAnswer();
    }
  };
  
  useEffect(() => {
    if (startTime) {
      console.log('Calling checkAnswer...');
      checkAnswer();
    }
  }, [startTime]);
  
  return (
    <div className='wsb'>
      <div className="info-container">
        <div className="sessioninfo">
          <p className='s'>Current Session: {currentSessionIndex + 1}</p>
        </div>
        <div className='wordinfo'>
          <p className='w'>Current Word: {currentWordIndex + 1}</p>
        </div>
      </div>
  
      <div className="tries">
        <p className='tries'>Tries: {tries}</p>
      </div>

  
      <div className='time'>
      <p className='time'>Time Taken: {startTime && `${((new Date() - startTime) / 1000).toFixed(2)} seconds`}</p>
      </div>
  
      <div className="word-cards shadow">
        {letters.map((letter, index) => (
          <div key={index} className={`letter`} onClick={() => pronounceWord(letter)}>
            {letter}
          </div>
        ))}
      </div>
  
      <button className="button-nw" onClick={handleNextWord} style={{ top: '5rem', right: '2rem' }}>Next Word</button>
  
      <div className="random-cards shadow" style={{ display: 'flex', flexWrap: 'wrap' }}>
        {randomLetters.map((letter, index) => (
          <div key={index} className="letter" onClick={() => handleLetterClick(letter)}>
            {letter}
          </div>
        ))}
      </div>
  
      <div className="InputContainer">
        <div className="input-wrapper">
          <input
            placeholder="Click to answer"
            value={answer}
            onChange={handleChange}
            style={{ marginRight: '10px' }}
          />
          <div className='lastbut'>
          <button className='ans-but' onClick={handleCheckStart}>Check Answer</button>
          <button className='clear-but' onClick={clearInput}>Clear</button>
          </div>
        </div>
      </div>
      
      {showConfetti && <Confetti />}
    </div>
  );
  
};

export default LetterCard;
