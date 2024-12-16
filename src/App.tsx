import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Review from './Review';
import Book from './Book';
import User from './User';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/review/:id" element={<Review/>}/>
        <Route path="/book/:id" element={<Book/>}/>
        <Route path="/user/:id" element={<User/>}/>
      </Routes>
    </Router>
  );
}

export default App;
