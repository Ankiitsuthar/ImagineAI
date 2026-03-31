import { useState, useEffect } from 'react';
import { generationAPI, orderAPI } from '../services/api';
import { Palette, Inbox, Download, Image, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, Coins, ArrowRight, Sparkles } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import Pagination from '../components/Pagination';
import './History.css';

const IMG_PER_PAGE = 12;
const ORDER_PER_PAGE = 10;

const History = () => {
    const [activeTab, setActiveTab] = useState('generations');
    const [images, setImages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imgPage, setImgPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotal, setOrderTotal] = useState(0);
    const [orderTotalPages, setOrderTotalPages] = useState(1);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (activeTab === 'purchases') {
            fetchOrders(orderPage);
        }
    }, [orderPage]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [historyRes, ordersRes] = await Promise.all([
                generationAPI.getHistory(),
                orderAPI.getUserOrders(1, ORDER_PER_PAGE)
            ]);
            setImages(historyRes.data.images || []);
            setOrders(ordersRes.data.orders || []);
            setOrderTotal(ordersRes.data.total || 0);
            setOrderTotalPages(ordersRes.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (page) => {
        try {
            const res = await orderAPI.getUserOrders(page, ORDER_PER_PAGE);
            setOrders(res.data.orders || []);
            setOrderTotal(res.data.total || 0);
            setOrderTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const handleDownload = async (imageUrl, index) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `generated-image-${index + 1}.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed':
                return { icon: <CheckCircle size={15} />, label: 'Completed', className: 'status-completed' };
            case 'failed':
                return { icon: <XCircle size={15} />, label: 'Failed', className: 'status-failed' };
            case 'pending':
                return { icon: <AlertCircle size={15} />, label: 'Pending', className: 'status-pending' };
            default:
                return { icon: <Clock size={15} />, label: status, className: 'status-default' };
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Client-side pagination for images
    const totalImgPages = Math.ceil(images.length / IMG_PER_PAGE);
    const paginatedImages = images.slice(
        (imgPage - 1) * IMG_PER_PAGE,
        imgPage * IMG_PER_PAGE
    );

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="history-page">
            {/* Hero Header */}
            <div className="history-hero">
                <div className="history-hero-bg"></div>
                <div className="history-hero-content">
                    <h1>
                        <Clock size={32} />
                        Activity History
                    </h1>
                    <p>Track your creative journey and credit purchases</p>
                </div>

                {/* Stats Bar */}
                <div className="history-stats-bar">
                    <div className="history-stat-chip">
                        <Image size={16} />
                        <span><strong>{images.length}</strong> Generations</span>
                    </div>
                    <div className="history-stat-chip">
                        <CreditCard size={16} />
                        <span><strong>{orderTotal}</strong> Transactions</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="history-tabs-wrapper">
                <div className="history-tabs">
                    <button
                        className={`history-tab ${activeTab === 'generations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('generations')}
                    >
                        <Palette size={18} />
                        <span>Image Generations</span>
                        <span className="tab-count">{images.length}</span>
                    </button>
                    <button
                        className={`history-tab ${activeTab === 'purchases' ? 'active' : ''}`}
                        onClick={() => setActiveTab('purchases')}
                    >
                        <Coins size={18} />
                        <span>Credit Purchases</span>
                        <span className="tab-count">{orderTotal}</span>
                    </button>
                    <div className={`tab-indicator ${activeTab === 'purchases' ? 'right' : ''}`}></div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="history-content container">
                {/* ========== GENERATIONS TAB ========== */}
                {activeTab === 'generations' && (
                    <div className="tab-panel fade-in">
                        {images.length === 0 ? (
                            <div className="history-empty-state">
                                <div className="empty-icon-wrap">
                                    <Sparkles size={48} />
                                </div>
                                <h3>No generations yet</h3>
                                <p>Start creating stunning AI images and they'll appear here!</p>
                            </div>
                        ) : (
                            <>
                                <div className="gen-grid">
                                    {paginatedImages.map((img, index) => (
                                        <div key={img._id} className="gen-card">
                                            <div className="gen-card-image">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.generatedImagePath}`}
                                                    alt="Generated"
                                                    loading="lazy"
                                                />
                                                <div className="gen-card-overlay">
                                                    <button
                                                        className="gen-download-btn"
                                                        onClick={() => handleDownload(img.generatedImagePath, (imgPage - 1) * IMG_PER_PAGE + index)}
                                                        title="Download"
                                                    >
                                                        <Download size={18} />
                                                        Download
                                                    </button>
                                                </div>
                                                <span className="gen-badge-completed">
                                                    <CheckCircle size={12} /> Completed
                                                </span>
                                            </div>
                                            <div className="gen-card-body">
                                                <h4 className="gen-template-name">
                                                    {img.templateId?.name || 'Unknown Template'}
                                                </h4>
                                                <div className="gen-card-meta">
                                                    <span className="gen-date">
                                                        <Clock size={13} />
                                                        {formatDate(img.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={imgPage}
                                    totalPages={totalImgPages}
                                    onPageChange={setImgPage}
                                    totalItems={images.length}
                                    itemsPerPage={IMG_PER_PAGE}
                                />
                            </>
                        )}
                    </div>
                )}

                {/* ========== PURCHASES TAB ========== */}
                {activeTab === 'purchases' && (
                    <div className="tab-panel fade-in">
                        {orders.length === 0 ? (
                            <div className="history-empty-state">
                                <div className="empty-icon-wrap purchase">
                                    <CreditCard size={48} />
                                </div>
                                <h3>No purchases yet</h3>
                                <p>Buy credits to start generating amazing AI images!</p>
                            </div>
                        ) : (
                            <>
                                {/* Order Cards — Desktop Table + Mobile Cards */}
                                <div className="order-list">
                                    {/* Desktop Table Header */}
                                    <div className="order-table-header">
                                        <span>Package</span>
                                        <span>Credits</span>
                                        <span>Amount</span>
                                        <span>Status</span>
                                        <span>Date</span>
                                        <span>Transaction ID</span>
                                    </div>

                                    {orders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);
                                        return (
                                            <div key={order._id} className="order-row">
                                                <div className="order-cell order-package">
                                                    <div className="order-package-icon">
                                                        <Coins size={18} />
                                                    </div>
                                                    <span>{order.packageName || 'Credits'}</span>
                                                </div>
                                                <div className="order-cell order-credits">
                                                    <span className="mobile-label">Credits</span>
                                                    <span className="order-credits-value">+{order.credits}</span>
                                                </div>
                                                <div className="order-cell order-amount">
                                                    <span className="mobile-label">Amount</span>
                                                    <span className="order-amount-value">₹{order.amount?.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="order-cell order-status-cell">
                                                    <span className="mobile-label">Status</span>
                                                    <span className={`order-status-badge ${statusConfig.className}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className="order-cell order-date">
                                                    <span className="mobile-label">Date</span>
                                                    <div className="order-date-info">
                                                        <span>{formatDate(order.createdAt)}</span>
                                                        <span className="order-time">{formatTime(order.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="order-cell order-txn">
                                                    <span className="mobile-label">Transaction ID</span>
                                                    <span className="order-txn-id" title={order.transactionId}>
                                                        {order.transactionId ? `${order.transactionId.slice(0, 20)}...` : '—'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <Pagination
                                    currentPage={orderPage}
                                    totalPages={orderTotalPages}
                                    onPageChange={setOrderPage}
                                    totalItems={orderTotal}
                                    itemsPerPage={ORDER_PER_PAGE}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
