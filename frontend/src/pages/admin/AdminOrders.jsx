import { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import { Package, CheckCircle, AlertTriangle, Clock, XCircle, RotateCcw, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import './Admin.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Try the orders/all endpoint first
            try {
                const response = await orderAPI.getAllOrders(currentPage, 20, statusFilter);
                setOrders(response.data.orders || []);
                setTotalPages(response.data.totalPages || 1);
                setTotal(response.data.total || 0);
                setTotalRevenue(response.data.totalRevenue || 0);
            } catch (err) {
                // Fallback to transactions endpoint
                const response = await orderAPI.getTransactions();
                const transactions = response.data.transactions || response.data || [];
                setOrders(transactions);
                setTotalPages(1);
                setTotal(transactions.length);
                const revenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                setTotalRevenue(revenue);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            showAlertMsg('error', 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const showAlertMsg = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} />;
            case 'pending': return <Clock size={14} />;
            case 'failed': return <XCircle size={14} />;
            case 'refunded': return <RotateCcw size={14} />;
            default: return <Clock size={14} />;
        }
    };

    // Calculate stats
    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'completed').length,
        failed: orders.filter(o => o.status === 'failed').length,
        refunded: orders.filter(o => o.status === 'refunded').length
    };

    if (loading && orders.length === 0) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1><Package size={28} /> Manage Orders</h1>
                <div className="header-actions">
                    <span style={{
                        padding: '8px 16px',
                        background: 'var(--primary-gradient)',
                        borderRadius: '8px',
                        fontWeight: '600'
                    }}>
                        Total Revenue: {formatCurrency(totalRevenue)}
                    </span>
                </div>
            </div>

            {alert.show && (
                <div className={`admin-alert ${alert.type}`}>
                    {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {alert.message}
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
                <div className="stat-card card-glass">
                    <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', fontSize: '1.5rem' }}><Clock size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.pending}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div className="stat-card card-glass">
                    <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', fontSize: '1.5rem' }}><CheckCircle size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="stat-card card-glass">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', fontSize: '1.5rem' }}><XCircle size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.failed}</h3>
                        <p>Failed</p>
                    </div>
                </div>
                <div className="stat-card card-glass">
                    <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', fontSize: '1.5rem' }}><RotateCcw size={24} /></div>
                    <div className="stat-content">
                        <h3>{stats.refunded}</h3>
                        <p>Refunded</p>
                    </div>
                </div>
            </div>

            <div className="admin-search-bar">
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    Showing {orders.length} of {total} orders
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon"><Package size={32} /></div>
                    <h3>No orders found</h3>
                    <p>Orders will appear here once customers make purchases</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Package</th>
                                <th>Amount</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>
                                        <span style={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {order._id?.slice(-8) || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        {order.user ? (
                                            <div className="table-user-cell">
                                                <div className="user-info">
                                                    <span className="user-name">
                                                        {order.user.name || 'N/A'}
                                                    </span>
                                                    <span className="user-email">
                                                        {order.user.email || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)' }}>Unknown</span>
                                        )}
                                    </td>
                                    <td>{order.packageName || 'N/A'}</td>
                                    <td style={{ fontWeight: '600' }}>
                                        {formatCurrency(order.amount || 0)}
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Coins size={14} /> {order.credits || order.creditsPurchased || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${order.status || 'pending'}`}>
                                            {getStatusIcon(order.status)}{' '}
                                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {formatDate(order.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
