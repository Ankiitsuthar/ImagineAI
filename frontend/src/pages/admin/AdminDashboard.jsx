import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import { Crown, Users, Palette, Image, DollarSign, Package } from 'lucide-react';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await statsAPI.getDashboard();
            const data = response.data;

            setStats({
                totalUsers: data.stats?.totalUsers || 0,
                totalTemplates: data.stats?.totalTemplates || 0,
                totalOrders: data.stats?.totalOrders || 0,
                totalGenerations: data.stats?.totalGenerations || 0,
                totalRevenue: data.stats?.totalRevenue || 0
            });

            setRecentUsers(data.recentUsers || []);
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

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="admin-page container">
            <div className="admin-header">
                <h1>Admin Dashboard <Crown size={28} /></h1>
                <p className="text-muted">Manage your AI Image Generation platform</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card card-glass">
                    <div className="stat-icon"><Users size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.totalUsers}</h3>
                        <p>Total Users</p>
                    </div>
                </div>

                <div className="stat-card card-glass">
                    <div className="stat-icon"><Palette size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.totalTemplates}</h3>
                        <p>Templates</p>
                    </div>
                </div>

                <div className="stat-card card-glass">
                    <div className="stat-icon"><Image size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.totalGenerations}</h3>
                        <p>Generations</p>
                    </div>
                </div>

                <div className="stat-card card-glass">
                    <div className="stat-icon"><DollarSign size={24} /></div>
                    <div className="stat-content">
                        <h3>{formatCurrency(stats.totalRevenue)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
            </div>

            <div className="admin-actions">
                <h2>Management</h2>
                <div className="action-grid grid grid-3">
                    <Link to="/admin/templates" className="admin-action-card card-glass">
                        <span className="action-icon"><Palette size={28} /></span>
                        <h3>Templates</h3>
                        <p>Add, edit & delete templates</p>
                    </Link>

                    <Link to="/admin/users" className="admin-action-card card-glass">
                        <span className="action-icon"><Users size={28} /></span>
                        <h3>Users</h3>
                        <p>Manage user accounts</p>
                    </Link>

                    <Link to="/admin/orders" className="admin-action-card card-glass">
                        <span className="action-icon"><Package size={28} /></span>
                        <h3>Orders</h3>
                        <p>View all transactions</p>
                    </Link>
                </div>
            </div>

            {recentUsers.length > 0 && (
                <div className="admin-recent" style={{ marginTop: 'var(--spacing-2xl)' }}>
                    <h2>Recent Users</h2>
                    <div className="admin-table-container" style={{ marginTop: 'var(--spacing-lg)' }}>
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
