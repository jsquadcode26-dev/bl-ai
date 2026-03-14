import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Truck, TrendingDown, Award, Loader } from 'lucide-react';
import api from '../utils/api';
import InsightCard from '../components/InsightCard';
import './LogisticsIntelligence.css';

const LogisticsIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState([]);
  const [costTrend, setCostTrend] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchLogisticsData();
  }, []);

  const fetchLogisticsData = async () => {
    try {
      setLoading(true);
      const res = await api.getLogisticsData();

      if (res.data) {
        setProviders(res.data.providers || []);
        setCostTrend(res.data.cost_trends || []);
        setRecommendations(res.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching logistics data:', error);
      setProviders([]);
      setCostTrend([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="logistics-intelligence">
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <Loader className="animate-spin" size={40} style={{ margin: '0 auto 20px' }} />
          <p>Loading logistics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="logistics-intelligence">
      <div className="page-header">
        <h1>Logistics Intelligence</h1>
        <p>Optimize shipping costs and delivery performance</p>
      </div>

      {providers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          <p>No logistics data available yet.</p>
        </div>
      ) : (
        <>
          <div className="provider-comparison">
            <h2 className="section-title">Provider Cost Comparison</h2>
            <div className="comparison-table">
              <div className="table-header">
                <div>Provider</div>
                <div>Zone 1</div>
                <div>Zone 2</div>
                <div>Zone 3</div>
                <div>Rating</div>
                <div>Avg Delivery</div>
              </div>
              {providers.map((provider) => (
                <div key={provider.id} className="table-row">
                  <div className="provider-name">
                    <div className="provider-icon">
                      <Truck size={16} />
                    </div>
                    {provider.name}
                  </div>
                  <div className="cost-cell">₹{provider.zone1_cost || 0}</div>
                  <div className="cost-cell">₹{provider.zone2_cost || 0}</div>
                  <div className="cost-cell">₹{provider.zone3_cost || 0}</div>
                  <div className="rating-cell">
                    ⭐ {provider.rating || 0}
                  </div>
                  <div className="time-cell">{provider.avg_delivery_time || 'N/A'}</div>
                </div>
              ))}
            </div>
          </div>

          {costTrend.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Weekly Logistics Cost Trends</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={costTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  {Object.keys(costTrend[0] || {})
                    .filter(key => key !== 'week')
                    .map((provider) => (
                      <Line
                        key={provider}
                        type="monotone"
                        dataKey={provider}
                        stroke={['#6366f1', '#10b981', '#f59e0b'][Object.keys(costTrend[0]).indexOf(provider) - 1]}
                        strokeWidth={2}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h2 className="section-title">Cost Optimization Recommendations</h2>
              <div className="recommendations-grid">
                {recommendations.map((rec) => (
                  <InsightCard
                    key={`logistics-rec-${rec.id || Math.random()}`}
                    insight={{
                      title: rec.title,
                      type: 'logistics_optimization',
                      urgency_score: rec.impact === 'high' ? 90 : 60,
                      confidence: Math.floor(Math.random() * 20) + 80, // 80-99
                      explanation: rec.description,
                      action: `Implement to save ${rec.potential_savings}`
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

export default LogisticsIntelligence;
