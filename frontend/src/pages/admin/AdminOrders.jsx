import { useState, useEffect } from 'react';
import { orderAPI, statsAPI } from '../../services/api';
import {
    Package, CheckCircle, AlertTriangle, Clock, XCircle, RotateCcw,
    Coins, DollarSign, TrendingUp, Users,
    BarChart3, Download, FileSpreadsheet
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import LoadingScreen from '../../components/LoadingScreen';
import Pagination from '../../components/Pagination';
import './Admin.css';
import './AdminDashboard.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            try {
                const response = await orderAPI.getAllOrders(currentPage, 20, statusFilter);
                setOrders(response.data.orders || []);
                setTotalPages(response.data.totalPages || 1);
                setTotal(response.data.total || 0);
                setTotalRevenue(response.data.totalRevenue || 0);
            } catch (err) {
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

    const fetchAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const response = await statsAPI.getRevenueAnalytics();
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await orderAPI.exportOrders(statusFilter);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_report_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showAlertMsg('success', 'Report downloaded successfully!');
        } catch (error) {
            console.error('Error exporting orders:', error);
            showAlertMsg('error', 'Failed to export orders');
        } finally {
            setExporting(false);
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
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
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

    if (loading && orders.length === 0) {
        return <LoadingScreen />;
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1><Package size={28} /> Revenue & Orders</h1>
                <div className="header-actions">
                    <button
                        className="btn btn-export"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        {exporting ? (
                            <><Download size={16} className="spin" /> Exporting...</>
                        ) : (
                            <><FileSpreadsheet size={16} /> Download Report</>
                        )}
                    </button>
                    <span className="revenue-total-badge">
                        Total Revenue: {formatCurrency(totalRevenue)}
                    </span>
                </div>
            </div>

            {alert.show && (
                <div className={`admin-alert ${alert.type}`}>
                    {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {alert.message}
                </div>
            )}

            {/* Revenue Analytics Section */}
            {!analyticsLoading && analytics && (
                <>
                    {/* Revenue Stats Cards */}
                    <div className="admin-stats-grid">
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon admin-stat-purple"><DollarSign size={20} /></div>
                            <div className="admin-stat-body">
                                <span className="admin-stat-value">{formatCurrency(analytics.stats?.totalRevenue || 0)}</span>
                                <span className="admin-stat-label">Total Revenue</span>
                            </div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon admin-stat-amber"><Package size={20} /></div>
                            <div className="admin-stat-body">
                                <span className="admin-stat-value">{analytics.stats?.totalOrders || 0}</span>
                                <span className="admin-stat-label">Total Orders</span>
                            </div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon admin-stat-emerald"><Coins size={20} /></div>
                            <div className="admin-stat-body">
                                <span className="admin-stat-value">{analytics.stats?.totalCreditsSold || 0}</span>
                                <span className="admin-stat-label">Credits Sold</span>
                            </div>
                        </div>
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon admin-stat-indigo"><TrendingUp size={20} /></div>
                            <div className="admin-stat-body">
                                <span className="admin-stat-value">{formatCurrency(analytics.stats?.avgOrderValue || 0)}</span>
                                <span className="admin-stat-label">Avg. Order Value</span>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Revenue Chart + Top Purchasers */}
                    <div className="admin-charts-grid" style={{ marginBottom: '2rem' }}>
                        {/* Monthly Revenue Chart — using Recharts */}
                        <div className="admin-chart-card">
                            <div className="admin-chart-header">
                                <h3><BarChart3 size={18} /> Monthly Revenue</h3>
                                <span className="admin-chart-badge">Last 6 months</span>
                            </div>
                            <div className="admin-chart-body">
                                {analytics.monthlyRevenue?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={analytics.monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                                            <Bar
                                                dataKey="revenue"
                                                fill="#8b5cf6"
                                                radius={[6, 6, 0, 0]}
                                                barSize={36}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="admin-chart-empty">
                                        <BarChart3 size={36} />
                                        <p>No revenue data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Purchasers */}
                        <div className="admin-chart-card">
                            <div className="admin-chart-header">
                                <h3><Users size={18} /> Top Purchasers</h3>
                            </div>
                            <div className="admin-chart-body" style={{ padding: '0.75rem 1.25rem 1.25rem' }}>
                                {analytics.topPurchasers?.length > 0 ? (
                                    <div className="top-purchasers-list">
                                        {analytics.topPurchasers.map((purchaser, idx) => (
                                            <div key={purchaser._id} className="purchaser-item">
                                                <div className="purchaser-rank">#{idx + 1}</div>
                                                <div className="purchaser-info">
                                                    <span className="purchaser-name">{purchaser.user?.name || 'Unknown'}</span>
                                                    <span className="purchaser-email">{purchaser.user?.email || 'N/A'}</span>
                                                </div>
                                                <div className="purchaser-stats">
                                                    <span className="purchaser-spent">{formatCurrency(purchaser.totalSpent)}</span>
                                                    <span className="purchaser-orders">{purchaser.totalOrders} orders · {purchaser.totalCredits} credits</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="admin-chart-empty">
                                        <Users size={36} />
                                        <p>No purchase data yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Package Breakdown */}
                    {analytics.packageBreakdown?.length > 0 && (
                        <div className="admin-chart-card" style={{ marginBottom: '2rem' }}>
                            <div className="admin-chart-header">
                                <h3><Package size={18} /> Package Breakdown</h3>
                            </div>
                            <div style={{ padding: '0 1.25rem 1.25rem' }}>
                                <div className="admin-table-container" style={{ border: 'none', boxShadow: 'none' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Package</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                                <th>Credits Sold</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.packageBreakdown.map(pkg => (
                                                <tr key={pkg._id}>
                                                    <td style={{ fontWeight: '600' }}>{pkg._id}</td>
                                                    <td>{pkg.count}</td>
                                                    <td style={{ fontWeight: '600', color: '#22c55e' }}>{formatCurrency(pkg.revenue)}</td>
                                                    <td><Coins size={14} style={{ marginRight: '4px' }} />{pkg.creditsSold}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Orders Table Section */}
            <div className="orders-table-section">
                <div className="orders-table-header">
                    <h2>All Orders</h2>
                    <div className="orders-table-controls">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="orders-status-filter"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <span className="orders-count-text">
                            Showing {orders.length} of {total} orders
                        </span>
                    </div>
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
                                            <span className="order-id-cell">
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
                                            <span className="credits-cell">
                                                <Coins size={14} /> {order.credits || order.creditsPurchased || 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${order.status || 'pending'}`}>
                                                {getStatusIcon(order.status)}{' '}
                                                {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            {formatDate(order.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
        </div>
    );
};

export default AdminOrders;
