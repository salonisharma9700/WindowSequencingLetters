import './App.css';
import {Route , Routes} from 'react-router-dom';
import LetterCard from './wsletter/LetterCard';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<LetterCard/>}/>
      </Routes>
    </div>
  );
}

export default App;
