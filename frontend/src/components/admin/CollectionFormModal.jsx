import { useState, useRef } from 'react';
import { Smile, Shapes, ImagePlus, Search, Upload, X, FolderPlus } from 'lucide-react';
import IconRenderer from '../IconRenderer';
import '../../pages/admin/Admin.css';

// Curated Lucide icons organized by category
const LUCIDE_ICONS = {
    'General': [
        'Sparkles', 'Star', 'Heart', 'Zap', 'Flame', 'Sun', 'Moon', 'Cloud',
        'Rocket', 'Diamond', 'Crown', 'Award', 'Gift', 'Target', 'Shield', 'Globe'
    ],
    'Creative': [
        'Palette', 'Brush', 'Pen', 'Pencil', 'Camera', 'Image', 'Film', 'Music',
        'Mic', 'Headphones', 'Video', 'Scissors', 'Wand2', 'Layers', 'Aperture', 'Lightbulb'
    ],
    'Business': [
        'Briefcase', 'Building2', 'TrendingUp', 'BarChart3', 'PieChart', 'DollarSign',
        'CreditCard', 'ShoppingBag', 'Store', 'Megaphone', 'Users', 'UserCircle',
        'Handshake', 'FileText', 'ClipboardList', 'CalendarDays'
    ],
    'Nature': [
        'TreePine', 'Flower2', 'Leaf', 'Mountain', 'Waves', 'Sunrise', 'CloudSun',
        'Snowflake', 'Bug', 'Bird', 'Fish', 'Cat', 'Dog', 'Rabbit', 'Squirrel', 'Cherry'
    ],
    'Lifestyle': [
        'Home', 'Coffee', 'UtensilsCrossed', 'Wine', 'Cake', 'Dumbbell', 'Bike',
        'Plane', 'Car', 'Ship', 'MapPin', 'Compass', 'Tent', 'Glasses', 'Shirt', 'Watch'
    ],
    'Tech': [
        'Laptop', 'Smartphone', 'Monitor', 'Cpu', 'Wifi', 'Bluetooth', 'Database',
        'Code', 'Terminal', 'Gamepad2', 'Bot', 'Satellite', 'Radio', 'Tv', 'Printer', 'HardDrive'
    ]
};

const CollectionFormModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        collectionId: '',
        collectionTitle: '',
        collectionIcon: '✨',
        collectionColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [iconTab, setIconTab] = useState('emoji'); // emoji | lucide | upload
    const [iconSearch, setIconSearch] = useState('');
    const fileInputRef = useRef(null);

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

    // Emoji → best matching color name
    const emojiColorMap = {
        // Popular
        '✨': 'Amber', '🎨': 'Purple', '💼': 'Blue', '🌟': 'Amber',
        '🔮': 'Purple', '🎭': 'Rose', '📸': 'Indigo', '💫': 'Violet',
        '🌈': 'Pink', '🎪': 'Rose', '🏆': 'Amber', '💎': 'Cyan',
        // Business
        '📊': 'Blue', '👔': 'Indigo', '🏢': 'Blue', '📈': 'Green',
        '💰': 'Amber', '🎯': 'Rose', '📋': 'Teal', '💳': 'Indigo',
        '🤝': 'Blue', '📁': 'Orange', '✅': 'Emerald',
        // Creative
        '🎬': 'Rose', '🖌️': 'Purple', '🎤': 'Indigo', '🎵': 'Violet',
        // Photography
        '📷': 'Indigo', '🖼️': 'Purple', '📹': 'Rose', '🎞️': 'Violet',
        '🌅': 'Orange', '🌄': 'Amber', '🏞️': 'Green', '🎥': 'Rose',
        '📽️': 'Indigo', '🔍': 'Blue',
        // Lifestyle
        '🏠': 'Teal', '🌿': 'Green', '☕': 'Amber', '🍃': 'Emerald',
        '🌸': 'Pink', '🍷': 'Rose', '🧘': 'Teal', '🛋️': 'Violet',
        '🌻': 'Amber', '🕯️': 'Orange', '📚': 'Indigo',
        // Events
        '💍': 'Purple', '🎂': 'Pink', '🎉': 'Amber', '🎊': 'Pink',
        '🎁': 'Rose', '🥂': 'Amber', '💒': 'Violet', '👰': 'Pink',
        '🤵': 'Indigo', '🎈': 'Rose', '🪅': 'Orange', '🎆': 'Indigo',
        // Food
        '🍕': 'Orange', '🍔': 'Amber', '🍰': 'Pink', '🍱': 'Teal',
        '🥗': 'Green', '🍜': 'Orange', '🧁': 'Pink', '🍳': 'Amber',
        '🥘': 'Orange', '🍣': 'Rose',
        // Nature
        '🌲': 'Emerald', '🌊': 'Cyan', '🏔️': 'Blue', '🌺': 'Pink',
        '🦋': 'Purple', '🌙': 'Indigo', '⭐': 'Amber', '🍁': 'Orange',
        '🌴': 'Green', '🌵': 'Emerald', '🦜': 'Green',
        // Tech
        '💻': 'Blue', '📱': 'Indigo', '🔧': 'Teal', '⚙️': 'Blue',
        '🚀': 'Violet', '💡': 'Amber', '🤖': 'Cyan', '🎮': 'Purple',
        '🔌': 'Teal', '📡': 'Indigo', '🛸': 'Violet', '⌨️': 'Blue',
        // Sports
        '⚽': 'Emerald', '🏀': 'Orange', '🎾': 'Green', '🏈': 'Amber',
        '⚾': 'Rose', '🏐': 'Blue', '🎳': 'Indigo', '🏋️': 'Rose',
        '🚴': 'Green', '🏊': 'Cyan', '🎿': 'Blue',
        // Travel
        '✈️': 'Blue', '🚗': 'Rose', '🏖️': 'Cyan', '🗺️': 'Teal',
        '🧳': 'Amber', '🏕️': 'Emerald', '🎡': 'Pink', '🗼': 'Rose',
        '🏰': 'Violet', '⛵': 'Cyan', '🚂': 'Orange', '🌍': 'Teal'
    };

    // Returns the best matching color gradient for an emoji
    const getColorForEmoji = (emoji) => {
        const colorName = emojiColorMap[emoji];
        if (colorName) {
            const preset = colorPresets.find(c => c.name === colorName);
            if (preset) return preset.value;
        }
        return null; // keep current color if no match
    };

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

    // Filter Lucide icons by search
    const getFilteredLucideIcons = () => {
        if (!iconSearch.trim()) return LUCIDE_ICONS;
        const q = iconSearch.toLowerCase();
        const filtered = {};
        for (const [cat, icons] of Object.entries(LUCIDE_ICONS)) {
            const matches = icons.filter(name => name.toLowerCase().includes(q));
            if (matches.length > 0) filtered[cat] = matches;
        }
        return filtered;
    };

    // Generate a URL-friendly slug from a title
    const toSlug = (text) =>
        text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s]+/g, '-').replace(/-+/g, '-');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-generate ID when title changes
            if (name === 'collectionTitle') {
                updated.collectionId = toSlug(value);
            }
            return updated;
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate
        if (!file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setFormData(prev => ({ ...prev, collectionIcon: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Image must be under 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prev => ({ ...prev, collectionIcon: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.collectionId.trim()) newErrors.collectionId = 'Collection ID is required';
        if (!formData.collectionTitle.trim()) newErrors.collectionTitle = 'Collection title is required';
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

    const isIconSelected = (val) => formData.collectionIcon === val;

    const filteredLucide = getFilteredLucideIcons();

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal admin-modal-large" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h2><FolderPlus size={22} /> Create New Collection</h2>
                    <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        {/* Preview */}
                        <div className="collection-preview-large">
                            <div className="collection-preview-card-large" style={{ background: formData.collectionColor }}>
                                <span className="collection-preview-icon-large">
                                    <IconRenderer value={formData.collectionIcon} size={48} />
                                </span>
                                <h3>{formData.collectionTitle || 'Collection Title'}</h3>
                                <span className="collection-preview-id">{formData.collectionId || 'collection-id'}</span>
                            </div>
                        </div>

                        {/* Title */}
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

                        {/* Icon Picker */}
                        <div className="admin-form-group">
                            <label>Choose Icon *</label>

                            {/* Tab Switcher */}
                            <div className="icon-picker-tabs">
                                <button
                                    type="button"
                                    className={`icon-picker-tab ${iconTab === 'emoji' ? 'active' : ''}`}
                                    onClick={() => { setIconTab('emoji'); setIconSearch(''); }}
                                >
                                    <Smile size={16} /> Emoji
                                </button>
                                <button
                                    type="button"
                                    className={`icon-picker-tab ${iconTab === 'lucide' ? 'active' : ''}`}
                                    onClick={() => { setIconTab('lucide'); setIconSearch(''); }}
                                >
                                    <Shapes size={16} /> Icons
                                </button>
                                <button
                                    type="button"
                                    className={`icon-picker-tab ${iconTab === 'upload' ? 'active' : ''}`}
                                    onClick={() => { setIconTab('upload'); setIconSearch(''); }}
                                >
                                    <ImagePlus size={16} /> Upload
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="icon-picker-content">
                                {/* Emoji Tab */}
                                {iconTab === 'emoji' && (
                                    <div className="icon-library">
                                        {Object.entries(iconLibrary).map(([category, icons]) => (
                                            <div key={category} className="icon-category">
                                                <span className="icon-category-label">{category}</span>
                                                <div className="icon-grid">
                                                    {icons.map((icon, index) => (
                                                        <button
                                                            key={`${category}-${index}`}
                                                            type="button"
                                                            onClick={() => {
                                                                const matchedColor = getColorForEmoji(icon);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    collectionIcon: icon,
                                                                    ...(matchedColor ? { collectionColor: matchedColor } : {})
                                                                }));
                                                            }}
                                                            className={`icon-btn ${isIconSelected(icon) ? 'selected' : ''}`}
                                                        >
                                                            {icon}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Lucide Icons Tab */}
                                {iconTab === 'lucide' && (
                                    <div className="icon-library">
                                        <div className="icon-search-box">
                                            <Search size={16} className="icon-search-icon" />
                                            <input
                                                type="text"
                                                placeholder="Search icons..."
                                                value={iconSearch}
                                                onChange={(e) => setIconSearch(e.target.value)}
                                                className="icon-search-input"
                                            />
                                            {iconSearch && (
                                                <button
                                                    type="button"
                                                    className="icon-search-clear"
                                                    onClick={() => setIconSearch('')}
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        {Object.keys(filteredLucide).length === 0 ? (
                                            <div className="icon-no-results">
                                                No icons match "<strong>{iconSearch}</strong>"
                                            </div>
                                        ) : (
                                            Object.entries(filteredLucide).map(([category, iconNames]) => (
                                                <div key={category} className="icon-category">
                                                    <span className="icon-category-label">{category}</span>
                                                    <div className="icon-grid">
                                                        {iconNames.map(name => {
                                                            const val = `lucide:${name}`;
                                                            return (
                                                                <button
                                                                    key={name}
                                                                    type="button"
                                                                    onClick={() => setFormData(prev => ({ ...prev, collectionIcon: val }))}
                                                                    className={`icon-btn icon-btn-lucide ${isIconSelected(val) ? 'selected' : ''}`}
                                                                    title={name}
                                                                >
                                                                    <IconRenderer value={val} size={20} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Upload Tab */}
                                {iconTab === 'upload' && (
                                    <div className="icon-upload-area">
                                        <div
                                            className="icon-upload-dropzone"
                                            onClick={() => fileInputRef.current?.click()}
                                            onDrop={handleDrop}
                                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                        >
                                            {formData.collectionIcon?.startsWith('data:image/') ? (
                                                <div className="icon-upload-preview">
                                                    <img src={formData.collectionIcon} alt="Uploaded icon" />
                                                    <button
                                                        type="button"
                                                        className="icon-upload-remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFormData(prev => ({ ...prev, collectionIcon: '✨' }));
                                                        }}
                                                    >
                                                        <X size={14} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="icon-upload-placeholder">
                                                    <Upload size={32} />
                                                    <p><strong>Click to upload</strong> or drag & drop</p>
                                                    <span>PNG, JPG, or WebP • Max 2MB</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Color Theme */}
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
            </div >
        </div >
    );
};

export default CollectionFormModal;
