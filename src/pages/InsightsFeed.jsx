import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import InsightCard from '../components/InsightCard';
import api from '../utils/api';
import './InsightsFeed.css';

const InsightsFeed = () => {
  const [filter, setFilter] = useState('all');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();

    // Listen for real-time insight updates
    if (window.socket) {
      window.socket.on('new_insight', (newInsight) => {
        setInsights(prev => [newInsight, ...prev]);
      });
    }

    return () => {
      if (window.socket) {
        window.socket.off('new_insight');
      }
    };
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getInsights();
      setInsights(res.data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="insights-feed">
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <Loader className="animate-spin" size={40} style={{ margin: '0 auto 20px' }} />
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === filter);

  return (
    <div className="insights-feed">
      <div className="page-header">
        <h1>Insights Feed</h1>
        <p>AI-generated recommendations and actionable insights</p>
      </div>

      <div className="feed-controls">
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Insights
          </button>
          <button 
            className={filter === 'pricing' ? 'active' : ''}
            onClick={() => setFilter('pricing')}
          >
            Pricing
          </button>
          <button 
            className={filter === 'reviews' ? 'active' : ''}
            onClick={() => setFilter('reviews')}
          >
            Reviews
          </button>
          <button 
            className={filter === 'competitors' ? 'active' : ''}
            onClick={() => setFilter('competitors')}
          >
            Competitors
          </button>
          <button 
            className={filter === 'logistics' ? 'active' : ''}
            onClick={() => setFilter('logistics')}
          >
            Logistics
          </button>
        </div>
        <div className="insights-count">
          {filteredInsights.length} insights
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>No insights yet. Start by adding products and tracking competitors.</p>
        </div>
      ) : (
        <div className="insights-feed-grid">
          {filteredInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightsFeed;
