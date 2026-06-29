import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Home";
import Review from "./Review";
import Book from "./Book";
import User from "./User";
import Profile from "./Profile";
import { UserProvider } from "./UserContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review/:id" element={<Review />} />
          <Route path="/book/:id" element={<Book />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
