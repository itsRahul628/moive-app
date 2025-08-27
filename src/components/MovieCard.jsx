const MovieCard = ({ movie }) => {
    const title = movie.Title || movie.title;
    const year = movie.Year || movie.year;
    const poster = movie.Poster || movie.poster;

  return (
    <li className="movie-card">
      {
          <img className="mb-2 text-2xl text-white" src={poster} alt = {"No Poster Available"} />
      }

      <h3>{title}</h3>
      <p className="text-white ">{year}</p>
    </li>
  );
};

export default MovieCard;
