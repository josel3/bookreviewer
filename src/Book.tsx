import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";

const Placeholder =
  "https://tools-api.webcrumbs.org/image-placeholder/150/150/abstract/1";

const Book = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/book/${id}`);
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error("Failed to fetch book data:", error);
      }
    };

    fetchBookData();
  }, []);

  if (!book) {
    return <div className="text-center text-neutral-700">Loading...</div>;
  }

  return (
    <div className="bg-white">
      <Header />
      <div className="shadow rounded-lg h-full p-8">
        <div className="flex gap-8">
          <img
            src={book.image || Placeholder}
            alt="Book Cover"
            className="w-[200px] h-[300px] object-cover rounded-md"
          />
          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="font-title text-xl text-neutral-950">
                {book.title}
              </h1>
              <p className="text-neutral-700">Author: {book.author}</p>
              <p className="text-neutral-700">Year: {book.year}</p>
            </div>
            <div>
              <h2 className="text-lg font-title text-neutral-950">Reviews</h2>
              <ul className="mt-4 space-y-4">
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map((review, index) => (
                    <Link key={`review-${review.id}-${index}`} to={`/review/${review.id}`}>
                      <li className="p-4 bg-neutral-100 rounded-md">
                        <label className="text-neutral-800">
                            "{review.reviewTitle}"-
                        </label>
                        <p className="text-neutral-700">
                          {review.reviewText}
                        </p>
                        <p className="text-sm text-neutral-500">
                          - {review.reviewerName}
                        </p>
                      </li>
                    </Link>
                  ))
                ) : (
                  <p className="text-neutral-700">Nada por aqui..</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
