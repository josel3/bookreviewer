export = {}
declare global {
    type User = {
      id: number; 
      username: string;
      avatar: string | null;
      userReviews: Review[] | null;
      userDescription: string;
      userFavs: Review[] | null;
    }
    type Review = {
      id: number;
      bookTitle: string;
      reviewTitle: string;
      reviewText: string;
      reviewerId: number;
      reviewerName: string;
      image: string | null
    }
    type Book = {
      id: number;
      title: string;
      image: string | null;
    }
}