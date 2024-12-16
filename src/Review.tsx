import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";
const Placeholder =
  "https://tools-api.webcrumbs.org/image-placeholder/150/150/abstract/1";
const Review = () => {
  const [review, setReview] = useState<Review | null>(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`http://localhost:3001/api/review/${id}`);
      const data = await response.json();
      setReview(data);
    };
    fetchData();
  }, []);

  if (!review) {
    return <div className="text-neutral-950">Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-white h-screen">
      <Header />
      <div className="rounded-lg shadow-lg p-8 flex flex-row flex-grow gap-6">
        <img
          src={review.image || Placeholder}
          alt="Book Cover"
          className="w-[200px] h-[300px] object-cover rounded-md"
        />
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="font-title text-2xl text-neutral-950 mb-2">
              {review.bookTitle}
            </h1>
            <h2 className="text-lg ml-2 text-neutral-950 font-semibold">
              "{review.reviewTitle}"
            </h2>
            <h3 className="text-neutral-950 ml-2">
              Reviewed by:{" "}
              <Link to={`/user/${review.reviewerId}`}>
                {review.reviewerName}
              </Link>
            </h3>
            <div className="pt-6">
              <p className="text-neutral-900 ml-2">{review.reviewText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
