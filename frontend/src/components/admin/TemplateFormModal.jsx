import { useState, useEffect } from 'react';
import '../../pages/admin/Admin.css';

const TemplateFormModal = ({ template, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        basePrompt: '',
        creditCost: 1,
        category: 'Business',
        collectionId: '',
        collectionTitle: '',
        collectionIcon: '✨',
        collectionColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        popular: false
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const categories = ['Business', 'Artistic', 'Lifestyle', 'Events', 'Creative', 'Professional'];

    const colorPresets = [
        { name: 'Violet', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'Blue', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
        { name: 'Green', value: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
        { name: 'Orange', value: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
        { name: 'Pink', value: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
        { name: 'Teal', value: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)' }
    ];

    const iconOptions = ['✨', '🎨', '💼', '🌟', '🔮', '🎭', '📸', '💫', '🌈', '🎪', '🏆', '💎'];

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name || '',
                basePrompt: template.basePrompt || '',
                creditCost: template.creditCost || 1,
                category: template.category || 'Business',
                collectionId: template.collectionId || '',
                collectionTitle: template.collectionTitle || '',
                collectionIcon: template.collectionIcon || '✨',
                collectionColor: template.collectionColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                popular: template.popular || false
            });
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
        if (!formData.category) newErrors.category = 'Category is required';
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
        submitData.append('category', formData.category);
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
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>{template ? '✏️ Edit Template' : '➕ Add New Template'}</h2>
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
                                <label>Category *</label>
                                <select name="category" value={formData.category} onChange={handleChange}>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
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

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label>Collection Icon</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, collectionIcon: icon }))}
                                            style={{
                                                padding: '8px 12px',
                                                fontSize: '1.25rem',
                                                border: formData.collectionIcon === icon ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                background: formData.collectionIcon === icon ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Collection Color</label>
                                <select
                                    name="collectionColor"
                                    value={formData.collectionColor}
                                    onChange={handleChange}
                                >
                                    {colorPresets.map(color => (
                                        <option key={color.name} value={color.value}>{color.name}</option>
                                    ))}
                                </select>
                                <div
                                    style={{
                                        marginTop: '8px',
                                        height: '20px',
                                        borderRadius: '4px',
                                        background: formData.collectionColor
                                    }}
                                />
                            </div>
                        </div>

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
                                        <span className="upload-icon">📷</span>
                                        <span>Click to upload thumbnail</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            PNG, JPG up to 5MB
                                        </span>
                                    </>
                                )}
                            </label>
                            {errors.thumbnail && <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errors.thumbnail}</span>}
                        </div>

                        <div className="admin-form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="popular"
                                        checked={formData.popular}
                                        onChange={handleChange}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                                Mark as Popular
                            </label>
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
