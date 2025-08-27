
import { useEffect, useState } from "react";
import "./index.css";
import Search from "./components/Search";
import MovieCard from "./components/MovieCard";
import { getTrendingMovies, updateSearchCount } from "./appwrite";


const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const OMDB_BASE_URL = import.meta.env.VITE_OMDB_BASE_URL;

const TRAKT_API_KEY = import.meta.env.VITE_TRAKT_API_KEY;
const TRAKT_BASE_URL = import.meta.env.VITE_TRAKT_BASE_URL;


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movies, setMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, settrendingMovies] = useState([]);
  const [trendloading, settrendloading ] = useState(false)


  // 🔹 Helper: attach poster from OMDb if missing
  const addPoster = async (movie) => {
    let poster = movie.images?.poster?.full;

    if (!poster) {
      try {
        const response = await fetch(
          `${OMDB_BASE_URL}/?t=${encodeURIComponent(movie.title)}&apikey=${OMDB_API_KEY}`
        );
        const omdbData = await response.json();

        if (omdbData.Poster && omdbData.Poster !== "N/A") {
          poster = omdbData.Poster;
        } else {
          poster = "https://via.placeholder.com/450?text=No+Poster";
        }
      } catch {
        poster = "https://via.placeholder.com/450?text=No+Poster";
      }
    }

    // Return full movie with poster + safe fallback for movie_id
    return {
      ...movie,
      poster,
      movie_id: movie?.ids?.trakt || 0,
    };
  };

  //  Fetch trending movies
  const fetchTrendingMovies = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setMovies([]);

    try {
      const response = await fetch(`${TRAKT_BASE_URL}/movies/trending?limit=20`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "trakt-api-version": "2",
          "trakt-api-key": TRAKT_API_KEY,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch trending movies");

      const data = await response.json();
      const moviesWithPoster = await Promise.all(
        data.map((item) => addPoster(item.movie))
      );

      setMovies(moviesWithPoster);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching trending movies.");
    } finally {
      setIsLoading(false);
    }
  };



  //fetch top 5 trending movies
    const loadTrendingMovies = async () => {
      settrendloading(true);
      try{
          const movies = await getTrendingMovies();

          settrendingMovies(movies);

      } catch(error) {

        console.error(`Error fetching top 5 trending movies: ${error}`)
      }
    }



  //  Fetch search results
  const fetchSearchMovies = async (query) => {
    if (!query) return fetchTrendingMovies();

    setIsLoading(true);
    setErrorMessage("");
    setMovies([]);

    try {
      const response = await fetch(
        `${TRAKT_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&type=movie&limit=20`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "trakt-api-version": "2",
            "trakt-api-key": TRAKT_API_KEY,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch search movies");

      const data = await response.json();
      console.log("Search data:", data);

      const moviesWithPoster = await Promise.all(
        data.map((item) => addPoster(item.movie))
      );

      setMovies(moviesWithPoster);

      // ✅ Update search count in Appwrite
      if (moviesWithPoster.length > 0) {
        await updateSearchCount(query, moviesWithPoster[0]); // now includes poster + movie_id
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching search results.");
    } finally {
      setIsLoading(false);
    }
  };

  //  Load trending movies on app start
  useEffect(() => {
    fetchTrendingMovies();
  }, []);


  //load top5 trending movies
  useEffect(() => {
    loadTrendingMovies();
  }, []);


  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          
        <header>
            <img src="./hero.png" alt="Hero background" />
            <h1>
              Find <span className="text-gradient">Movies</span> You’ll Enjoy
            </h1>

        <Search
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={fetchSearchMovies}
        />
        </header>
        
        
         {trendingMovies.length > 0 && (
           <section className="trending">
             <h2>Trending Movies</h2>

             
              <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p> {index + 1}</p>
                  <img src={movie.poster} alt={movie.title} />
                </li>
              ))}
              settrendloading(false)
            </ul>
            

           </section>
         )} 

     <section className="all-movies">
            <h2 className="mt-6">
              {searchTerm ? "Search Results" : "Top Movies"}
            </h2>

            {isLoading ? (
              <span className="loader"></span>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.ids?.trakt || movie.ids?.imdb || movie.imdbID}
                    movie={movie}
                  />
                ))}
              </ul>
            )}
        </section>
        </div>
      </div>
    </main>
  );
}

export default App;
