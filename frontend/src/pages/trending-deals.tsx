'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';

const TrendingDeals: React.FC = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('/api/games?limit=20');
        setDeals(response.data.data);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return (
    <Layout title="Trending Deals - Xbox Sale Predictor">
      <h1 className="text-4xl font-bold mb-8">🔥 Trending Deals</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((game: any) => (
            <a
              key={game.id}
              href={`/game/${game.id}`}
              className="bg-dark-800 border border-dark-700 rounded-lg overflow-hidden hover:border-xbox-green-light transition group"
            >
              {game.coverArt && (
                <img src={game.coverArt} alt={game.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-bold mb-2 group-hover:text-xbox-green-light transition line-clamp-2">{game.title}</h3>
                <p className="text-xs text-dark-400">{game.genre}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default TrendingDeals;
