import { useState, useEffect } from 'react';
import { generationAPI } from '../services/api';
import { Palette, Inbox } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import './History.css';

const History = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await generationAPI.getHistory();
            setImages(response.data.images || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (imageUrl, index) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${imageUrl}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `generated-image-${index + 1}.png`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="history-container container">
            <div className="history-header">
                <h1>Generation History <Palette size={28} /></h1>
                <p className="text-muted">View and download all your generated images</p>
            </div>

            {images.length === 0 ? (
                <div className="empty-state card-glass">
                    <span className="empty-icon"><Inbox size={32} /></span>
                    <h3>No generations yet</h3>
                    <p>Start creating amazing AI images!</p>
                </div>
            ) : (
                <div className="history-grid grid grid-3">
                    {images.map((img, index) => (
                        <div key={img._id} className="history-card card">
                            <div className="history-image">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${img.generatedImagePath}`}
                                    alt="Generated"
                                />
                            </div>
                            <div className="history-info">
                                <div className="history-meta">
                                    <span className="template-name">{img.templateId?.name || 'Unknown Template'}</span>
                                    <span className="badge badge-success">Completed</span>
                                </div>
                                <div className="history-footer">
                                    <span className="text-muted">{new Date(img.createdAt).toLocaleDateString()}</span>
                                    <button
                                        onClick={() => handleDownload(img.generatedImagePath, index)}
                                        className="btn btn-primary btn-sm"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
