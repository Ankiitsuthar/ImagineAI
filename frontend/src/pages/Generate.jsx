import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templateAPI, generationAPI } from '../services/api';
import TemplateCard from '../components/TemplateCard';
import './Generate.css';

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
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
        return (
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="generate-container container">
            <div className="generate-header">
                <h1>Generate AI Image ✨</h1>
                <p className="text-muted">Upload your image and select a template to create amazing AI-powered images</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Show generated image result */}
            {generatedImage && (
                <div className="generation-result card-glass">
                    <h3>🎉 Your Generated Image</h3>
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
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-input" className="upload-label">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="preview-image" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <span className="upload-icon">📁</span>
                                        <p>Click to upload or drag and drop</p>
                                        <p className="text-muted">PNG, JPG, WEBP (max 10MB)</p>
                                    </div>
                                )}
                            </label>
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
                        {generating ? (
                            <>
                                <span className="spinner-small"></span>
                                Generating...
                            </>
                        ) : (
                            `Generate Image (${selectedTemplate?.creditCost || 0} credits)`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Generate;
