import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Package, Loader } from 'lucide-react';
import api from '../utils/api';
import InsightCard from '../components/InsightCard';
import './CompetitorRadar.css';

const CompetitorRadar = () => {
  const [sortBy, setSortBy] = useState('priceChange');
  const [filterEvent, setFilterEvent] = useState('all');
  const [competitors, setCompetitors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchCompetitorData();
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.data || []);
      if (res.data?.length > 0) {
        setSelectedProduct(res.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCompetitorData = async () => {
    try {
      setLoading(true);
      const res = await api.getCompetitors(selectedProduct);
      setCompetitors(res.data || []);

      const alertsRes = await api.getAlerts();
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error('Error fetching competitor data:', error);
      setCompetitors([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'price': return '#6366f1';
      case 'bundle': return '#f59e0b';
      case 'rating': return '#10b981';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="competitor-radar">
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <Loader className="animate-spin" size={40} style={{ margin: '0 auto 20px' }} />
          <p>Loading competitor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="competitor-radar">
      <div className="page-header">
        <h1>Competitor Radar</h1>
        <p>Track competitor activities and market changes</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>No products tracked yet. Add products to track competitors.</p>
        </div>
      ) : (
        <>
          <div className="controls">
            <div className="control-group">
              <label>Product</label>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.title}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priceChange">Price Change</option>
                <option value="ratingChange">Rating Change</option>
                <option value="lastUpdated">Last Updated</option>
              </select>
            </div>
            <div className="control-group">
              <label>Filter Events</label>
              <select value={filterEvent} onChange={(e) => setFilterEvent(e.target.value)}>
                <option value="all">All Events</option>
                <option value="price">Price Changes</option>
                <option value="bundle">Bundle Launches</option>
                <option value="rating">Rating Changes</option>
              </select>
            </div>
          </div>

          {competitors.length > 0 && (
            <div className="competitor-table-card">
              <div className="competitor-table">
                <div className="table-header">
                  <div>Competitor</div>
                  <div>Current Price</div>
                  <div>Price Change</div>
                  <div>Rating</div>
                  <div>Rating Change</div>
                  <div>Event</div>
                  <div>Last Updated</div>
                </div>
                {competitors.map((comp) => (
                  <div key={comp.id} className="table-row">
                    <div className="competitor-name">
                      <div className="competitor-avatar">
                        <Package size={16} />
                      </div>
                      {comp.name}
                    </div>
                    <div className="price-cell">₹{comp.current_price || 'N/A'}</div>
                    <div className="change-cell">
                      <span className={`change-badge ${comp.price_change < 0 ? 'negative' : comp.price_change > 0 ? 'positive' : 'neutral'}`}>
                        {comp.price_change < 0 ? <TrendingDown size={14} /> : comp.price_change > 0 ? <TrendingUp size={14} /> : null}
                        {comp.price_change !== 0 ? `${comp.price_change > 0 ? '+' : ''}${comp.price_change}%` : 'No change'}
                      </span>
                    </div>
                    <div className="rating-cell">
                      ⭐ {comp.rating || 'N/A'}
                    </div>
                    <div className="change-cell">
                      <span className={`change-badge ${comp.rating_change > 0 ? 'positive' : comp.rating_change < 0 ? 'negative' : 'neutral'}`}>
                        {comp.rating_change > 0 ? <TrendingUp size={14} /> : comp.rating_change < 0 ? <TrendingDown size={14} /> : null}
                        {comp.rating_change !== 0 ? `${comp.rating_change > 0 ? '+' : ''}${comp.rating_change}` : 'No change'}
                      </span>
                    </div>
                    <div className="event-cell">
                      <span className="event-badge" style={{ background: `${getEventColor(comp.event_type)}15`, color: getEventColor(comp.event_type) }}>
                        <AlertCircle size={12} />
                        {comp.event_type}
                      </span>
                    </div>
                    <div className="time-cell">{comp.last_updated || 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alerts.length > 0 && (
            <div className="alerts-section">
              <h2 className="section-title">Recent Competitor Intelligence</h2>
              <div className="alerts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                {alerts.slice(0, 3).map((alert) => (
                  <InsightCard
                    key={`comp-alert-${alert.id}`}
                    insight={{
                      title: alert.title,
                      type: 'competitor_activity',
                      urgency_score: alert.severity === 'high' ? 95 : alert.severity === 'warning' ? 80 : 60,
                      confidence: 90,
                      explanation: alert.message,
                      action: 'Review Market Strategy'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompetitorRadar;
