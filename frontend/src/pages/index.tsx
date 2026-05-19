'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

const Home: React.FC = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('/api/games?limit=6');
        setGames(response.data.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <Layout title="Xbox Sale Predictor - Predict Game Sales">
      {/* Hero Section */}
      <div className="py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-xbox-green-light to-xbox-green text-transparent bg-clip-text">
          🎮 Xbox Sale Predictor
        </h1>
        <p className="text-xl text-dark-300 mb-8">Predict when your favorite Xbox games will go on sale</p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <SearchBar />
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-12">
          <a
            href="/trending-deals"
            className="px-6 py-3 bg-xbox-green-light hover:bg-xbox-green text-white font-semibold rounded-lg transition"
          >
            View Trending Deals
          </a>
          <a
            href="/upcoming-sales"
            className="px-6 py-3 bg-dark-700 hover:bg-dark-600 text-white font-semibold rounded-lg border border-dark-600 transition"
          >
            Upcoming Sales
          </a>
        </div>
      </div>

      {/* Recent Games Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Featured Games</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game: any) => (
              <a
                key={game.id}
                href={`/game/${game.id}`}
                className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-xbox-green-light transition group"
              >
                {game.coverArt && (
                  <img src={game.coverArt} alt={game.title} className="w-full h-48 object-cover group-hover:opacity-80 transition" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-xbox-green-light transition">{game.title}</h3>
                  <p className="text-sm text-dark-400">{game.genre}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">Historical Analysis</h3>
          <p className="text-dark-400">Complete price history with detailed analytics for every Xbox game</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">AI Predictions</h3>
          <p className="text-dark-400">Machine learning powered predictions based on historical patterns</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-xl font-bold mb-2">Smart Alerts</h3>
          <p className="text-dark-400">Get notified when predicted sales happen or new deals are available</p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
