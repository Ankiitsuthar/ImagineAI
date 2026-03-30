import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templateAPI, generationAPI } from '../services/api';
import { Sparkles, FolderOpen, PartyPopper, XCircle, X, ShieldAlert, CreditCard, ImageOff, ServerCrash, WifiOff } from 'lucide-react';
import TemplateCard from '../components/TemplateCard';
import LoadingScreen from '../components/LoadingScreen';
import './Generate.css';

const getErrorInfo = (error) => {
    const lower = (error || '').toLowerCase();
    if (lower.includes('insufficient credits') || lower.includes('credit')) {
        return { title: 'Insufficient Credits', icon: CreditCard, color: '#f59e0b' };
    }
    if (lower.includes('template not found')) {
        return { title: 'Template Not Found', icon: ImageOff, color: '#ef4444' };
    }
    if (lower.includes('no image') || lower.includes('file provided')) {
        return { title: 'No Image Provided', icon: ImageOff, color: '#8b5cf6' };
    }
    if (lower.includes('unsupported') || lower.includes('file format')) {
        return { title: 'Unsupported Format', icon: ShieldAlert, color: '#ef4444' };
    }
    if (lower.includes('too large') || lower.includes('file size') || lower.includes('10mb')) {
        return { title: 'File Too Large', icon: ShieldAlert, color: '#f59e0b' };
    }
    if (lower.includes('corrupted') || lower.includes('not a valid image')) {
        return { title: 'Invalid Image', icon: ImageOff, color: '#ef4444' };
    }
    if (lower.includes('network') || lower.includes('timeout') || lower.includes('connect')) {
        return { title: 'Connection Error', icon: WifiOff, color: '#6366f1' };
    }
    if (lower.includes('server') || lower.includes('500')) {
        return { title: 'Server Error', icon: ServerCrash, color: '#ef4444' };
    }
    if (lower.includes('select both') || lower.includes('please select')) {
        return { title: 'Missing Selection', icon: ShieldAlert, color: '#f59e0b' };
    }
    return { title: 'Generation Failed', icon: XCircle, color: '#dc2626' };
};

const Generate = () => {
    const { user, updateUserCredits } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatedImage, setGeneratedImage] = useState(null);

    // Get pre-selected templateId from Collection page
    const preSelectedTemplateId = location.state?.templateId;

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Auto-select template if passed from Collection page
    useEffect(() => {
        if (preSelectedTemplateId && templates.length > 0) {
            const template = templates.find(t => t._id === preSelectedTemplateId);
            if (template) {
                setSelectedTemplate(template);
            }
        }
    }, [preSelectedTemplateId, templates]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await templateAPI.getAll();
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Unsupported file format. Please upload a PNG, JPG, or WEBP image.');
            e.target.value = '';
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            setError(`File is too large (${sizeMB}MB). Maximum allowed size is 10MB.`);
            e.target.value = '';
            return;
        }

        // Validate it's actually an image by trying to load it
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            setSelectedFile(file);
            setError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            setError('The file appears to be corrupted or is not a valid image.');
            e.target.value = '';
        };
        img.src = objectUrl;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreview(null);
        // Reset file input
        const input = document.getElementById('file-input');
        if (input) input.value = '';
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
        setSuccess('');
        setGeneratedImage(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('templateId', selectedTemplate._id);

            const response = await generationAPI.generate(formData);

            updateUserCredits(response.data.remainingCredits);
            setGeneratedImage(response.data.image);
            setSuccess('Image generated successfully!');
        } catch (error) {
            console.error('Error generating image:', error);
            setError(error.response?.data?.error || 'Failed to generate image');
        } finally {
            setGenerating(false);
        }
    };

    const handleViewHistory = () => {
        navigate('/history');
    };

    const handleGenerateAnother = () => {
        setSelectedFile(null);
        setPreview(null);
        setGeneratedImage(null);
        setSuccess('');
        setError('');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="generate-container container">
            <div className="generate-header">
                <h1>Generate AI Image <Sparkles size={28} /></h1>
                <p className="text-muted">Upload your image and select a template to create amazing AI-powered images</p>
            </div>


            {success && <div className="alert alert-success">{success}</div>}

            {/* Show generated image result */}
            {generatedImage && (
                <div className="generation-result card-glass">
                    <h3><PartyPopper size={22} /> Your Generated Image</h3>
                    <div className="result-image-container">
                        <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${generatedImage.generatedImagePath}`}
                            alt="Generated"
                            className="result-image"
                        />
                    </div>
                    <div className="result-actions">
                        <button onClick={handleViewHistory} className="btn btn-primary">
                            View in History
                        </button>
                        <button onClick={handleGenerateAnother} className="btn btn-secondary">
                            Generate Another
                        </button>
                    </div>
                </div>
            )}

            {!generatedImage && (
                <div className="generate-content">
                    <div className="upload-section card-glass">
                        <h3>Upload Your Image</h3>
                        <div className="upload-area">
                            <input
                                type="file"
                                id="file-input"
                                accept=".png,.jpg,.jpeg,.webp"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-input" className="upload-label">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="preview-image" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <span className="upload-icon"><FolderOpen size={32} /></span>
                                        <p><strong>Drop your image here</strong></p>
                                        <p className="text-muted-sm">or click to browse</p>
                                        <p className="upload-formats">Supports: PNG, JPG, WEBP (max 10MB)</p>
                                    </div>
                                )}
                            </label>
                            {selectedFile && (
                                <div className="upload-file-info">
                                    <span className="file-name">{selectedFile.name}</span>
                                    <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                                    <button
                                        type="button"
                                        className="file-remove-btn"
                                        onClick={handleRemoveFile}
                                        title="Remove file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="template-section">
                        <h3>Select a Template</h3>
                        {selectedTemplate && (
                            <div className="selected-info">
                                <p>Selected: <strong>{selectedTemplate.name}</strong></p>
                                <p>Cost: <strong>{selectedTemplate.creditCost} credits</strong></p>
                            </div>
                        )}
                        <div className="templates-grid grid grid-3">
                            {templates.map((template) => (
                                <TemplateCard
                                    key={template._id}
                                    template={template}
                                    selected={selectedTemplate?._id === template._id}
                                    onSelect={setSelectedTemplate}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!generatedImage && (
                <div className="generate-actions">
                    <button
                        onClick={handleGenerate}
                        className="btn btn-primary btn-lg"
                        disabled={!selectedFile || !selectedTemplate || generating}
                    >
                        {`Generate Image (${selectedTemplate?.creditCost || 0} credits)`}
                    </button>
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
            {error && (() => {
                const errInfo = getErrorInfo(error);
                const ErrIcon = errInfo.icon;
                return (
                    <div className="file-size-overlay" onClick={() => setError('')}>
                        <div className="file-size-popup error-modal-modern" onClick={(e) => e.stopPropagation()}>
                            <button className="popup-close-btn" onClick={() => setError('')}>
                                <X size={20} />
                            </button>
                            <div className="error-icon-modern" style={{ background: `linear-gradient(135deg, ${errInfo.color}22 0%, ${errInfo.color}11 100%)`, border: `2px solid ${errInfo.color}33` }}>
                                <ErrIcon size={36} style={{ color: errInfo.color }} />
                            </div>
                            <h3 className="error-title-modern" style={{ color: errInfo.color }}>{errInfo.title}</h3>
                            <div className="error-divider-modern" style={{ background: `linear-gradient(90deg, transparent, ${errInfo.color}44, transparent)` }}></div>
                            <button className="btn btn-primary error-btn-modern" onClick={() => setError('')}>
                                Try Again
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default Generate;
