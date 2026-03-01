import { useState, useEffect } from 'react';
import { collectionAPI } from '../../services/api';
import {
    Layers, Search, CheckCircle, AlertTriangle,
    Pencil, Trash2, FolderPlus
} from 'lucide-react';
import IconRenderer from '../../components/IconRenderer';
import CollectionFormModal from '../../components/admin/CollectionFormModal';
import './Admin.css';

const AdminCollections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);

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

    const handleAddNew = () => {
        setEditingCollection(null);
        setShowModal(true);
    };

    const handleEdit = (collection) => {
        setEditingCollection(collection);
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

    const handleModalClose = () => {
        setShowModal(false);
        setEditingCollection(null);
    };

    const handleModalSubmit = async (modalData, isEdit) => {
        try {
            const apiData = {
                collectionId: modalData.collectionId,
                title: modalData.collectionTitle,
                icon: modalData.collectionIcon,
                color: modalData.collectionColor,
                description: modalData.description || ''
            };

            if (isEdit && editingCollection) {
                if (editingCollection._id) {
                    // Explicit collection — update existing record
                    const response = await collectionAPI.update(editingCollection._id, apiData);
                    setCollections(collections.map(c =>
                        c._id === editingCollection._id ? { ...c, ...response.data, templateCount: c.templateCount } : c
                    ));
                } else {
                    // Implicit collection (from templates only) — create a new Collection record
                    await collectionAPI.create(apiData);
                    fetchCollections();
                }
                showAlertMsg('success', 'Collection updated successfully');
            } else {
                await collectionAPI.create(apiData);
                showAlertMsg('success', 'Collection created successfully');
                fetchCollections();
            }
            handleModalClose();
        } catch (error) {
            console.error('Error saving collection:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to save collection');
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

            {showModal && (
                <CollectionFormModal
                    collection={editingCollection}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                />
            )}
        </div>
    );
};

export default AdminCollections;
