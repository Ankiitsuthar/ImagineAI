import { useState } from 'react';
import '../../pages/admin/Admin.css';

const CollectionFormModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        collectionId: '',
        collectionTitle: '',
        collectionIcon: '✨',
        collectionColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
        { name: 'Emerald', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
        { name: 'Cyan', value: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
        { name: 'Indigo', value: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
    ];

    // Extended icon library organized by category
    const iconLibrary = {
        'Popular': ['✨', '🎨', '💼', '🌟', '🔮', '🎭', '📸', '💫', '🌈', '🎪', '🏆', '💎'],
        'Business': ['💼', '📊', '👔', '🏢', '📈', '💰', '🎯', '📋', '💳', '🤝', '📁', '✅'],
        'Creative': ['✨', '🎨', '🌈', '🎭', '🎪', '💫', '🔮', '🌟', '🎬', '🖌️', '🎤', '🎵'],
        'Photography': ['📷', '🖼️', '🎬', '📹', '🎞️', '🌅', '🌄', '🏞️', '🎥', '📽️', '🔍'],
        'Lifestyle': ['🌅', '🏠', '🌿', '☕', '🍃', '🌸', '🍷', '🧘', '🛋️', '🌻', '🕯️', '📚'],
        'Events': ['💍', '🎂', '🎉', '🎊', '🎁', '🥂', '💒', '👰', '🤵', '🎈', '🪅', '🎆'],
        'Food': ['🍕', '🍔', '🍰', '🍱', '🥗', '🍜', '☕', '🍷', '🧁', '🍳', '🥘', '🍣'],
        'Nature': ['🌲', '🌊', '🏔️', '🌺', '🦋', '🌙', '⭐', '🌸', '🍁', '🌴', '🌵', '🦜'],
        'Tech': ['💻', '📱', '🔧', '⚙️', '🚀', '💡', '🤖', '🎮', '🔌', '📡', '🛸', '⌨️'],
        'Sports': ['⚽', '🏀', '🎾', '🏈', '⚾', '🏐', '🎳', '🏋️', '🚴', '🏊', '🎿', '🏆'],
        'Travel': ['✈️', '🚗', '🏖️', '🗺️', '🧳', '🏕️', '🎡', '🗼', '🏰', '⛵', '🚂', '🌍']
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.collectionId.trim()) newErrors.collectionId = 'Collection ID is required';
        if (!formData.collectionTitle.trim()) newErrors.collectionTitle = 'Collection title is required';

        // Validate collection ID format (lowercase, no spaces)
        if (formData.collectionId && !/^[a-z0-9-_]+$/.test(formData.collectionId)) {
            newErrors.collectionId = 'ID must be lowercase letters, numbers, hyphens, or underscores only';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-modal-large" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2>📁 Create New Collection</h2>
                    <button className="admin-modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="collection-preview-large">
                            <div className="collection-preview-card-large" style={{ background: formData.collectionColor }}>
                                <span className="collection-preview-icon-large">{formData.collectionIcon}</span>
                                <h3>{formData.collectionTitle || 'Collection Title'}</h3>
                                <span className="collection-preview-id">{formData.collectionId || 'collection-id'}</span>
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
                                    placeholder="e.g., professional-photos"
                                />
                                <span className="form-hint">Lowercase, no spaces. Used as URL identifier.</span>
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
                            <label>Choose Icon *</label>
                            <div className="icon-library">
                                {Object.entries(iconLibrary).map(([category, icons]) => (
                                    <div key={category} className="icon-category">
                                        <span className="icon-category-label">{category}</span>
                                        <div className="icon-grid">
                                            {icons.map((icon, index) => (
                                                <button
                                                    key={`${category}-${index}`}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, collectionIcon: icon }))}
                                                    className={`icon-btn ${formData.collectionIcon === icon ? 'selected' : ''}`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label>Choose Color Theme *</label>
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
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Collection'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectionFormModal;
