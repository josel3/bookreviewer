import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";

type FetchData = {
  reviews: Review[];
  topBooks: Book[];
  topUsers: User[];
};

const Placeholder =
  "https://tools-api.webcrumbs.org/image-placeholder/150/150/abstract/1";

const Home = () => {
  const [data, setData] = useState<FetchData>({
    reviews: [],
    topBooks: [],
    topUsers: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetch("http://localhost:3001/api/home");
      const jsonData = await fetchedData.json();
      setData(jsonData);
    };
    loadData();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg min-h-[800px]">
      <Header/>
      <main className="flex gap-4">
        <section className="basis-2/3 space-y-6">
          <div className="space-y-4 ml-4">
            <h2 className="font-title ml-2 text-lg text-primary-950">Top Reviews</h2>
            {data.reviews.map((review, index) => (
              <Link to={`/review/${review.id}`} key={`review-${index}-${review.id}`}>
                <div className="flex gap-4 mt-2">
                  <img
                    src={review.image || Placeholder}
                    alt={review.bookTitle}
                    className="w-[80px] h-[120px] bg-neutral-300 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary-950">
                      {review.bookTitle}
                    </h3>
                    <h4 className="text-sm text-neutral-950">
                      {review.reviewTitle}
                    </h4>
                    <p className="text-sm text-neutral-950 line-clamp-2">
                      {review.reviewText}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <aside className="fixed right-0 flex flex-col basis-1/3 space-y-6 pr-12 flex-shrink-0 flex-grow">
          <div className="space-y-4">
            <h2 className="font-title ml-2 text-lg text-primary-950">Top Books</h2>
            {data.topBooks.map((book, index) => (
              <Link to={`/book/${book.id}`} key={`book-${index}-${book.id}`}>
                <div  className="flex mt-2 gap-6 items-center">
                  <img
                    src={book.image || Placeholder}
                    alt={book.title}
                    className="w-[60px] h-[90px] bg-neutral-300 rounded-md object-cover"
                  />
                  <h3 className="font-semibold text-primary-950">
                    {book.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="space-y-4">
            <h2 className="font-title text-lg ml-2 text-primary-950">Top Users</h2>
            {data.topUsers.map((user, index) => (
              <Link to={`/user/${user.id}`} key={`user-${index}-${user.id}`}>
                <div className="flex gap-4 mt-2 items-center">
                  <img
                    src={user.avatar || Placeholder}
                    alt={user.username}
                    className="w-[40px] h-[40px] bg-neutral-300 rounded-full object-cover"
                  />
                  <h4 className="text-sm text-primary-950">{user.username}</h4>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Home;
