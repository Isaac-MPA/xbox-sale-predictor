'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import ConfidenceScore from '@/components/ConfidenceScore';
import axios from 'axios';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

const GameDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [game, setGame] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchGameData = async () => {
      try {
        const [gameRes, historyRes, statsRes, predRes] = await Promise.all([
          axios.get(`/api/games/${id}`),
          axios.get(`/api/games/${id}/price-history`),
          axios.get(`/api/games/${id}/price-stats`),
          axios.get(`/api/predictions/${id}`).catch(() => ({ data: { data: null } })),
        ]);

        setGame(gameRes.data.data);
        setPriceHistory(
          historyRes.data.data.map((p: any) => ({
            date: format(new Date(p.date), 'MMM d'),
            price: p.price,
          }))
        );
        setStats(statsRes.data.data);
        setPrediction(predRes.data?.data);
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [id]);

  if (loading) return <LoadingSpinner />;

  if (!game)
    return (
      <Layout>
        <p className="text-center text-dark-400">Game not found</p>
      </Layout>
    );

  return (
    <Layout title={`${game.title} - Xbox Sale Predictor`}>
      {/* Game Header */}
      <div className="bg-dark-800 border border-dark-700 rounded-lg p-8 mb-8 flex gap-8">
        {game.coverArt && (
          <img src={game.coverArt} alt={game.title} className="w-48 h-64 rounded object-cover" />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{game.title}</h1>
          <p className="text-dark-300 mb-4">{game.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-dark-400 text-sm">Genre</p>
              <p className="text-lg font-semibold">{game.genre}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Publisher</p>
              <p className="text-lg font-semibold">{game.publisher}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Developer</p>
              <p className="text-lg font-semibold">{game.developer}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Released</p>
              <p className="text-lg font-semibold">
                {game.releaseDate ? format(new Date(game.releaseDate), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
          <a
            href={game.xboxStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-xbox-green-light hover:bg-xbox-green text-white font-semibold rounded-lg transition"
          >
            View on Xbox Store
          </a>
        </div>
      </div>

      {/* Price Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <p className="text-dark-400 text-sm mb-2">Current Price</p>
            <p className="text-3xl font-bold text-xbox-green-light">${stats.currentPrice.toFixed(2)}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <p className="text-dark-400 text-sm mb-2">Lowest Price</p>
            <p className="text-3xl font-bold">${stats.lowestPrice.toFixed(2)}</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <p className="text-dark-400 text-sm mb-2">Avg. Discount</p>
            <p className="text-3xl font-bold">{stats.averageDiscount.toFixed(1)}%</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
            <p className="text-dark-400 text-sm mb-2">Discount Frequency</p>
            <p className="text-3xl font-bold">{stats.discountFrequency.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Price Chart */}
      {priceHistory.length > 0 && <PriceHistoryChart data={priceHistory} />}

      {/* Prediction */}
      {prediction && (
        <div className="bg-dark-800 border border-xbox-green-light rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">📈 Sale Prediction</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-dark-400 text-sm mb-2">Next Expected Sale</p>
              <p className="text-xl font-bold">{format(new Date(prediction.nextSaleDate), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm mb-2">Est. Discount</p>
              <p className="text-3xl font-bold text-xbox-green-light">{prediction.estimatedDiscount.toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm mb-2">Est. Sale Price</p>
              <p className="text-3xl font-bold">${prediction.estimatedPrice.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center">
              <div>
                <p className="text-dark-400 text-sm mb-2 text-center">Confidence</p>
                <ConfidenceScore confidence={prediction.confidence} size={100} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GameDetail;
