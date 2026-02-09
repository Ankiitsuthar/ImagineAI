import { useState, useEffect } from 'react';
import { templateAPI } from '../../services/api';
import TemplateFormModal from '../../components/admin/TemplateFormModal';
import CollectionFormModal from '../../components/admin/CollectionFormModal';
import './Admin.css';

const AdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchTemplates();
        fetchCollections();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await templateAPI.getAll();
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            showAlert('error', 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await templateAPI.getCollections();
            const apiCollections = response.data || [];

            // Also load pending collections from localStorage
            const pendingCollections = JSON.parse(localStorage.getItem('pendingCollections') || '[]');
            const formattedPending = pendingCollections.map(pc => ({
                id: pc.collectionId,
                title: pc.collectionTitle,
                icon: pc.collectionIcon,
                color: pc.collectionColor,
                templateCount: 0,
                isPending: true
            }));

            // Merge: API collections take priority
            const existingIds = apiCollections.map(c => c.id);
            const newPending = formattedPending.filter(pc => !existingIds.includes(pc.id));

            setCollections([...apiCollections, ...newPending]);
        } catch (error) {
            console.error('Error fetching collections:', error);
            // Still try to load pending collections
            const pendingCollections = JSON.parse(localStorage.getItem('pendingCollections') || '[]');
            const formattedPending = pendingCollections.map(pc => ({
                id: pc.collectionId,
                title: pc.collectionTitle,
                icon: pc.collectionIcon,
                color: pc.collectionColor,
                templateCount: 0,
                isPending: true
            }));
            setCollections(formattedPending);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleAddNew = () => {
        setEditingTemplate(null);
        setShowModal(true);
    };

    const handleAddCollection = () => {
        setShowCollectionModal(true);
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            return;
        }

        try {
            await templateAPI.delete(id);
            setTemplates(templates.filter(t => t._id !== id));
            showAlert('success', 'Template deleted successfully');
            // Refresh collections in case the deleted template was the last one in a collection
            fetchCollections();
        } catch (error) {
            console.error('Error deleting template:', error);
            showAlert('error', 'Failed to delete template');
        }
    };

    const handleFormSubmit = async (formData, isEdit) => {
        try {
            let createdTemplate;
            if (isEdit) {
                const response = await templateAPI.update(editingTemplate._id, formData);
                setTemplates(templates.map(t => t._id === editingTemplate._id ? response.data : t));
                showAlert('success', 'Template updated successfully');
                createdTemplate = response.data;
            } else {
                const response = await templateAPI.create(formData);
                setTemplates([...templates, response.data]);
                showAlert('success', 'Template created successfully');
                createdTemplate = response.data;
            }
            setShowModal(false);
            setEditingTemplate(null);

            // Clean up pending collection from localStorage if it was used
            if (createdTemplate?.collectionId) {
                const pendingCollections = JSON.parse(localStorage.getItem('pendingCollections') || '[]');
                const updatedPending = pendingCollections.filter(
                    pc => pc.collectionId !== createdTemplate.collectionId
                );
                localStorage.setItem('pendingCollections', JSON.stringify(updatedPending));
            }

            // Refresh collections - the new one now exists in DB
            fetchCollections();
        } catch (error) {
            console.error('Error saving template:', error);
            showAlert('error', error.response?.data?.message || 'Failed to save template');
        }
    };

    const handleCollectionSubmit = async (collectionData) => {
        // Store collection data in localStorage for use when creating templates
        const savedCollections = JSON.parse(localStorage.getItem('pendingCollections') || '[]');

        // Check if collection with same ID already exists
        const existingIndex = savedCollections.findIndex(c => c.collectionId === collectionData.collectionId);
        if (existingIndex >= 0) {
            savedCollections[existingIndex] = collectionData; // Update existing
        } else {
            savedCollections.push(collectionData); // Add new
        }

        localStorage.setItem('pendingCollections', JSON.stringify(savedCollections));

        // Refresh collections to show the new pending collection
        await fetchCollections();

        showAlert('success', `Collection "${collectionData.collectionTitle}" created! Now add a template to this collection.`);
        setShowCollectionModal(false);
    };

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.basePrompt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollection = !collectionFilter || template.collectionId === collectionFilter;
        return matchesSearch && matchesCollection;
    });

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
                <h1>🎨 Manage Templates</h1>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleAddCollection}>
                        📁 Create Collection
                    </button>
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        + Add Template
                    </button>
                </div>
            </div>

            {alert.show && (
                <div className={`admin-alert ${alert.type}`}>
                    {alert.type === 'success' ? '✓' : '⚠'} {alert.message}
                </div>
            )}

            <div className="admin-search-bar">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)}>
                    <option value="">All Collections</option>
                    {collections.map(col => (
                        <option key={col.id} value={col.id}>
                            {col.icon} {col.title}
                        </option>
                    ))}
                </select>
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon">🎨</div>
                    <h3>No templates found</h3>
                    <p>Create your first template to get started</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Template</th>
                                <th>Collection</th>
                                <th>Credits</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTemplates.map(template => (
                                <tr key={template._id}>
                                    <td>
                                        <div className="table-template-cell">
                                            <img
                                                src={template.thumbnailUrl
                                                    ? (template.thumbnailUrl.startsWith('http')
                                                        ? template.thumbnailUrl
                                                        : `${API_URL}${template.thumbnailUrl}`)
                                                    : 'https://via.placeholder.com/60x60/f0f0f0/888?text=No+Image'}
                                                alt={template.name}
                                                className="template-thumbnail"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/60x60/f0f0f0/888?text=No+Image';
                                                }}
                                            />
                                            <div>
                                                <strong>{template.name}</strong>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {template.basePrompt}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {template.collectionIcon} {template.collectionTitle}
                                        </span>
                                    </td>
                                    <td>
                                        {template.creditCost === 0 ? (
                                            <span className="status-badge free">Free</span>
                                        ) : (
                                            <span>{template.creditCost} credits</span>
                                        )}
                                    </td>
                                    <td>
                                        {template.popular && (
                                            <span className="status-badge popular">🔥 Popular</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(template)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(template._id)}
                                            >
                                                🗑️ Delete
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
                <TemplateFormModal
                    template={editingTemplate}
                    onClose={() => {
                        setShowModal(false);
                        setEditingTemplate(null);
                    }}
                    onSubmit={handleFormSubmit}
                />
            )}

            {showCollectionModal && (
                <CollectionFormModal
                    onClose={() => setShowCollectionModal(false)}
                    onSubmit={handleCollectionSubmit}
                />
            )}
        </div>
    );
};

export default AdminTemplates;
