import { useState, useEffect, useRef } from 'react';
import { templateAPI } from '../../services/api';
import { Palette, Search, CheckCircle, AlertTriangle, Flame, Pencil, Trash2, Plus, ChevronDown, FolderOpen } from 'lucide-react';
import TemplateFormModal from '../../components/admin/TemplateFormModal';
import IconRenderer from '../../components/IconRenderer';
import LoadingScreen from '../../components/LoadingScreen';
import './Admin.css';

const AdminTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [collectionFilter, setCollectionFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchTemplates();
        fetchCollections();
    }, []);

    // Close filter dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
                setFilterDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await templateAPI.getAll();
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            showAlertMsg('error', 'Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await templateAPI.getCollections();
            setCollections(response.data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setCollections([]);
        }
    };

    const showAlertMsg = (type, message) => {
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
            showAlertMsg('success', 'Template deleted successfully');
            // Refresh collections in case the deleted template was the last one in a collection
            fetchCollections();
        } catch (error) {
            console.error('Error deleting template:', error);
            showAlertMsg('error', 'Failed to delete template');
        }
    };

    const handleFormSubmit = async (formData, isEdit) => {
        try {
            let createdTemplate;
            if (isEdit) {
                const response = await templateAPI.update(editingTemplate._id, formData);
                setTemplates(templates.map(t => t._id === editingTemplate._id ? response.data : t));
                showAlertMsg('success', 'Template updated successfully');
                createdTemplate = response.data;
            } else {
                const response = await templateAPI.create(formData);
                setTemplates([...templates, response.data]);
                showAlertMsg('success', 'Template created successfully');
                createdTemplate = response.data;
            }
            setShowModal(false);
            setEditingTemplate(null);
            fetchCollections();
        } catch (error) {
            console.error('Error saving template:', error);
            showAlertMsg('error', error.response?.data?.message || 'Failed to save template');
        }
    };



    // Filter templates
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.basePrompt.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollection = !collectionFilter || template.collectionId === collectionFilter;
        return matchesSearch && matchesCollection;
    });

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="admin-page container">
            <div className="admin-page-header">
                <h1><Palette size={28} /> Manage Templates</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={handleAddNew}>
                        <Plus size={16} /> Add Template
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
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="collection-filter-dropdown" ref={filterDropdownRef}>
                    <button
                        className="collection-filter-toggle"
                        onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    >
                        {collectionFilter ? (
                            <span className="filter-selected">
                                <IconRenderer value={collections.find(c => c.id === collectionFilter)?.icon} size={16} />
                                {collections.find(c => c.id === collectionFilter)?.title}
                            </span>
                        ) : (
                            <span className="filter-selected">
                                <FolderOpen size={16} />
                                All Collections
                            </span>
                        )}
                        <ChevronDown size={16} className={`filter-chevron ${filterDropdownOpen ? 'open' : ''}`} />
                    </button>
                    {filterDropdownOpen && (
                        <div className="collection-filter-menu">
                            <div
                                className={`collection-filter-option ${!collectionFilter ? 'active' : ''}`}
                                onClick={() => { setCollectionFilter(''); setFilterDropdownOpen(false); }}
                            >
                                <FolderOpen size={16} />
                                <span>All Collections</span>
                            </div>
                            {collections.map(col => (
                                <div
                                    key={col.id}
                                    className={`collection-filter-option ${collectionFilter === col.id ? 'active' : ''}`}
                                    onClick={() => { setCollectionFilter(col.id); setFilterDropdownOpen(false); }}
                                >
                                    <IconRenderer value={col.icon} size={16} />
                                    <span>{col.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {filteredTemplates.length === 0 ? (
                <div className="admin-empty-state card-glass">
                    <div className="empty-icon"><Palette size={32} /></div>
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
                                            <IconRenderer value={template.collectionIcon} size={18} /> {template.collectionTitle}
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
                                            <span className="status-badge popular"><Flame size={14} /></span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(template)}
                                            >
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(template._id)}
                                            >
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
