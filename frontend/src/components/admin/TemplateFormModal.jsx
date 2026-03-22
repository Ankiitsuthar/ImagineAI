import { useState, useEffect, useRef } from 'react';
import { templateAPI } from '../../services/api';
import { Pencil, Plus, Camera, Flame, ChevronDown } from 'lucide-react';
import IconRenderer from '../IconRenderer';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import '../../pages/admin/Admin.css';

const TemplateFormModal = ({ template, onClose, onSubmit }) => {
    useBodyScrollLock(true);
    const [formData, setFormData] = useState({
        name: '',
        basePrompt: '',
        creditCost: 1,
        collectionId: '',
        collectionTitle: '',
        collectionIcon: 'lucide:Sparkles',
        collectionColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        popular: false
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('');
    const [isNewCollection, setIsNewCollection] = useState(false);
    const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setCollectionDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const colorPresets = [
        { name: 'Violet', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'Blue', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
        { name: 'Green', value: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
        { name: 'Orange', value: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
        { name: 'Pink', value: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
        { name: 'Teal', value: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' },
        { name: 'Purple', value: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' },
        { name: 'Rose', value: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' },
        { name: 'Amber', value: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        { name: 'Emerald', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
    ];

    // Extended icon library organized by category (Lucide icon names)
    const iconLibrary = {
        'Popular': ['Sparkles', 'Star', 'Heart', 'Zap', 'Flame', 'Sun', 'Moon', 'Cloud', 'Rocket', 'Diamond', 'Crown', 'Award'],
        'Creative': ['Palette', 'Brush', 'Pen', 'Pencil', 'Camera', 'Image', 'Film', 'Music', 'Mic', 'Headphones', 'Video', 'Wand2'],
        'Business': ['Briefcase', 'Building2', 'TrendingUp', 'BarChart3', 'PieChart', 'DollarSign', 'CreditCard', 'ShoppingBag', 'Store', 'Megaphone', 'Users', 'FileText'],
        'Nature': ['TreePine', 'Flower2', 'Leaf', 'Mountain', 'Waves', 'Sunrise', 'CloudSun', 'Snowflake', 'Bug', 'Bird', 'Fish', 'Cherry'],
        'Lifestyle': ['Home', 'Coffee', 'UtensilsCrossed', 'Wine', 'Cake', 'Dumbbell', 'Bike', 'Glasses', 'Shirt', 'Watch', 'Gift', 'Target'],
        'Tech': ['Laptop', 'Smartphone', 'Monitor', 'Cpu', 'Wifi', 'Database', 'Code', 'Terminal', 'Gamepad2', 'Bot', 'Satellite', 'HardDrive'],
        'Travel': ['Plane', 'Car', 'Ship', 'MapPin', 'Compass', 'Tent', 'Globe', 'Shield', 'Layers', 'Aperture', 'Lightbulb', 'Scissors']
    };

    // Fetch existing collections on mount
    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await templateAPI.getCollections();
            const apiCollections = response.data || [];

            // Also load pending collections from localStorage
            const pendingCollections = JSON.parse(localStorage.getItem('pendingCollections') || '[]');

            // Convert pending collections to the same format as API collections
            const formattedPending = pendingCollections.map(pc => ({
                id: pc.collectionId,
                title: pc.collectionTitle,
                icon: pc.collectionIcon,
                color: pc.collectionColor,
                templateCount: 0,
                isPending: true // Mark as pending
            }));

            // Merge: API collections take priority, add pending ones that don't exist in API
            const existingIds = apiCollections.map(c => c.id);
            const newPending = formattedPending.filter(pc => !existingIds.includes(pc.id));

            setCollections([...apiCollections, ...newPending]);
        } catch (error) {
            console.error('Error fetching collections:', error);
            // Still try to load pending collections even if API fails
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

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name || '',
                basePrompt: template.basePrompt || '',
                creditCost: template.creditCost || 1,
                collectionId: template.collectionId || '',
                collectionTitle: template.collectionTitle || '',
                collectionIcon: template.collectionIcon || 'lucide:Sparkles',
                collectionColor: template.collectionColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                popular: template.popular || false
            });
            // Set selected collection if editing
            if (template.collectionId) {
                setSelectedCollection(template.collectionId);
            }
            if (template.thumbnailUrl) {
                setThumbnailPreview(template.thumbnailUrl.startsWith('http')
                    ? template.thumbnailUrl
                    : `${API_URL}${template.thumbnailUrl}`);
            }
        }
    }, [template, API_URL]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCollectionSelect = (value) => {
        setSelectedCollection(value);
        setCollectionDropdownOpen(false);

        if (value === '__new__') {
            setIsNewCollection(true);
            setFormData(prev => ({
                ...prev,
                collectionId: '',
                collectionTitle: '',
                collectionIcon: 'lucide:Sparkles',
                collectionColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }));
        } else if (value) {
            setIsNewCollection(false);
            const collection = collections.find(c => c.id === value);
            if (collection) {
                setFormData(prev => ({
                    ...prev,
                    collectionId: collection.id,
                    collectionTitle: collection.title,
                    collectionIcon: collection.icon,
                    collectionColor: collection.color
                }));
            }
        } else {
            setIsNewCollection(false);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.basePrompt.trim()) newErrors.basePrompt = 'Prompt is required';
        if (!formData.collectionId.trim()) newErrors.collectionId = 'Collection ID is required';
        if (!formData.collectionTitle.trim()) newErrors.collectionTitle = 'Collection title is required';
        if (!template && !thumbnailFile) newErrors.thumbnail = 'Thumbnail is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('basePrompt', formData.basePrompt);
        submitData.append('creditCost', formData.creditCost);
        submitData.append('category', 'General'); // Default category for backward compatibility
        submitData.append('collectionId', formData.collectionId);
        submitData.append('collectionTitle', formData.collectionTitle);
        submitData.append('collectionIcon', formData.collectionIcon);
        submitData.append('collectionColor', formData.collectionColor);
        submitData.append('popular', formData.popular);

        if (thumbnailFile) {
            submitData.append('thumbnail', thumbnailFile);
        }

        try {
            await onSubmit(submitData, !!template);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-modal-large" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{template ? <><Pencil size={18} /> Edit Template</> : <><Plus size={18} /> Add New Template</>}</h2>
                    <button className="admin-modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="admin-form-group">
                            <label>Template Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Professional Headshot"
                            />
                            {errors.name && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.name}</span>}
                        </div>

                        <div className="admin-form-group">
                            <label>Base Prompt *</label>
                            <textarea
                                name="basePrompt"
                                value={formData.basePrompt}
                                onChange={handleChange}
                                placeholder="Enter the AI prompt for this template..."
                            />
                            {errors.basePrompt && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.basePrompt}</span>}
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Collection *</label>
                                <div className="custom-collection-dropdown" ref={dropdownRef}>
                                    <div
                                        className="custom-dropdown-trigger"
                                        onClick={() => setCollectionDropdownOpen(!collectionDropdownOpen)}
                                    >
                                        {selectedCollection && selectedCollection !== '__new__' ? (
                                            <span className="custom-dropdown-selected">
                                                <IconRenderer value={formData.collectionIcon} size={18} />
                                                <span>{formData.collectionTitle}</span>
                                            </span>
                                        ) : selectedCollection === '__new__' ? (
                                            <span className="custom-dropdown-selected">
                                                <Plus size={18} />
                                                <span>Create New Collection...</span>
                                            </span>
                                        ) : (
                                            <span className="custom-dropdown-placeholder">Select a collection...</span>
                                        )}
                                        <ChevronDown size={16} className={`dropdown-chevron ${collectionDropdownOpen ? 'open' : ''}`} />
                                    </div>
                                    {collectionDropdownOpen && (
                                        <div className="custom-dropdown-menu">
                                            {collections.map(col => (
                                                <div
                                                    key={col.id}
                                                    className={`custom-dropdown-item ${selectedCollection === col.id ? 'active' : ''}`}
                                                    onClick={() => handleCollectionSelect(col.id)}
                                                >
                                                    <IconRenderer value={col.icon} size={18} />
                                                    <span>{col.title}</span>
                                                </div>
                                            ))}
                                            <div
                                                className="custom-dropdown-item custom-dropdown-create"
                                                onClick={() => handleCollectionSelect('__new__')}
                                            >
                                                <Plus size={18} />
                                                <span>Create New Collection...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Credit Cost</label>
                                <input
                                    type="number"
                                    name="creditCost"
                                    value={formData.creditCost}
                                    onChange={handleChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Show new collection fields when creating new */}
                        {isNewCollection && (
                            <>
                                <div className="admin-form-row">
                                    <div className="admin-form-group">
                                        <label>Collection ID *</label>
                                        <input
                                            type="text"
                                            name="collectionId"
                                            value={formData.collectionId}
                                            onChange={handleChange}
                                            placeholder="e.g., professional"
                                        />
                                        {errors.collectionId && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.collectionId}</span>}
                                    </div>

                                    <div className="admin-form-group">
                                        <label>Collection Title *</label>
                                        <input
                                            type="text"
                                            name="collectionTitle"
                                            value={formData.collectionTitle}
                                            onChange={handleChange}
                                            placeholder="e.g., Professional Photos"
                                        />
                                        {errors.collectionTitle && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.collectionTitle}</span>}
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label>Collection Icon</label>
                                    <div className="icon-library">
                                        {Object.entries(iconLibrary).map(([category, iconNames]) => (
                                            <div key={category} className="icon-category">
                                                <span className="icon-category-label">{category}</span>
                                                <div className="icon-grid">
                                                    {iconNames.map(name => {
                                                        const val = `lucide:${name}`;
                                                        return (
                                                            <button
                                                                key={`${category}-${name}`}
                                                                type="button"
                                                                onClick={() => setFormData(prev => ({ ...prev, collectionIcon: val }))}
                                                                className={`icon-btn icon-btn-lucide ${formData.collectionIcon === val ? 'selected' : ''}`}
                                                                title={name}
                                                            >
                                                                <IconRenderer value={val} size={20} />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="admin-form-group">
                                    <label>Collection Color</label>
                                    <div className="color-presets">
                                        {colorPresets.map(color => (
                                            <button
                                                key={color.name}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, collectionColor: color.value }))}
                                                className={`color-preset-btn ${formData.collectionColor === color.value ? 'selected' : ''}`}
                                                title={color.name}
                                            >
                                                <span className="color-preview" style={{ background: color.value }}></span>
                                                <span className="color-name">{color.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Show collection preview when existing selected */}
                        {selectedCollection && !isNewCollection && (
                            <div className="collection-preview-card">
                                <div className="collection-preview-icon" style={{ background: formData.collectionColor }}>
                                    <IconRenderer value={formData.collectionIcon} size={24} />
                                </div>
                                <div className="collection-preview-info">
                                    <strong>{formData.collectionTitle}</strong>
                                    <span>ID: {formData.collectionId}</span>
                                </div>
                            </div>
                        )}

                        <div className="admin-form-group">
                            <label>Thumbnail Image {!template && '*'}</label>
                            <label className="thumbnail-upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                />
                                {thumbnailPreview ? (
                                    <div className="thumbnail-preview">
                                        <img src={thumbnailPreview} alt="Preview" />
                                        <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            Click to change image
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <span className="upload-icon"><Camera size={24} /></span>
                                        <span>Click to upload thumbnail</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            PNG, JPG up to 5MB
                                        </span>
                                    </>
                                )}
                            </label>
                            {errors.thumbnail && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.thumbnail}</span>}
                        </div>

                        {/* Popular Toggle - Prominent Button Style */}
                        <div className="admin-form-group">
                            <label>Mark as Popular</label>
                            <button
                                type="button"
                                className={`popular-toggle-btn ${formData.popular ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, popular: !prev.popular }))}
                            >
                                <span className="popular-icon"><Flame size={18} /></span>
                                <span>{formData.popular ? 'Popular - Enabled' : 'Click to Mark as Popular'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateFormModal;
