import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import './Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [editingCredits, setEditingCredits] = useState({ userId: null, value: 0 });

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAllUsers(currentPage, 20, searchTerm);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlert('error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers();
    };

    const handleToggleStatus = async (userId) => {
        try {
            const response = await userAPI.toggleStatus(userId);
            setUsers(users.map(u => u._id === userId ? response.data.user : u));
            showAlert('success', response.data.message);
        } catch (error) {
            console.error('Error toggling status:', error);
            showAlert('error', error.response?.data?.message || 'Failed to toggle status');
        }
    };

    const handleCreditsEdit = (user) => {
        setEditingCredits({ userId: user._id, value: user.credits });
    };

    const handleCreditsSave = async (userId) => {
        try {
            const response = await userAPI.updateCredits(userId, editingCredits.value);
            setUsers(users.map(u => u._id === userId ? response.data.user : u));
            setEditingCredits({ userId: null, value: 0 });
            showAlert('success', 'Credits updated successfully');
        } catch (error) {
            console.error('Error updating credits:', error);
            showAlert('error', 'Failed to update credits');
        }
    };

    const handleCreditsCancel = () => {
        setEditingCredits({ userId: null, value: 0 });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && users.length === 0) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1>👥 Manage Users</h1>
                <div className="header-actions">
                    <span style={{ color: 'var(--text-muted)' }}>
                        Total: {total} users
                    </span>
                </div>
            </div>

            {alert.show && (
                <div className={`admin-alert ${alert.type}`}>
                    {alert.type === 'success' ? '✓' : '⚠'} {alert.message}
                </div>
            )}

            <form onSubmit={handleSearch} className="admin-search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {users.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon">👥</div>
                    <h3>No users found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="table-user-cell">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="user-avatar"
                                                />
                                            ) : (
                                                <div
                                                    className="user-avatar"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.25rem',
                                                        color: 'white'
                                                    }}
                                                >
                                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="user-info">
                                                <span className="user-name">{user.name || 'N/A'}</span>
                                                <span className="user-email">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.role}`}>
                                            {user.role === 'admin' ? '👑' : '👤'} {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        {editingCredits.userId === user._id ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={editingCredits.value}
                                                    onChange={(e) => setEditingCredits({
                                                        ...editingCredits,
                                                        value: parseInt(e.target.value) || 0
                                                    })}
                                                    style={{
                                                        width: '80px',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border-color)',
                                                        background: 'var(--bg-secondary)',
                                                        color: 'var(--text-primary)'
                                                    }}
                                                    min="0"
                                                />
                                                <button
                                                    onClick={() => handleCreditsSave(user._id)}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#22c55e',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={handleCreditsCancel}
                                                    style={{
                                                        padding: '4px 8px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        ) : (
                                            <span
                                                onClick={() => handleCreditsEdit(user)}
                                                style={{ cursor: 'pointer' }}
                                                title="Click to edit"
                                            >
                                                💰 {user.credits}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                            {user.isActive ? '✓ Active' : '✗ Inactive'}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleCreditsEdit(user)}
                                            >
                                                💰 Credits
                                            </button>
                                            <button
                                                className={`action-btn toggle`}
                                                onClick={() => handleToggleStatus(user._id)}
                                            >
                                                {user.isActive ? '🔒 Disable' : '🔓 Enable'}
                                            </button>
                                        </div>
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
                                ← Previous
                            </button>
                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
