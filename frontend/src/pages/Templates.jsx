import { useState, useEffect } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templateAPI, generationAPI } from '../services/api';
import { Sparkles, Upload, Wand2, Flame, FolderOpen, PartyPopper, ArrowRight, Coins, } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import './Templates.css';

const Templates = () => {
    const { user, updateUserCredits, openModal } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 3-step workflow: 1 = Templates, 2 = Upload, 3 = Generate
    const [step, setStep] = useState(1);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);
    const [fileSizeError, setFileSizeError] = useState(false);
    const [fileTypeError, setFileTypeError] = useState(false);

    // Get pre-selected templateId from Collection page
    const preSelectedTemplateId = location.state?.templateId;

    useEffect(() => {
        fetchTemplates();

        // Re-fetch when tab becomes visible (real-time admin changes)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchTemplates();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Auto-select template if passed from Collection page
    useEffect(() => {
        if (preSelectedTemplateId && templates.length > 0) {
            const template = templates.find(t => t._id === preSelectedTemplateId);
            if (template) {
                handleSelectTemplate(template);
            }
        }
    }, [preSelectedTemplateId, templates]);

    const fetchTemplates = async () => {
        try {
            const response = await templateAPI.getAll();
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTemplate = (template) => {
        if (!user) {
            openModal('signup');
            return;
        }
        setSelectedTemplate(template);
        setStep(2);
    };

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setFileTypeError(true);
                e.target.value = '';
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setFileSizeError(true);
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setStep(3);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setFileTypeError(true);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setFileSizeError(true);
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setStep(3);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile || !selectedTemplate) {
            setError('Please select both an image and a template');
            return;
        }

        if (user.credits < selectedTemplate.creditCost) {
            setError('Insufficient credits. Please purchase more credits.');
            return;
        }

        setGenerating(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('templateId', selectedTemplate._id);

            const response = await generationAPI.generate(formData);

            updateUserCredits(response.data.remainingCredits);
            setGeneratedImage(response.data.image);
        } catch (error) {
            console.error('Error generating image:', error);
            setError(error.response?.data?.error || 'Failed to generate image');
        } finally {
            setGenerating(false);
        }
    };

    const handleReset = () => {
        setStep(1);
        setSelectedTemplate(null);
        setSelectedFile(null);
        setPreview(null);
        setGeneratedImage(null);
        setError('');
    };

    const handleViewHistory = () => {
        navigate('/history');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="templates-page">
            {/* Hero Section */}
            <section className="templates-hero">
                <div className="container">
                    <h1>Design Your Perfect <span className="highlight">AI Moment</span></h1>
                    <p>Upload your inspiration, choose a template, and let our AI craft stunning images tailored to your vision</p>

                    {/* Step Tabs */}
                    <div className="step-tabs">
                        <button
                            className={`step-tab ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}
                            onClick={() => step > 1 && setStep(1)}
                        >
                            <span className="step-icon"><Sparkles size={16} /></span>
                            Templates
                        </button>
                        <button
                            className={`step-tab ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}
                            onClick={() => step > 2 && setStep(2)}
                            disabled={!selectedTemplate}
                        >
                            <span className="step-icon"><Upload size={16} /></span>
                            Upload
                        </button>
                        <button
                            className={`step-tab ${step === 3 ? 'active' : ''}`}
                            disabled={!selectedFile}
                        >
                            <span className="step-icon"><Wand2 size={16} /></span>
                            Generate
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="templates-content">
                <div className="container">


                    {/* Step 1: Templates */}
                    {step === 1 && (
                        <div className="templates-grid-section fade-in">
                            <div className="templates-grid">
                                {templates.map((template, index) => {
                                    return (
                                        <div
                                            key={template._id}
                                            className={`template-card ${selectedTemplate?._id === template._id ? 'selected' : ''}`}
                                            onClick={() => handleSelectTemplate(template)}
                                            style={{ animationDelay: `${index * 0.05}s` }}
                                        >
                                            {/* Popular badge - left side */}
                                            {template.popular && (
                                                <div className="template-badge badge-popular">
                                                    <Flame size={15} />
                                                </div>
                                            )}

                                            {/* Credit/Free badge - right side */}
                                            <div className={`template-badge ${template.creditCost > 0 ? 'badge-credits' : 'badge-free'}`}>
                                                <span className="badge-icon-circle">
                                                    <Coins size={12} />
                                                </span>
                                                <span className="badge-text">
                                                    {template.creditCost > 0 ? template.creditCost : 'Free'}
                                                </span>
                                            </div>

                                            <div className="template-image-wrapper">
                                                <img
                                                    src={template.thumbnailUrl?.startsWith('http') ? template.thumbnailUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${template.thumbnailUrl}`}
                                                    alt={template.name}
                                                    className="template-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://picsum.photos/400/300?random=' + template._id;
                                                    }}
                                                />
                                            </div>
                                            <div className="template-name">{template.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Upload */}
                    {step === 2 && (
                        <div className="upload-section fade-in">
                            <div className="selected-template-preview">
                                <div className="selected-template-thumb">
                                    <img
                                        src={selectedTemplate?.thumbnailUrl?.startsWith('http') ? selectedTemplate.thumbnailUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedTemplate?.thumbnailUrl}`}
                                        alt={selectedTemplate?.name}
                                        onError={(e) => {
                                            e.target.src = 'https://picsum.photos/400/300?random=' + selectedTemplate?._id;
                                        }}
                                    />
                                </div>
                                <div className="selected-template-details">
                                    <span className="selected-template-label">Selected Template</span>
                                    <h3 className="selected-template-name">{selectedTemplate?.name}</h3>
                                    <span className="selected-template-cost">{selectedTemplate?.creditCost} {selectedTemplate?.creditCost === 1 ? 'Credit' : 'Credits'}</span>
                                    <button className="btn btn-link" onClick={() => setStep(1)}>Change template</button>
                                </div>
                            </div>

                            <div
                                className="upload-dropzone"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="file-input"
                                    accept=".png,.jpg,.jpeg,.webp"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="file-input" className="dropzone-label">
                                    <div className="dropzone-icon"><FolderOpen size={32} /></div>
                                    <h3>Drop your image here</h3>
                                    <p>or click to browse</p>
                                    <span className="dropzone-hint">Supports: PNG, JPG, WEBP (max 10MB)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Generate */}
                    {step === 3 && !generatedImage && (
                        <div className="generate-section fade-in">
                            <div className="generate-preview">
                                <div className="preview-card">
                                    <h4>Your Image</h4>
                                    <img src={preview} alt="Preview" className="preview-image" />
                                </div>
                                <div className="preview-arrow"><ArrowRight size={24} /></div>
                                <div className="preview-card">
                                    <h4>Template Style</h4>
                                    <img
                                        src={selectedTemplate?.thumbnailUrl?.startsWith('http') ? selectedTemplate.thumbnailUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedTemplate?.thumbnailUrl}`}
                                        alt={selectedTemplate?.name}
                                        className="preview-image"
                                        onError={(e) => {
                                            e.target.src = 'https://picsum.photos/400/300?random=' + selectedTemplate?._id;
                                        }}
                                    />
                                    <div className="template-style-info">
                                        <span className="style-name">{selectedTemplate?.name}</span>
                                        <span className="style-cost">{selectedTemplate?.creditCost} credit</span>
                                    </div>
                                </div>
                            </div>

                            <div className="generate-actions">
                                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                                    Change Image
                                </button>
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleGenerate}
                                    disabled={generating}
                                >
                                    <Sparkles size={18} /> Generate Image
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Generated Result */}
                    {generatedImage && (
                        <div className="result-section fade-in">
                            <h2><PartyPopper size={24} /> Your AI-Generated Image</h2>
                            <div className="result-image-wrapper">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${generatedImage.generatedImagePath}`}
                                    alt="Generated"
                                    className="generated-image"
                                />
                            </div>
                            <div className="result-actions">
                                <button className="btn btn-secondary" onClick={handleReset}>
                                    Generate Another
                                </button>
                                <button className="btn btn-primary" onClick={handleViewHistory}>
                                    View History
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* File Size Error Popup */}
            {fileSizeError && (
                <div className="file-size-overlay" onClick={() => setFileSizeError(false)}>
                    <div className="file-size-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close-btn" onClick={() => setFileSizeError(false)}>
                            <X size={20} />
                        </button>
                        <div className="popup-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <h3>File Too Large</h3>
                        <p>Your file size exceeds the 10MB limit. Please choose a smaller image and try again.</p>
                        <button className="btn btn-primary" onClick={() => setFileSizeError(false)}>
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* File Type Error Popup */}
            {fileTypeError && (
                <div className="file-size-overlay" onClick={() => setFileTypeError(false)}>
                    <div className="file-size-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close-btn" onClick={() => setFileTypeError(false)}>
                            <X size={20} />
                        </button>
                        <div className="popup-icon">
                            <AlertTriangle size={48} />
                        </div>
                        <h3>Unsupported File Format</h3>
                        <p>This file format is not supported. Please upload a PNG, JPG, or WEBP image only.</p>
                        <button className="btn btn-primary" onClick={() => setFileTypeError(false)}>
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Generating Loading Overlay */}
            {generating && (
                <div className="generating-overlay">
                    <div className="generating-modal">
                        <div className="generating-spinner-ring">
                            <div className="generating-spinner-inner"></div>
                            <Sparkles size={28} className="generating-sparkle-icon" />
                        </div>
                        <h3>Creating Your Masterpiece</h3>
                        <p>Our AI is transforming your image with the <strong>{selectedTemplate?.name}</strong> style...</p>
                        <div className="generating-progress-bar">
                            <div className="generating-progress-fill"></div>
                        </div>
                        <span className="generating-hint">This may take a few moments</span>
                    </div>
                </div>
            )}

            {/* Error Modal Popup */}
            {error && (
                <div className="file-size-overlay" onClick={() => setError('')}>
                    <div className="file-size-popup error-modal-popup" onClick={(e) => e.stopPropagation()}>
                        <button className="popup-close-btn" onClick={() => setError('')}>
                            <X size={20} />
                        </button>
                        <div className="popup-icon error-popup-icon">
                            <XCircle size={48} />
                        </div>
                        <h3>Generation Failed</h3>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => setError('')}>
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;
