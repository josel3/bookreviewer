import { Link } from "react-router-dom";
import { useState } from "react";
import LoginModal from "./LoginModal";

function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <header className="sticky top-0 flex justify-between items-center p-3 bg-neutral-100 rounded-t-lg">
      <Link to={"/"}>
        <h1 className="font-title text-xl text-primary-950">BookReview App</h1>
      </Link>
      <div className="w-[40px] h-[40px] rounded-full bg-neutral-300" onClick={()=>setShowLoginModal(!showLoginModal)}></div>
      {showLoginModal && <LoginModal show={setShowLoginModal} />}
    </header>
  );
}

export default Header;
