import React, { useState, useEffect } from 'react';
import LetterCard from './LetterCard';

const WordCardsPage = () => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    // Fetching words from JSON
    fetch('words.json')
      .then(response => response.json())
      .then(data => setWords(data.words));
  }, []);

  return (
    <div>
      <h1>Word Cards</h1>
      <div className="word-cards">
        {words.map((word, index) => (
          <LetterCard key={index} word={word} />
        ))}
      </div>
      {/* <button onClick={() => navigate to the answer page}>Go to Answer Page</button> */}
    </div>
  );
};

export default WordCardsPage;
