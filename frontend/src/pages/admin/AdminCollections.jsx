import { useState, useEffect } from 'react';
import { collectionAPI } from '../../services/api';
import {
    Layers, Plus, Search, CheckCircle, AlertTriangle,
    Pencil, Trash2, X, FolderPlus
} from 'lucide-react';
import IconRenderer from '../../components/IconRenderer';
import CollectionFormModal from '../../components/admin/CollectionFormModal';
import './Admin.css';

// Emoji categories for the icon picker
const EMOJI_CATEGORIES = {
    'Popular': ['✨', '🎨', '💼', '🌟', '🔮', '🎭', '📸', '💫', '🌈', '🎪', '🏆', '💎'],
    'Nature': ['🌸', '🌊', '🌴', '🌺', '🍂', '🌙', '☀️', '❄️', '🔥', '🌿', '🦋', '🌻'],
    'Objects': ['📷', '🎵', '🎮', '💄', '👗', '🏠', '✈️', '🚀', '💡', '📚', '🎯', '🎁'],
    'Food': ['🍕', '🍰', '🍜', '☕', '🍎', '🍷', '🎂', '🍿', '🥑', '🍔', '🍣', '🧁'],
    'Faces': ['😊', '😎', '🤩', '😍', '🥳', '😇', '🤗', '😏', '🧐', '🤠', '👻', '🎃']
};

const COLOR_PRESETS = [
    '#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#10B981',
    '#F59E0B', '#F97316', '#EF4444', '#EC4899', '#8B5CF6',
    '#6c63ff', '#f72585', '#4cc9f0', '#7209b7', '#2ec4b6'
];

const AdminCollections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [formData, setFormData] = useState({
        collectionId: '',
        title: '',
        icon: '✨',
        color: '#8B5CF6',
        description: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await collectionAPI.getAll();
            setCollections(response.data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
            showAlertMsg('error', 'Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    const showAlertMsg = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
    };

    const toSlug = (text) => {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleAddNew = () => {
        setShowCreateModal(true);
    };

    const handleEdit = (collection) => {
        setEditingCollection(collection);
        setFormData({
            collectionId: collection.collectionId || collection.id,
            title: collection.title,
            icon: collection.icon || '✨',
            color: collection.color || '#8B5CF6',
            description: collection.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (collection) => {
        const id = collection._id;
        if (!id) {
            showAlertMsg('error', 'Cannot delete: collection has no database ID');
            return;
        }
        if (!window.confirm(`Delete "${collection.title}"? This cannot be undone.`)) return;

        try {
            await collectionAPI.delete(id);
            setCollections(collections.filter(c => c._id !== id));
            showAlertMsg('success', 'Collection deleted successfully');
        } catch (error) {
            console.error('Error deleting:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to delete collection');
        }
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };
            // Auto-generate slug from title if creating new
            if (field === 'title' && !editingCollection) {
                updated.collectionId = toSlug(value);
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            showAlertMsg('error', 'Title is required');
            return;
        }
        if (!formData.collectionId.trim()) {
            showAlertMsg('error', 'Collection ID is required');
            return;
        }

        setSaving(true);
        try {
            if (editingCollection) {
                const response = await collectionAPI.update(editingCollection._id, formData);
                setCollections(collections.map(c =>
                    c._id === editingCollection._id ? { ...c, ...response.data, templateCount: c.templateCount } : c
                ));
                showAlertMsg('success', 'Collection updated successfully');
            } else {
                await collectionAPI.create(formData);
                showAlertMsg('success', 'Collection created successfully');
                fetchCollections(); // Refresh to get the full merged data
            }
            setShowModal(false);
            setEditingCollection(null);
        } catch (error) {
            console.error('Error saving:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to save collection');
        } finally {
            setSaving(false);
        }
    };

    const handleCollectionFormSubmit = async (modalData) => {
        try {
            const apiData = {
                collectionId: modalData.collectionId,
                title: modalData.collectionTitle,
                icon: modalData.collectionIcon,
                color: modalData.collectionColor,
                description: modalData.description || ''
            };
            await collectionAPI.create(apiData);
            showAlertMsg('success', 'Collection created successfully');
            fetchCollections();
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating collection:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to create collection');
        }
    };

    const filteredCollections = collections.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1><Layers size={28} /> Manage Collections</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <FolderPlus size={16} /> Create Collection
                    </button>
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
                        placeholder="Search collections..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''}
                </span>
            </div>

            {filteredCollections.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon"><Layers size={32} /></div>
                    <h3>No collections found</h3>
                    <p>Create your first collection to organize templates</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Collection</th>
                                <th>ID</th>
                                <th>Templates</th>
                                <th>Color</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCollections.map(collection => (
                                <tr key={collection._id || collection.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: 10,
                                                background: `${collection.color}20`,
                                                border: `1px solid ${collection.color}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.2rem'
                                            }}>
                                                <IconRenderer value={collection.icon} size={20} />
                                            </div>
                                            <div>
                                                <strong>{collection.title}</strong>
                                                {collection.description && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {collection.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                                            {collection.collectionId || collection.id}
                                        </code>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${collection.templateCount > 0 ? 'active' : ''}`}>
                                            {collection.templateCount} template{collection.templateCount !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: 20, height: 20, borderRadius: 4,
                                                background: collection.color, border: '1px solid rgba(0,0,0,0.1)'
                                            }} />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{collection.color}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="action-btn edit" onClick={() => handleEdit(collection)}>
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(collection)}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><FolderPlus size={22} /> {editingCollection ? 'Edit Collection' : 'New Collection'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {/* Title */}
                                <div className="form-group">
                                    <label>Collection Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleFormChange('title', e.target.value)}
                                        placeholder="e.g. Professional Portraits"
                                        required
                                    />
                                </div>

                                {/* Collection ID */}
                                <div className="form-group">
                                    <label>Collection ID {editingCollection && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(read-only)</span>}</label>
                                    <input
                                        type="text"
                                        value={formData.collectionId}
                                        onChange={(e) => handleFormChange('collectionId', e.target.value)}
                                        placeholder="e.g. professional-portraits"
                                        disabled={!!editingCollection}
                                        required
                                        style={editingCollection ? { opacity: 0.6 } : {}}
                                    />
                                </div>

                                {/* Description */}
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleFormChange('description', e.target.value)}
                                        placeholder="Brief description of this collection..."
                                        rows={2}
                                    />
                                </div>

                                {/* Icon Picker */}
                                <div className="form-group">
                                    <label>Icon</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12,
                                            background: `${formData.color}20`,
                                            border: `2px solid ${formData.color}40`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem'
                                        }}>
                                            <IconRenderer value={formData.icon} size={24} />
                                        </div>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Selected: {formData.icon}</span>
                                    </div>
                                    <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem' }}>
                                        {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
                                            <div key={category} style={{ marginBottom: '0.5rem' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: 1 }}>{category}</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {emojis.map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => handleFormChange('icon', emoji)}
                                                            style={{
                                                                width: 32, height: 32, border: formData.icon === emoji ? `2px solid ${formData.color}` : '1px solid var(--border)',
                                                                borderRadius: 6, background: formData.icon === emoji ? `${formData.color}15` : 'white',
                                                                cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Picker */}
                                <div className="form-group">
                                    <label>Color</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '0.5rem' }}>
                                        {COLOR_PRESETS.map((color, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleFormChange('color', color)}
                                                style={{
                                                    width: 32, height: 32, borderRadius: 8, background: color,
                                                    border: formData.color === color ? '3px solid var(--text-primary)' : '2px solid transparent',
                                                    cursor: 'pointer', transition: 'transform 0.15s',
                                                    transform: formData.color === color ? 'scale(1.15)' : 'scale(1)'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => handleFormChange('color', e.target.value)}
                                            style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => handleFormChange('color', e.target.value)}
                                            style={{ width: 100, fontSize: '0.85rem' }}
                                            placeholder="#8B5CF6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editingCollection ? 'Update Collection' : 'Create Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <CollectionFormModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCollectionFormSubmit}
                />
            )}
        </div>
    );
};

export default AdminCollections;
