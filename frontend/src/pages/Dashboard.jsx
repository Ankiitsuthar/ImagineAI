import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, generationAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentImages, setRecentImages] = useState([]);
    const [loading, setLoading] = useState(true);

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
            // historyRes.data.images contains all images, take top 6
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
                <div>
                    <h1>Welcome back, {user?.name}! 👋</h1>
                    <p className="text-muted">Ready to create amazing AI images?</p>
                </div>
            </div>

            <div className="stats-grid grid grid-3">
                <div className="stat-card card-glass">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <h3>{user?.credits || 0}</h3>
                        <p>Available Credits</p>
                    </div>
                </div>

                <div className="stat-card card-glass">
                    <div className="stat-icon">🎨</div>
                    <div className="stat-content">
                        <h3>{stats?.totalGenerations || 0}</h3>
                        <p>Total Generations</p>
                    </div>
                </div>

                {/* Removed Completed Generations as it's not tracked separately anymore */}
                <div className="stat-card card-glass">
                    <div className="stat-icon">🚀</div>
                    <div className="stat-content">
                        <h3>{stats?.totalGenerations || 0}</h3>
                        <p>Successful Creations</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons grid grid-2">
                    <Link to="/generate" className="action-card card-glass">
                        <span className="action-icon">✨</span>
                        <h3>Generate Image</h3>
                        <p>Create a new AI-powered image</p>
                    </Link>

                    <Link to="/buy-credits" className="action-card card-glass">
                        <span className="action-icon">💳</span>
                        <h3>Buy Credits</h3>
                        <p>Purchase more credits</p>
                    </Link>
                </div>
            </div>

            {recentImages.length > 0 && (
                <div className="recent-section">
                    <div className="section-header flex-between">
                        <h2>Recent Generations</h2>
                        <Link to="/history" className="btn btn-secondary btn-sm">View All</Link>
                    </div>
                    <div className="generations-grid grid grid-3">
                        {recentImages.map((img) => (
                            <div key={img._id} className="generation-preview card">
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
