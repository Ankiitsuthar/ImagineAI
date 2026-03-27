import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import { Users, Palette, Image, DollarSign, Package, ArrowRight, TrendingUp, BarChart3 } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import LoadingScreen from '../../components/LoadingScreen';
import './Admin.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTemplates: 0,
        totalOrders: 0,
        totalGenerations: 0,
        totalRevenue: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [dashRes, revenueRes] = await Promise.all([
                statsAPI.getDashboard(),
                statsAPI.getRevenueAnalytics()
            ]);

            const data = dashRes.data;
            setStats({
                totalUsers: data.stats?.totalUsers || 0,
                totalTemplates: data.stats?.totalTemplates || 0,
                totalOrders: data.stats?.totalOrders || 0,
                totalGenerations: data.stats?.totalGenerations || 0,
                totalRevenue: data.stats?.totalRevenue || 0
            });
            setRecentUsers(data.recentUsers || []);
            setMonthlyRevenue(revenueRes.data?.monthlyRevenue || []);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Platform overview data for bar chart
    const platformData = [
        { name: 'Users', value: stats.totalUsers, fill: '#8b5cf6' },
        { name: 'Templates', value: stats.totalTemplates, fill: '#f59e0b' },
        { name: 'Generations', value: stats.totalGenerations, fill: '#10b981' },
        { name: 'Orders', value: stats.totalOrders, fill: '#6366f1' }
    ];

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="admin-page container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p className="text-muted">Manage your AI Image Generation platform</p>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-purple"><Users size={20} /></div>
                    <div className="admin-stat-body">
                        <span className="admin-stat-value">{stats.totalUsers}</span>
                        <span className="admin-stat-label">Total Users</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-amber"><Palette size={20} /></div>
                    <div className="admin-stat-body">
                        <span className="admin-stat-value">{stats.totalTemplates}</span>
                        <span className="admin-stat-label">Templates</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-emerald"><Image size={20} /></div>
                    <div className="admin-stat-body">
                        <span className="admin-stat-value">{stats.totalGenerations}</span>
                        <span className="admin-stat-label">Generations</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon admin-stat-indigo"><DollarSign size={20} /></div>
                    <div className="admin-stat-body">
                        <span className="admin-stat-value">{formatCurrency(stats.totalRevenue)}</span>
                        <span className="admin-stat-label">Total Revenue</span>
                    </div>
                </div>
            </div>

            {/* Quick Nav */}
            <div className="admin-quick-nav">
                <Link to="/admin/templates" className="admin-nav-btn">
                    <Palette size={15} />
                    <span>Templates</span>
                    <ArrowRight size={13} />
                </Link>
                <Link to="/admin/users" className="admin-nav-btn">
                    <Users size={15} />
                    <span>Users</span>
                    <ArrowRight size={13} />
                </Link>
                <Link to="/admin/orders" className="admin-nav-btn">
                    <Package size={15} />
                    <span>Orders</span>
                    <ArrowRight size={13} />
                </Link>
            </div>

            {/* Charts Grid */}
            <div className="admin-charts-grid">
                {/* Revenue Chart */}
                <div className="admin-chart-card">
                    <div className="admin-chart-header">
                        <h3><TrendingUp size={18} /> Monthly Revenue</h3>
                        <span className="admin-chart-badge">Last 6 months</span>
                    </div>
                    <div className="admin-chart-body">
                        {monthlyRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'rgba(255,255,255,0.95)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(139,92,246,0.15)',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 32px rgba(139,92,246,0.1)',
                                            padding: '10px 14px'
                                        }}
                                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                                        labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#8b5cf6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="admin-chart-empty">
                                <TrendingUp size={36} />
                                <p>No revenue data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Platform Overview */}
                <div className="admin-chart-card">
                    <div className="admin-chart-header">
                        <h3><BarChart3 size={18} /> Platform Overview</h3>
                    </div>
                    <div className="admin-chart-body">
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={platformData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
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
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                    {platformData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            {recentUsers.length > 0 && (
                <div className="admin-recent-section">
                    <h2>Recent Users</h2>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name || 'N/A'}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
