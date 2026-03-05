import React from 'react';
import './LoadingScreen.css';
import logo from '../assets/logo.svg';

const LoadingScreen = ({ brandName = 'ImagineAI' }) => {
    return (
        <div className="loading-screen">
            {/* Ambient glow orbs */}
            <div className="loading-orb loading-orb--1"></div>
            <div className="loading-orb loading-orb--2"></div>

            {/* Center content */}
            <div className="loading-center">
                {/* Logo with pulse ring */}
                <div className="loading-logo-wrapper">
                    <div className="loading-pulse-ring"></div>
                    <div className="loading-pulse-ring loading-pulse-ring--delayed"></div>
                    <div className="loading-logo">
                        <img src={logo} alt={brandName} />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="loading-progress">
                    <div className="loading-progress-bar"></div>
                </div>

                {/* Brand name */}
                <span className="loading-brand">{brandName}</span>
            </div>
        </div>
    );
};

export default LoadingScreen;
