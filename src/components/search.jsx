import React from "react";

const Search = ({ searchTerm, setSearchTerm, onSearch }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="" />

        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch(searchTerm);  // Press Enter to search
          }}
        />
        <button onClick={() => onSearch(searchTerm)} 
        className="text-white bg-blue-400 p-0.5 rounded-md" 
        >Search</button>
      </div>
        
    </div>
  );
};

export default Search;
