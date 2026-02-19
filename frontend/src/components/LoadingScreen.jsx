import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ brandName = 'Imagine AI' }) => {
    return (
        <div className="loading-screen">
            {/* Bouncing dots */}
            <div className="loading-screen__dots">
                <div className="loading-screen__dot" />
                <div className="loading-screen__dot" />
                <div className="loading-screen__dot" />
                <div className="loading-screen__dot" />
                <div className="loading-screen__dot" />
            </div>

            {/* Brand label */}
            <span className="loading-screen__brand">{brandName}</span>
        </div>
    );
};

export default LoadingScreen;
