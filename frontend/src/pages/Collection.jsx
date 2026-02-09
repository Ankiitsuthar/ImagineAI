import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templateAPI } from '../services/api';
import './Collection.css';

const Collection = () => {
    const { user, openModal } = useAuth();
    const navigate = useNavigate();
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [collections, setCollections] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch collections on mount
    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const response = await templateAPI.getCollections();
            setCollections(response.data);
        } catch (error) {
            console.error('Error fetching collections:', error);
            // Fallback to static data if API fails
            setCollections([
                { id: 'professional', title: 'Professional', icon: '💼', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', templateCount: 6 },
                { id: 'ghibli', title: 'Ghibli Style', icon: '🎨', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', templateCount: 6 },
                { id: 'creative', title: 'Creative Portrait', icon: '✨', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', templateCount: 6 },
                { id: 'food', title: 'Food Photography', icon: '🍕', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', templateCount: 6 },
                { id: 'lifestyle', title: 'Lifestyle', icon: '🌅', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', templateCount: 6 },
                { id: 'wedding', title: 'Wedding', icon: '💍', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', templateCount: 6 },
                { id: 'minimalist', title: 'Minimalist', icon: '⬜', color: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 100%)', templateCount: 6 },
                { id: 'vintage', title: 'Vintage', icon: '📷', color: 'linear-gradient(135deg, #c9b18a 0%, #8b7355 100%)', templateCount: 6 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplatesByCollection = async (collectionId) => {
        setTemplatesLoading(true);
        try {
            const response = await templateAPI.getByCollection(collectionId);
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setTemplates([]);
        } finally {
            setTemplatesLoading(false);
        }
    };

    // Filter collections based on search term
    const filteredCollections = collections.filter(collection =>
        collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUseTemplate = (e, template) => {
        e.stopPropagation();
        if (!user) {
            openModal('signup');
        } else {
            // Pass the MongoDB _id to the Templates page
            navigate('/templates', { state: { templateId: template._id } });
        }
    };

    const handleCollectionClick = (collectionId) => {
        setSelectedCollection(collectionId);
        fetchTemplatesByCollection(collectionId);
    };

    const handleBackToCollections = () => {
        setSelectedCollection(null);
        setTemplates([]);
        setSearchTerm('');
    };

    const selectedCollectionData = collections.find(c => c.id === selectedCollection);

    if (loading) {
        return (
            <div className="collection-page">
                <div className="flex-center" style={{ minHeight: '60vh' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="collection-page">
            <section className="collection-hero">
                <div className="container">
                    {selectedCollection ? (
                        <>
                            <button className="back-btn" onClick={handleBackToCollections}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Back to Collections
                            </button>
                            <div className="collection-header-detail">
                                <span className="collection-icon-large" style={{ background: selectedCollectionData?.color }}>
                                    {selectedCollectionData?.icon}
                                </span>
                                <h1>{selectedCollectionData?.title}</h1>
                                <p>{selectedCollectionData?.templateCount} templates available</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h1>Our Collections</h1>
                            <p>Explore stunning templates organized by collection</p>
                        </>
                    )}
                </div>
            </section>

            <section className="collection-content">
                <div className="container">
                    {!selectedCollection ? (
                        <>
                            {/* Search Bar */}
                            <div className="collection-search-bar">
                                <div className="search-input-wrapper">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search collections..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="collection-search-input"
                                    />
                                    {searchTerm && (
                                        <button
                                            className="search-clear-btn"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {searchTerm && (
                                    <span className="search-results-count">
                                        {filteredCollections.length} collection{filteredCollections.length !== 1 ? 's' : ''} found
                                    </span>
                                )}
                            </div>

                            {/* Collections Grid */}
                            {filteredCollections.length === 0 ? (
                                <div className="no-results">
                                    <span className="no-results-icon">🔍</span>
                                    <h3>No collections found</h3>
                                    <p>Try a different search term</p>
                                </div>
                            ) : (
                                <div className="collections-grid">
                                    {filteredCollections.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="collection-card fade-in-up"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                            onClick={() => handleCollectionClick(item.id)}
                                        >
                                            <div className="collection-card-bg" style={{ background: item.color }}></div>
                                            <div className="collection-card-content">
                                                <span className="collection-icon">{item.icon}</span>
                                                <h3>{item.title}</h3>
                                                <p>{item.templateCount} templates</p>
                                            </div>
                                            <div className="collection-card-arrow">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Templates Grid */}
                            <div className="templates-section">
                                <div className="templates-header">
                                    <h2>Available Templates</h2>
                                    <span className="template-badge">{templates.length} templates</span>
                                </div>

                                {templatesLoading ? (
                                    <div className="flex-center" style={{ minHeight: '300px' }}>
                                        <div className="spinner"></div>
                                    </div>
                                ) : (
                                    <div className="templates-grid">
                                        {templates.map((template, index) => (
                                            <div
                                                key={template._id}
                                                className="template-card fade-in-up"
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                {template.popular && <span className="popular-badge">🔥 Popular</span>}
                                                <div className="template-image-container">
                                                    <img
                                                        src={template.thumbnailUrl?.startsWith('http') ? template.thumbnailUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${template.thumbnailUrl}`}
                                                        alt={template.name}
                                                        className="template-image"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/300x400/f0f0f0/888?text=Template';
                                                        }}
                                                    />
                                                    <div className="template-overlay">
                                                        <button
                                                            onClick={(e) => handleUseTemplate(e, template)}
                                                            className="btn btn-primary"
                                                        >
                                                            Use Template
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="template-info">
                                                    <h3>{template.name}</h3>
                                                    <span className="credit-cost">{template.creditCost} credit{template.creditCost > 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Collection;
