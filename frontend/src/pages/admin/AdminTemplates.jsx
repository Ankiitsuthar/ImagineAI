import { useState, useEffect } from 'react';
import { templateAPI } from '../../services/api';
import TemplateFormModal from '../../components/admin/TemplateFormModal';
import './Admin.css';

const AdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchTemplates();
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

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    };

    const handleAddNew = () => {
        setEditingTemplate(null);
        setShowModal(true);
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
        } catch (error) {
            console.error('Error deleting template:', error);
            showAlert('error', 'Failed to delete template');
        }
    };

    const handleFormSubmit = async (formData, isEdit) => {
        try {
            if (isEdit) {
                const response = await templateAPI.update(editingTemplate._id, formData);
                setTemplates(templates.map(t => t._id === editingTemplate._id ? response.data : t));
                showAlert('success', 'Template updated successfully');
            } else {
                const response = await templateAPI.create(formData);
                setTemplates([...templates, response.data]);
                showAlert('success', 'Template created successfully');
            }
            setShowModal(false);
            setEditingTemplate(null);
        } catch (error) {
            console.error('Error saving template:', error);
            showAlert('error', error.response?.data?.message || 'Failed to save template');
        }
    };

    // Get unique categories for filter
    const categories = [...new Set(templates.map(t => t.category))].filter(Boolean);

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.basePrompt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || template.category === categoryFilter;
        return matchesSearch && matchesCategory;
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
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
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
                                <th>Category</th>
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
                                                src={template.thumbnailUrl.startsWith('http')
                                                    ? template.thumbnailUrl
                                                    : `${API_URL}${template.thumbnailUrl}`}
                                                alt={template.name}
                                                className="template-thumbnail"
                                                onError={(e) => e.target.src = '/placeholder.png'}
                                            />
                                            <div>
                                                <strong>{template.name}</strong>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {template.basePrompt}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{template.category}</td>
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
                                            <span className="status-badge popular">Popular</span>
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
        </div>
    );
};

export default AdminTemplates;
