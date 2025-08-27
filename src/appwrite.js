import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. Check if searchTerm already exists
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal("searchTerm", searchTerm)]
    );

    if (result.documents.length > 0) {
      // 2. Update count if found
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: (doc.count || 0) + 1,
      });
    } else {
      // 3. Otherwise create new document
      let posterUrl = null;
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?t=${encodeURIComponent(
            movie.title || ""
          )}&apikey=${OMDB_API_KEY}`
        );
        const omdbData = await res.json();
        if (omdbData.Poster && omdbData.Poster !== "N/A") {
          posterUrl = omdbData.Poster;
        }
      } catch {}

      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie?.ids?.trakt || movie?.ids?.imdb || null,
        poster: posterUrl || "https://via.placeholder.com/450?text=No+Poster",
      });
    }
  } catch (error) {
    console.error("Appwrite error:", error);
  }
};


export const getTrendingMovies = async () => {
    try{
        const response = await database.listDocuments(DATABASE_ID, COLLECTION_ID,[
            Query.limit(5),
            Query.orderDesc("count")   
            ])

            return response.documents;
    } catch(error) {
        console.log(error)
    }
}