import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { Users, Search, CheckCircle, AlertTriangle, Crown, User, X, Coins, ChevronLeft, ChevronRight, Edit3, Save } from 'lucide-react';
import LoadingScreen from '../../components/LoadingScreen';
import './Admin.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [editModal, setEditModal] = useState({ show: false, user: null });
    const [editForm, setEditForm] = useState({ name: '', role: 'user', credits: 0 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    // Real-time search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAllUsers(currentPage, 20, searchTerm);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Error fetching users:', error);
            showAlertMsg('error', 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const showAlertMsg = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleToggleStatus = async (userId) => {
        try {
            const response = await userAPI.toggleStatus(userId);
            setUsers(users.map(u => u._id === userId ? response.data.user : u));
            showAlertMsg('success', response.data.message);
        } catch (error) {
            console.error('Error toggling status:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to toggle status');
        }
    };

    const openEditModal = (user) => {
        setEditForm({
            name: user.name || '',
            role: user.role || 'user',
            credits: user.credits || 0
        });
        setEditModal({ show: true, user });
    };

    const closeEditModal = () => {
        setEditModal({ show: false, user: null });
    };

    const handleEditSave = async () => {
        if (!editModal.user) return;
        try {
            setSaving(true);
            const response = await userAPI.updateUser(editModal.user._id, editForm);
            setUsers(users.map(u => u._id === editModal.user._id ? { ...u, ...response.data.user } : u));
            showAlertMsg('success', 'User updated successfully');
            closeEditModal();
        } catch (error) {
            console.error('Error updating user:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && users.length === 0) {
        return <LoadingScreen />;
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1><Users size={28} /> Manage Users</h1>
                <div className="header-actions">
                    <span style={{ color: 'var(--text-muted)' }}>
                        Total: {total} users
                    </span>
                </div>
            </div>

            {alert.show && (
                <div className={`admin-alert ${alert.type}`}>
                    {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />} {alert.message}
                </div>
            )}

            <div className="admin-search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon"><Search size={16} /></span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            style={{
                                position: 'absolute', right: '12px', top: '50%',
                                transform: 'translateY(-50%)', background: 'none',
                                border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', padding: '4px'
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {users.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon"><Users size={32} /></div>
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
                                            {user.role === 'admin' ? <Crown size={14} /> : <User size={14} />} {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Coins size={14} /> {user.credits}
                                        </span>
                                    </td>
                                    <td>
                                        {/* Toggle Switch */}
                                        <div className="toggle-status-wrapper">
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={user.isActive}
                                                    onChange={() => handleToggleStatus(user._id)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                            <span className={`toggle-label ${user.isActive ? 'active' : 'inactive'}`}>
                                                {user.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => openEditModal(user)}
                                            >
                                                <Edit3 size={14} /> Edit
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

            {/* Edit User Modal */}
            {editModal.show && editModal.user && (
                <div className="admin-modal-overlay" onClick={closeEditModal}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2><Edit3 size={20} /> Edit User</h2>
                            <button className="modal-close" onClick={closeEditModal}><X size={20} /></button>
                        </div>

                        <div className="admin-modal-body">
                            {/* User Info Header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '16px', background: 'var(--bg-secondary)',
                                borderRadius: '12px', marginBottom: '20px'
                            }}>
                                {editModal.user.avatar ? (
                                    <img
                                        src={editModal.user.avatar}
                                        alt={editModal.user.name}
                                        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 48, height: 48, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '1.25rem', fontWeight: 600
                                    }}>
                                        {editModal.user.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{editModal.user.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{editModal.user.email}</div>
                                </div>
                            </div>

                            {/* Name */}
                            <div className="admin-form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    placeholder="User's full name"
                                />
                            </div>

                            {/* Role & Credits Row */}
                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="admin-form-group">
                                    <label>Credits</label>
                                    <input
                                        type="number"
                                        value={editForm.credits}
                                        onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Account Status Toggle */}
                            <div className="admin-form-group">
                                <label>Account Status</label>
                                <div className="edit-toggle-row">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={editModal.user.isActive}
                                            onChange={() => handleToggleStatus(editModal.user._id)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                    <span className={`toggle-label ${editModal.user.isActive ? 'active' : 'inactive'}`}>
                                        {editModal.user.isActive ? 'Account Active' : 'Account Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="admin-modal-footer">
                            <button className="btn btn-secondary" onClick={closeEditModal}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleEditSave}
                                disabled={saving}
                            >
                                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
