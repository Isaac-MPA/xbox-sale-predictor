import React, { useState } from 'react';
import axios from 'axios';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/games/search', {
        params: { q: value, limit: 5 },
      });
      setResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search Xbox games..."
        value={query}
        onChange={handleSearch}
        className="w-full px-4 py-3 rounded-lg bg-dark-700 border border-dark-600 focus:border-xbox-green-light focus:outline-none text-white placeholder-dark-400"
      />

      {/* Search Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-dark-700 border border-dark-600 rounded-lg shadow-lg z-10">
          {results.map((game: any) => (
            <a
              key={game.id}
              href={`/game/${game.id}`}
              className="block px-4 py-2 hover:bg-dark-600 border-b border-dark-600 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {game.coverArt && (
                  <img src={game.coverArt} alt={game.title} className="w-10 h-10 rounded" />
                )}
                <div>
                  <p className="font-semibold">{game.title}</p>
                  <p className="text-sm text-dark-400">{game.genre}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
