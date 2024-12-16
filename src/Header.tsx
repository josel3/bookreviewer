import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="sticky top-0 flex justify-between items-center p-3 bg-neutral-100 rounded-t-lg">
      <Link to={"/"}>
        <h1 className="font-title text-xl text-primary-950">BookReview App</h1>
      </Link>
      <div className="w-[40px] h-[40px] rounded-full bg-neutral-300"></div>
    </header>
  );
}

export default Header;
