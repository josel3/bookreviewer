import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";
const Placeholder =
  "https://tools-api.webcrumbs.org/image-placeholder/150/150/abstract/1";

const User = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/user/${id}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white h-screen">
    <Header/>
    <div className="shadow rounded-lg p-6">
      <header className="mb-6 flex items-center gap-4">
        <img
          src={userData.avatar || Placeholder}
          alt="User Avatar"
          className="w-[64px] h-[64px] rounded-full object-cover"
          />
        <div>
          <h1 className="text-2xl font-title text-neutral-950">
            {userData.username}
          </h1>
          <p className="text-neutral-700 mt-2">{userData.userDescription}</p>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          User Reviews
        </h2>
        <div className="space-y-4">
          {userData.userReviews && userData.userReviews.length > 0
            ? userData.userReviews.map((review, index) => (
                <Link to={`/review/${review.id}`} key={`review-${index}-${review.id}`}>
                  <article
                    className="bg-neutral-100 p-4 rounded-md flex gap-4"
                    >
                    <img
                      src={review.image || Placeholder}
                      alt="Book Cover"
                      className="w-[48px] h-[72px] rounded-md object-cover"
                      />
                    <div>
                      <h3 className="font-medium text-neutral-950">
                        {review.bookTitle}
                      </h3>
                      <p className="text-neutral-700 mt-1">
                        {review.reviewTitle}
                      </p>
                    </div>
                  </article>
                </Link>
              ))
              : "Nada por aqui.."}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-neutral-950 mb-4">
          Liked Reviews
        </h2>
        <div className="space-y-4">
          {userData.userFavs && userData.userFavs.length > 0
            ? userData.userFavs.map((likedReview, index) => (
                <Link to={`/reveiw/${likedReview.id}`} key={`liked-${index}-${likedReview.id}`}>
                  <article className="bg-neutral-100 p-4 rounded-md flex gap-4">
                    <img
                      src={likedReview.image || Placeholder}
                      alt="Book Cover"
                      className="w-[48px] h-[72px] rounded-md object-cover"
                      />
                    <div>
                      <h3 className="font-medium text-neutral-950">
                        {likedReview.bookTitle}
                      </h3>
                      <p className="text-neutral-700 mt-1">
                        {likedReview.reviewTitle}
                      </p>
                    </div>
                  </article>
                </Link>
              ))
              : "Nada por aqui.."}
        </div>
      </section>
    </div>
              </div>
  );
};

export default User;
