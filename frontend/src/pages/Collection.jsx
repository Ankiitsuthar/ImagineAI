import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templateAPI } from '../services/api';
import { ArrowLeft, ArrowRight, Search, Flame, X, Layers, Star, Sparkles } from 'lucide-react';
import IconRenderer from '../components/IconRenderer';
import './Collection.css';

const Collection = () => {
    const { user, openModal } = useAuth();
    const navigate = useNavigate();
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collections, setCollections] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await templateAPI.getCollections();
            setCollections(response.data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setCollections([
                { id: 'professional', title: 'Professional', icon: '💼', color: '#6c63ff', templateCount: 0 },
                { id: 'creative', title: 'Creative', icon: '🎨', color: '#f72585', templateCount: 0 },
                { id: 'seasonal', title: 'Seasonal', icon: '🌸', color: '#4cc9f0', templateCount: 0 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollectionTemplates = async (collectionId) => {
        try {
            setLoading(true);
            const response = await templateAPI.getByCollection(collectionId);
            setTemplates(response.data || []);
        } catch (error) {
            console.error('Error fetching collection templates:', error);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionClick = async (collection) => {
        setSelectedCollection(collection);
        await fetchCollectionTemplates(collection.id);
    };

    const handleBackToCollections = () => {
        setSelectedCollection(null);
        setTemplates([]);
        setSearchTerm('');
    };

    const handleTemplateClick = (template) => {
        if (!user) {
            openModal('login');
            return;
        }
        navigate('/generate', { state: { template } });
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const filteredCollections = collections.filter(col =>
        col.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && !selectedCollection) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="collection-page">
            {!selectedCollection ? (
                <>
                    {/* Hero Section */}
                    <section className="collection-hero">
                        <div className="container">
                            <div className="collection-hero-badge">
                                <Layers size={14} /> Curated Collections
                            </div>
                            <h1>Discover <span className="highlight">Template Collections</span></h1>
                            <p>Browse curated collections of AI-powered templates designed to bring your creative vision to life</p>

                            {/* Search */}
                            <div className="collection-search">
                                <div className="collection-search-box">
                                    <Search size={18} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search collections..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button className="search-clear" onClick={() => setSearchTerm('')}>
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                {searchTerm && (
                                    <span className="search-count">
                                        {filteredCollections.length} result{filteredCollections.length !== 1 ? 's' : ''} found
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Collections Grid */}
                    <section className="collection-grid-section">
                        <div className="container">
                            {filteredCollections.length === 0 ? (
                                <div className="collection-empty">
                                    <Search size={40} />
                                    <h3>No collections found</h3>
                                    <p>Try a different search term</p>
                                </div>
                            ) : (
                                <div className="collections-grid">
                                    {filteredCollections.map((collection, index) => (
                                        <div
                                            key={collection.id}
                                            className="collection-card"
                                            onClick={() => handleCollectionClick(collection)}
                                            style={{
                                                '--collection-color': collection.color,
                                                animationDelay: `${index * 0.06}s`
                                            }}
                                        >
                                            <div className="collection-card-gradient" style={{
                                                background: `linear-gradient(135deg, ${collection.color}22 0%, ${collection.color}08 100%)`
                                            }} />
                                            <div className="collection-card-content">
                                                <div className="collection-card-icon" style={{
                                                    background: `linear-gradient(135deg, ${collection.color}25 0%, ${collection.color}10 100%)`,
                                                    border: `1px solid ${collection.color}20`
                                                }}>
                                                    <IconRenderer value={collection.icon} size={28} />
                                                </div>
                                                <div className="collection-card-info">
                                                    <h3>{collection.title}</h3>
                                                    <span className="collection-card-count">
                                                        {collection.templateCount} template{collection.templateCount !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="collection-card-arrow">
                                                    <ArrowRight size={18} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            ) : (
                <>
                    {/* Detail Hero */}
                    <section className="detail-hero">
                        <div className="container">
                            <button className="back-btn" onClick={handleBackToCollections}>
                                <ArrowLeft size={18} />
                                Back to Collections
                            </button>
                            <div className="detail-hero-content">
                                <div className="detail-hero-icon" style={{
                                    background: `linear-gradient(135deg, ${selectedCollection.color}30 0%, ${selectedCollection.color}10 100%)`,
                                    border: `2px solid ${selectedCollection.color}25`
                                }}>
                                    <IconRenderer value={selectedCollection.icon} size={36} />
                                </div>
                                <div className="detail-hero-text">
                                    <h1>{selectedCollection.title}</h1>
                                    <p>{templates.length} template{templates.length !== 1 ? 's' : ''} available</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Templates Grid */}
                    <section className="detail-templates">
                        <div className="container">
                            {loading ? (
                                <div className="flex-center" style={{ padding: '4rem' }}>
                                    <div className="spinner"></div>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="collection-empty">
                                    <Sparkles size={40} />
                                    <h3>No templates yet</h3>
                                    <p>Templates will be added to this collection soon!</p>
                                </div>
                            ) : (
                                <div className="detail-grid">
                                    {templates.map((template, index) => (
                                        <div
                                            key={template._id}
                                            className="detail-card"
                                            onClick={() => handleTemplateClick(template)}
                                            style={{ animationDelay: `${index * 0.06}s` }}
                                        >
                                            <div className="detail-card-image">
                                                <img
                                                    src={template.thumbnailUrl
                                                        ? (template.thumbnailUrl.startsWith('http')
                                                            ? template.thumbnailUrl
                                                            : `${API_URL}${template.thumbnailUrl}`)
                                                        : 'https://via.placeholder.com/400x300/f0f0f0/888?text=Template'}
                                                    alt={template.name}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x300/f0f0f0/888?text=Template';
                                                    }}
                                                />
                                                <div className="detail-card-overlay">
                                                    <span className="detail-card-cta">
                                                        <Sparkles size={14} /> Use Template
                                                    </span>
                                                </div>
                                                {template.popular && (
                                                    <span className="detail-card-badge popular">
                                                        <Flame size={12} /> Popular
                                                    </span>
                                                )}
                                                {template.creditCost === 0 && !template.popular && (
                                                    <span className="detail-card-badge free">
                                                        <Star size={12} /> Free
                                                    </span>
                                                )}
                                            </div>
                                            <div className="detail-card-body">
                                                <h4>{template.name}</h4>
                                                <p className="detail-card-prompt">{template.basePrompt}</p>
                                                <div className="detail-card-footer">
                                                    <span className={`detail-card-cost ${template.creditCost === 0 ? 'free' : ''}`}>
                                                        {template.creditCost === 0 ? 'Free' : `${template.creditCost} credit${template.creditCost !== 1 ? 's' : ''}`}
                                                    </span>
                                                    <ArrowRight size={16} className="detail-card-arrow" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default Collection;
