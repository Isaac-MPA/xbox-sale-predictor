'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ConfidenceScore from '@/components/ConfidenceScore';
import axios from 'axios';
import { format } from 'date-fns';

const UpcomingSales: React.FC = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingSales = async () => {
      try {
        const response = await axios.get('/api/predictions/upcoming?limit=20');
        setSales(response.data.data);
      } catch (error) {
        console.error('Error fetching upcoming sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingSales();
  }, []);

  return (
    <Layout title="Upcoming Sales - Xbox Sale Predictor">
      <h1 className="text-4xl font-bold mb-8">⏰ Upcoming Predicted Sales</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {sales.map((sale: any) => (
            <a
              key={sale.id}
              href={`/game/${sale.gameId}`}
              className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-xbox-green-light transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                {sale.game?.coverArt && (
                  <img src={sale.game.coverArt} alt={sale.game.title} className="w-20 h-20 rounded object-cover" />
                )}
                <div>
                  <h3 className="text-xl font-bold mb-2">{sale.game?.title}</h3>
                  <p className="text-dark-400 text-sm mb-2">{sale.game?.genre}</p>
                  <p className="text-sm">
                    <span className="text-xbox-green-light">Expected:</span> {format(new Date(sale.nextSaleDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-dark-400 text-sm">Est. Discount</p>
                  <p className="text-2xl font-bold text-xbox-green-light">{sale.estimatedDiscount.toFixed(0)}%</p>
                  <p className="text-dark-400 text-sm">Est. Price: ${sale.estimatedPrice.toFixed(2)}</p>
                </div>
                <div className="w-24 h-24 flex items-center justify-center">
                  <div style={{ width: '80px', height: '80px' }}>
                    <ConfidenceScore confidence={sale.confidence} size={80} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default UpcomingSales;
