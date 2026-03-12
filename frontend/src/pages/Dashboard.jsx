import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, generationAPI } from '../services/api';
import { Star, Palette, Rocket, Hand, ArrowRight, Sparkles, CreditCard, Clock, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingScreen from '../components/LoadingScreen';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentImages, setRecentImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, historyRes] = await Promise.all([
                userAPI.getProfile(),
                generationAPI.getHistory()
            ]);

            setStats(profileRes.data.stats);
            setRecentImages(historyRes.data.images || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Process generation history into chart data (last 7 days)
    const chartData = useMemo(() => {
        const days = 7;
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const count = recentImages.filter(img => {
                const imgDate = new Date(img.createdAt);
                return imgDate >= dayStart && imgDate <= dayEnd;
            }).length;

            data.push({ name: dateStr, generations: count });
        }
        return data;
    }, [recentImages]);

    const hasChartData = chartData.some(d => d.generations > 0);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! <Hand size={28} /></h1>
                <p>Ready to create something amazing today?</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Star size={22} /></div>
                    <div className="stat-content">
                        <h3>{user?.credits || 0}</h3>
                        <p>Available Credits</p>
                    </div>
                    <div className="stat-trend stat-trend-neutral">
                        <CreditCard size={14} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><Palette size={22} /></div>
                    <div className="stat-content">
                        <h3>{stats?.totalGenerations || 0}</h3>
                        <p>Total Generations</p>
                    </div>
                    <div className="stat-trend stat-trend-up">
                        <TrendingUp size={14} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><Rocket size={22} /></div>
                    <div className="stat-content">
                        <h3>{stats?.totalGenerations || 0}</h3>
                        <p>Successful Creations</p>
                    </div>
                    <div className="stat-trend stat-trend-up">
                        <TrendingUp size={14} />
                    </div>
                </div>
            </div>

            {/* Quick Action Bar */}
            <div className="quick-action-bar">
                <Link to="/templates" className="quick-action-btn quick-action-primary">
                    <Sparkles size={16} />
                    <span>Generate Image</span>
                    <ArrowRight size={14} />
                </Link>
                <Link to="/buy-credits" className="quick-action-btn quick-action-gold">
                    <CreditCard size={16} />
                    <span>Buy Credits</span>
                    <ArrowRight size={14} />
                </Link>
                <Link to="/history" className="quick-action-btn quick-action-outline">
                    <Clock size={16} />
                    <span>View History</span>
                    <ArrowRight size={14} />
                </Link>
            </div>

            {/* Activity Chart */}
            <div className="chart-section">
                <div className="chart-header">
                    <h2><TrendingUp size={20} /> Generation Activity</h2>
                    <span className="chart-subtitle">Last 7 days</span>
                </div>
                <div className="chart-card">
                    {hasChartData ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(139,92,246,0.15)',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(139,92,246,0.1)',
                                        padding: '10px 14px'
                                    }}
                                    labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                                    itemStyle={{ color: '#8b5cf6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="generations"
                                    stroke="#8b5cf6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorGen)"
                                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="chart-empty">
                            <Sparkles size={40} />
                            <p>No generations yet this week</p>
                            <span>Start creating to see your activity here!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Creations */}
            {recentImages.length > 0 && (
                <div className="recent-section">
                    <div className="section-header">
                        <h2>Recent Creations</h2>
                        <Link to="/history" className="btn btn-secondary btn-sm">View All</Link>
                    </div>
                    <div className="generations-grid">
                        {recentImages.slice(0, 6).map((img) => (
                            <div key={img._id} className="generation-preview">
                                {img.generatedImagePath && (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.generatedImagePath}`}
                                        alt="Generated"
                                    />
                                )}
                                <div className="generation-info">
                                    <span className="badge badge-success">Completed</span>
                                    <span className="text-muted">{new Date(img.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
