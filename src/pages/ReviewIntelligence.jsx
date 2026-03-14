import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Star, TrendingUp, Loader } from 'lucide-react';
import api from '../utils/api';
import InsightCard from '../components/InsightCard';
import './ReviewIntelligence.css';

const ReviewIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState([]);
  const [aspectData, setAspectData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchReviewData();
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

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const res = await api.getReviewSentiment(selectedProduct);

      if (res.data) {
        setSentimentData(res.data.sentiment || []);
        setAspectData(res.data.aspects || []);
        setInsights(res.data.insights || []);
        setTotalReviews(res.data.total_reviews || 0);
        setAvgRating(res.data.avg_rating || 0);
      }
    } catch (error) {
      console.error('Error fetching review data:', error);
      setSentimentData([]);
      setAspectData([]);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="review-intelligence">
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <Loader className="animate-spin" size={40} style={{ margin: '0 auto 20px' }} />
          <p>Loading review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="review-intelligence">
      <div className="page-header">
        <h1>Review Intelligence</h1>
        <p>AI-powered sentiment analysis and insights</p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>No products to analyze. Add products first.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label>Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.title}</option>
              ))}
            </select>
          </div>

          {sentimentData.length > 0 ? (
            <>
              <div className="review-grid">
                <div className="chart-card">
                  <h3 className="chart-title">Overall Sentiment Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => {
                          const colors = ['#10b981', '#f59e0b', '#ef4444'];
                          return <Cell key={`cell-${index}`} fill={colors[index] || '#64748b'} />;
                        })}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="sentiment-summary">
                    <div className="summary-item">
                      <span className="summary-label">Total Reviews</span>
                      <span className="summary-value">{totalReviews}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Avg Rating</span>
                      <span className="summary-value">{avgRating.toFixed(1)} <Star size={16} fill="#f59e0b" color="#f59e0b" /></span>
                    </div>
                  </div>
                </div>

                {aspectData.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Aspect-Level Analysis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={aspectData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" domain={[0, 5]} stroke="#64748b" />
                        <YAxis dataKey="aspect" type="category" stroke="#64748b" width={120} />
                        <Tooltip />
                        <Bar dataKey="score" fill="#6366f1" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {insights.length > 0 && (
                <div className="insights-section">
                  <h2 className="section-title">AI-Generated Review Insights</h2>
                  <div className="insights-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                    {insights.map((insight) => (
                      <InsightCard
                        key={`review-insight-${insight.id}`}
                        insight={{
                          title: insight.title,
                          type: insight.type || 'review_analysis',
                          urgency_score: insight.urgency_level === 'high' ? 95 : 65,
                          confidence: 88,
                          explanation: insight.description,
                          action: insight.action || 'Review Customer Feedback'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {aspectData.length > 0 && (
                <div className="aspect-details">
                  <h2 className="section-title">Detailed Aspect Breakdown</h2>
                  <div className="aspect-table">
                    <div className="table-header">
                      <div>Aspect</div>
                      <div>Score</div>
                      <div>Reviews</div>
                      <div>Status</div>
                    </div>
                    {aspectData.map((aspect) => (
                      <div key={aspect.id} className="table-row">
                        <div className="aspect-name">{aspect.aspect}</div>
                        <div className="aspect-score">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          {aspect.score}
                        </div>
                        <div className="aspect-reviews">{aspect.review_count || 0}</div>
                        <div className="aspect-trend">
                          <TrendingUp size={16} color="#10b981" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p>No reviews data available for this product yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewIntelligence;
