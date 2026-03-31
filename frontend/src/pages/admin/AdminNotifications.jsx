import { useState, useEffect } from 'react';
import { contactAPI } from '../../services/api';
import {
    Bell, Search, CheckCircle, AlertTriangle, Clock,
    MessageSquare, Mail, Calendar, Filter, ChevronDown,
    Inbox
} from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import Pagination from '../../components/Pagination';
import './Admin.css';

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: '#f59e0b', icon: <Clock size={14} /> },
    responded: { label: 'Responded', color: '#3b82f6', icon: <MessageSquare size={14} /> },
    resolved: { label: 'Resolved', color: '#22c55e', icon: <CheckCircle size={14} /> }
};

const AdminNotifications = () => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [expandedId, setExpandedId] = useState(null);
    const [stats, setStats] = useState({ pending: 0, responded: 0, resolved: 0 });

    useEffect(() => {
        fetchQueries();
    }, [currentPage, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll(currentPage, 20, statusFilter);
            setQueries(response.data.data.contacts || []);
            setTotalPages(response.data.data.totalPages || 1);
            setTotal(response.data.data.total || 0);
        } catch (error) {
            console.error('Error fetching queries:', error);
            showAlertMsg('error', 'Failed to load contact queries');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [pendingRes, respondedRes, resolvedRes] = await Promise.all([
                contactAPI.getAll(1, 1, 'pending'),
                contactAPI.getAll(1, 1, 'responded'),
                contactAPI.getAll(1, 1, 'resolved')
            ]);
            setStats({
                pending: pendingRes.data.data.total || 0,
                responded: respondedRes.data.data.total || 0,
                resolved: resolvedRes.data.data.total || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const showAlertMsg = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleStatusChange = async (queryId, newStatus) => {
        try {
            await contactAPI.updateStatus(queryId, newStatus);
            setQueries(queries.map(q =>
                q._id === queryId ? { ...q, status: newStatus } : q
            ));
            showAlertMsg('success', `Status updated to ${newStatus}`);
            fetchStats();
        } catch (error) {
            console.error('Error updating status:', error);
            showAlertMsg('error', 'Failed to update status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFilterChange = (filter) => {
        setStatusFilter(filter);
        setCurrentPage(1);
    };

    if (loading && queries.length === 0) {
        return <LoadingScreen />;
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1><Bell size={28} /> Notifications & Queries</h1>
                <div className="header-actions">
                    <span style={{ color: 'var(--text-muted)' }}>
                        {stats.pending} pending
                    </span>
                </div>
            </div>

            {alert.show && (
                <div className={`admin-alert ${alert.type}`}>
                    {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {alert.message}
                </div>
            )}

            {/* Stats Cards */}
            <div className="notif-stats-grid">
                <div
                    className={`notif-stat-card ${statusFilter === '' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('')}
                >
                    <div className="notif-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                        <Inbox size={20} />
                    </div>
                    <div className="notif-stat-content">
                        <span className="notif-stat-value">{stats.pending + stats.responded + stats.resolved}</span>
                        <span className="notif-stat-label">All Queries</span>
                    </div>
                </div>
                <div
                    className={`notif-stat-card ${statusFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('pending')}
                >
                    <div className="notif-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                        <Clock size={20} />
                    </div>
                    <div className="notif-stat-content">
                        <span className="notif-stat-value">{stats.pending}</span>
                        <span className="notif-stat-label">Pending</span>
                    </div>
                </div>
                <div
                    className={`notif-stat-card ${statusFilter === 'responded' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('responded')}
                >
                    <div className="notif-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                        <MessageSquare size={20} />
                    </div>
                    <div className="notif-stat-content">
                        <span className="notif-stat-value">{stats.responded}</span>
                        <span className="notif-stat-label">Responded</span>
                    </div>
                </div>
                <div
                    className={`notif-stat-card ${statusFilter === 'resolved' ? 'active' : ''}`}
                    onClick={() => handleFilterChange('resolved')}
                >
                    <div className="notif-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e' }}>
                        <CheckCircle size={20} />
                    </div>
                    <div className="notif-stat-content">
                        <span className="notif-stat-value">{stats.resolved}</span>
                        <span className="notif-stat-label">Resolved</span>
                    </div>
                </div>
            </div>

            {/* Queries List */}
            {queries.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon"><Inbox size={32} /></div>
                    <h3>No queries found</h3>
                    <p>{statusFilter ? `No ${statusFilter} queries` : 'No contact form submissions yet'}</p>
                </div>
            ) : (
                <div className="notif-list">
                    {queries.map(query => {
                        const statusCfg = STATUS_CONFIG[query.status] || STATUS_CONFIG.pending;
                        const isExpanded = expandedId === query._id;

                        return (
                            <div
                                key={query._id}
                                className={`notif-card ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => setExpandedId(isExpanded ? null : query._id)}
                            >
                                <div className="notif-card-header">
                                    <div className="notif-card-left">
                                        <div className="notif-avatar">
                                            {query.name?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="notif-card-info">
                                            <span className="notif-card-name">{query.name}</span>
                                            <span className="notif-card-email">
                                                <Mail size={12} /> {query.email}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="notif-card-right">
                                        <span
                                            className="notif-status-badge"
                                            style={{ background: `${statusCfg.color}18`, color: statusCfg.color, border: `1px solid ${statusCfg.color}30` }}
                                        >
                                            {statusCfg.icon} {statusCfg.label}
                                        </span>
                                        <span className="notif-card-date">
                                            <Clock size={12} /> {formatDate(query.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="notif-card-body" onClick={e => e.stopPropagation()}>
                                        {query.eventDate && (
                                            <div className="notif-detail-row">
                                                <Calendar size={14} />
                                                <span>Event Date: {new Date(query.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        )}
                                        <div className="notif-message-box">
                                            <p>{query.message}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="notif-card-footer" onClick={e => e.stopPropagation()}>
                                    <a
                                        href={`https://mail.google.com/mail/?view=cm&to=${query.email}&su=Re: Your inquiry on ImagineAI`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                    >
                                        <Mail size={14} /> Reply via Email
                                    </a>
                                    <div className="notif-status-actions">
                                        {query.status !== 'responded' && (
                                            <button
                                                className="notif-status-btn responded"
                                                onClick={() => handleStatusChange(query._id, 'responded')}
                                            >
                                                <MessageSquare size={14} /> Responded
                                            </button>
                                        )}
                                        {query.status !== 'resolved' && (
                                            <button
                                                className="notif-status-btn resolved"
                                                onClick={() => handleStatusChange(query._id, 'resolved')}
                                            >
                                                <CheckCircle size={14} /> Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={total}
                        itemsPerPage={20}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;
