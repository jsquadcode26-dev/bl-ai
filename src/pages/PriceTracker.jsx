import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Loader } from 'lucide-react';
import api from '../utils/api';
import InsightCard from '../components/InsightCard';
import './PriceTracker.css';

const PriceTracker = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [products, setProducts] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [volatility, setVolatility] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProduct && products.length > 0) {
      fetchPriceComparison();
    }
  }, [selectedProduct, timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const productsRes = await api.getProducts();
      setProducts(productsRes.data || []);
      if (productsRes.data?.length > 0) {
        setSelectedProduct(productsRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceComparison = async () => {
    try {
      const res = await api.getPriceComparison(selectedProduct);
      setPriceData(res.data?.priceHistory || []);
      setVolatility(res.data?.volatility || []);
      setRecommendations(res.data?.recommendations || []);
    } catch (error) {
      console.error('Error fetching price data:', error);
      setPriceData([]);
      setVolatility([]);
      setRecommendations([]);
    }
  };

  if (loading) {
    return (
      <div className="price-tracker">
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <Loader className="animate-spin" size={40} style={{ margin: '0 auto 20px' }} />
          <p>Loading price data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="price-tracker">
      <div className="page-header">
        <h1>Price Tracker</h1>
        <p>Monitor and compare pricing across competitors</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>No products tracked yet. Add a product to get started.</p>
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
              <label>Time Range</label>
              <div className="button-group">
                <button
                  className={timeRange === '7d' ? 'active' : ''}
                  onClick={() => setTimeRange('7d')}
                >
                  7 Days
                </button>
                <button
                  className={timeRange === '30d' ? 'active' : ''}
                  onClick={() => setTimeRange('30d')}
                >
                  30 Days
                </button>
              </div>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="recommendations-container" style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              {recommendations.map((rec) => (
                <InsightCard
                  key={`price-rec-${rec.id}`}
                  insight={{
                    title: rec.title,
                    type: 'pricing',
                    urgency_score: rec.impact === 'high' ? 95 : 70,
                    confidence: rec.confidence || 85,
                    explanation: rec.description,
                    action: 'Review Pricing Strategy'
                  }}
                />
              ))}
            </div>
          )}

          {priceData.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Price Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="yours" stroke="#6366f1" strokeWidth={3} name="Your Price" />
                  <Line type="monotone" dataKey="comp1" stroke="#ef4444" strokeWidth={2} name="Competitor A" />
                  <Line type="monotone" dataKey="comp2" stroke="#f59e0b" strokeWidth={2} name="Competitor B" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {volatility.length > 0 && (
            <div className="volatility-section">
              <h2 className="section-title">Price Volatility Indicators</h2>
              <div className="volatility-grid">
                {volatility.map((item, index) => (
                  <div key={index} className="volatility-card">
                    <div className="volatility-header">
                      <h4>{item.competitor}</h4>
                      {item.trend === 'down' ? (
                        <TrendingDown className="trend-icon down" size={20} />
                      ) : (
                        <TrendingUp className="trend-icon up" size={20} />
                      )}
                    </div>
                    <div className="volatility-value">{item.volatility}%</div>
                    <div className="volatility-bar">
                      <div
                        className="volatility-fill"
                        style={{ width: `${item.volatility * 10}%` }}
                      />
                    </div>
                    <p className="volatility-label">Price Change</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PriceTracker;
