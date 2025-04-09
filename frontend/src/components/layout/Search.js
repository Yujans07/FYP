import React, { useState } from "react";

const Search = ({ history }) => {
  const [keyword, setKeyword] = useState("");

  const searchHandler = (e) => {
    e.preventDefault();

    if (keyword.trim()) {
      history.push(`/search/${keyword}`);
    } else {
      history.push("/");
    }
  };

  return (
    <form className="search-container" onSubmit={searchHandler}>
      <input
        type="text"
        id="search_field"
        className="form-control"
        placeholder="Search Products..."
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button type="submit">
        <i className="fa fa-search"></i>
      </button>
    </form>
  );
};

export default Search;
