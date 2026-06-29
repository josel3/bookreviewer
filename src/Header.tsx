import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useUser } from "./UserContext";
import ReviewModal from "./ReviewModal";
import userIcon from "./assets/user-default.svg";
import loginIcon from "./assets/login.svg";

function Header(){

  const logedUser = useUser().currentUser;
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const handleLogin = () => {
    if (logedUser){
      navigate(`/profile/${logedUser.id}`);
    }
    else{
      setShowLoginModal(!showLoginModal);
    }
  };

  return (
    <header className="sticky top-0 flex justify-end gap-3 items-center p-3 bg-indigo-700 rounded-t-lg">
      <Link className="mr-auto" to={"/"}>
        <h1 className="font-title text-xl text-neutral-100 font-bold">BookReviewer</h1>
      </Link>
      {logedUser && <div className="cursor-pointer rounded bg-fuchsia-600 text-neutral-50 font-semibold p-1" onClick={()=>setShowReviewModal(true)}>Nueva Review</div>}
      <div className={`w-[40px] h-[40px] flex justify-center items-center cursor-pointer rounded-full ${logedUser?.avatar?`bg-[url('${logedUser?.avatar}')]`:"bg-fuchsia-600"}`}  onClick={()=>handleLogin()}>
        {logedUser ? logedUser?.avatar ? '': <img src={userIcon} className="w-[30px] h-[30px]"/> : <img src={loginIcon} className="w-[30px] h-[30px]"/>}
      </div>
      {showLoginModal && <LoginModal show={setShowLoginModal}/>}
      {showReviewModal && <ReviewModal show={setShowReviewModal} isOpen={showReviewModal}/>}
    </header>
  );
}

export default Header;