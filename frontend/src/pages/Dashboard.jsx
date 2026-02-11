import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, generationAPI } from '../services/api';
import { Star, Palette, Rocket, Sparkles, CreditCard, Hand } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentImages, setRecentImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get time-based greeting
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
            setRecentImages(historyRes.data.images?.slice(0, 6) || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-container container">
            <div className="dashboard-header">
                <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! <Hand size={28} /></h1>
                <p>Ready to create something amazing today?</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><Star size={24} /></div>
                    <div className="stat-content">
                        <h3>{user?.credits || 0}</h3>
                        <p>Available Credits</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><Palette size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats?.totalGenerations || 0}</h3>
                        <p>Total Generations</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon"><Rocket size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats?.totalGenerations || 0}</h3>
                        <p>Successful Creations</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/templates" className="action-card">
                        <span className="action-icon"><Sparkles size={24} /></span>
                        <h3>Generate Image</h3>
                        <p>Create stunning AI-powered images</p>
                    </Link>

                    <Link to="/buy-credits" className="action-card">
                        <span className="action-icon"><CreditCard size={24} /></span>
                        <h3>Buy Credits</h3>
                        <p>Get more credits to create more</p>
                    </Link>
                </div>
            </div>

            {recentImages.length > 0 && (
                <div className="recent-section">
                    <div className="section-header">
                        <h2>Recent Creations</h2>
                        <Link to="/history" className="btn btn-secondary btn-sm">View All</Link>
                    </div>
                    <div className="generations-grid">
                        {recentImages.map((img) => (
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
