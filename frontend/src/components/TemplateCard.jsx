import { Star, Check } from 'lucide-react';
import './TemplateCard.css';

const TemplateCard = ({ template, onSelect, selected }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className={`template-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(template)}>
            <div className="template-image">
                <img src={`${API_URL}${template.thumbnail}`} alt={template.name} />
                <div className="template-overlay">
                    <span className="template-category">{template.category}</span>
                </div>
            </div>
            <div className="template-content">
                <h4 className="template-name">{template.name}</h4>
                <p className="template-description">{template.description}</p>
                <div className="template-footer">
                    <span className="template-cost">
                        <span className="cost-icon"><Star size={14} /></span>
                        {template.creditCost} credits
                    </span>
                    {selected && <span className="selected-badge"><Check size={14} /> Selected</span>}
                </div>
            </div>
        </div>
    );
};

export default TemplateCard;
