import { useEffect, useState } from 'react';
import { Package, Lightbulb, Users, DollarSign, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import MetricsCard from '../components/MetricsCard';
import InsightCard from '../components/InsightCard';
import api from '../utils/api';
import realtime from '../utils/realtime';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState([
    { title: 'Total Products Tracked', value: '0', change: 0, icon: Package, color: '#6366f1' },
    { title: 'Active AI Insights', value: '0', icon: Lightbulb, color: '#f59e0b' },
    { title: 'Urgent Alerts', value: '0', icon: AlertCircle, color: '#ef4444' },
    { title: 'Est. Revenue Opportunity', value: '₹0', icon: DollarSign, color: '#10b981' },
  ]);
  const [priceData, setPriceData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    subscribeToRealtime();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch actual data from backend
      const [productsRes, insightsRes, alertsRes] = await Promise.all([
        api.getProducts(),
        api.getInsights(),
        api.getAlerts()
      ]);

      setProducts(productsRes.data);
      const topInsights = insightsRes.data.slice(0, 3);
      setInsights(topInsights);
      setAlerts(alertsRes.data || []);

      // Calculate Revenue Opportunity from actual insights if available
      const totalOpp = insightsRes.data
        .filter(ins => ins.metrics?.revenue_opportunity)
        .reduce((sum, ins) => sum + ins.metrics.revenue_opportunity, 0);

      // Update metrics with real data and INR currency
      setMetrics([
        { title: 'Total Products Tracked', value: (productsRes.data?.length || 0).toString(), icon: Package, color: '#6366f1' },
        { title: 'Active AI Insights', value: (insightsRes.data?.length || 0).toString(), icon: Lightbulb, color: '#f59e0b' },
        { title: 'Urgent Alerts', value: (alertsRes.data?.length || 0).toString(), icon: AlertCircle, color: '#ef4444' },
        { title: 'Est. Revenue Opportunity', value: `₹${totalOpp.toLocaleString('en-IN')}`, icon: DollarSign, color: '#10b981' },
      ]);

      // Handle empty states for charts
      if (productsRes.data && productsRes.data.length > 0) {
        generateChartData(productsRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = async (productId) => {
    try {
      // Use real price history if available, else empty
      const priceRes = await api.getPriceHistory(productId, 7);
      if (priceRes.data && priceRes.data.length > 0) {
        setPriceData(priceRes.data);
      }

      // Sentiment data should also come from real analysis 
      const insights = await api.getInsights({ productId, type: 'review_intelligence' });
      if (insights.data && insights.data.length > 0) {
        // Map real metrics to chart
        setSentimentData(insights.data[0].metrics?.sentiment_history || []);
      }
    } catch (error) {
      console.error('Error generating chart data:', error);
    }
  };

  const subscribeToRealtime = () => {
    realtime.on('new-insight', (insight) => {
      setInsights(prev => [insight, ...prev.slice(0, 2)]);
    });

    realtime.on('new-alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="skeleton-loader">
          <div className="skeleton" style={{ height: '100px' }}></div>
          <div className="skeleton" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your Real-Time Marketplace Intelligence</p>
        </div>
        {alerts.length > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="alert-badge"
          >
            {alerts.length} Urgent Alerts
          </motion.div>
        )}
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricsCard {...metric} />
          </motion.div>
        ))}
      </div>

      <div className="insights-section">
        <div className="section-header">
          <h2 className="section-title">AI Recommendations</h2>
          <button className="view-all-btn">View All →</button>
        </div>
        <div className="insights-grid">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <InsightCard insight={insight} />
              </motion.div>
            ))
          ) : (
            <div className="empty-state">
              <Zap size={32} />
              <p>No insights yet. Add products to get started!</p>
            </div>
          )}
        </div>
      </div>

      <div className="charts-section">
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="chart-header">
            <h3 className="chart-title">Price Trend Comparison</h3>
            <TrendingUp size={20} className="chart-icon" />
          </div>
          {priceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="yours" stroke="#6366f1" strokeWidth={3} name="Your Price" dot={{ fill: '#6366f1', r: 5 }} />
                <Line type="monotone" dataKey="competitor" stroke="#ef4444" strokeWidth={2} name="Competitor Price" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No price data available</div>
          )}
        </motion.div>

        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="chart-header">
            <h3 className="chart-title">Customer Sentiment Trends</h3>
            <AlertCircle size={20} className="chart-icon" />
          </div>
          {sentimentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Positive" />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Neutral" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Negative" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No sentiment data available</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
