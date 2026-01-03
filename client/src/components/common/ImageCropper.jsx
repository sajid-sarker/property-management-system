import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FaSearchPlus, FaSearchMinus, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * ImageCropper Component
 * Allows users to zoom, pan, and crop profile pictures
 * 
 * Props:
 * - imageSrc: string - The source image to crop (base64 or URL)
 * - onCropComplete: function(croppedImageBase64) - Called when user confirms the crop
 * - onCancel: function - Called when user cancels
 * - aspectRatio: number - Aspect ratio for the crop (default 1 for square)
 */
const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.1, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.1, 1));
    };

    const createCroppedImage = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>
                        Adjust Profile Picture
                    </h3>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        Drag to reposition • Use slider or buttons to zoom
                    </p>
                </div>

                {/* Crop Area */}
                <div style={cropContainerStyle}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteInternal}
                    />
                </div>

                {/* Zoom Controls */}
                <div style={controlsStyle}>
                    <button
                        type="button"
                        onClick={handleZoomOut}
                        style={zoomButtonStyle}
                        title="Zoom out"
                    >
                        <FaSearchMinus />
                    </button>
                    
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={sliderStyle}
                    />
                    
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        style={zoomButtonStyle}
                        title="Zoom in"
                    >
                        <FaSearchPlus />
                    </button>
                </div>

                {/* Action Buttons */}
                <div style={actionsStyle}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaTimes /> Cancel
                    </button>
                    <button
                        type="button"
                        onClick={createCroppedImage}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FaCheck /> Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to create cropped image
const getCroppedImg = (imageSrc, pixelCrop) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size to desired output (200x200 for profile pics)
            const outputSize = 200;
            canvas.width = outputSize;
            canvas.height = outputSize;

            // Draw the cropped image
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                outputSize,
                outputSize
            );

            // Convert to base64
            const base64Image = canvas.toDataURL('image/jpeg', 0.85);
            resolve(base64Image);
        };

        image.onerror = (error) => {
            reject(error);
        };

        image.src = imageSrc;
    });
};

// Styles
const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalStyle = {
    background: 'var(--color-primary-light)',
    borderRadius: '12px',
    padding: '1.5rem',
    width: '90%',
    maxWidth: '500px',
    color: 'white',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
};

const headerStyle = {
    textAlign: 'center',
    marginBottom: '1.5rem',
};

const cropContainerStyle = {
    position: 'relative',
    width: '100%',
    height: '300px',
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
};

const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
};

const zoomButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
};

const sliderStyle = {
    width: '200px',
    height: '6px',
    WebkitAppearance: 'none',
    appearance: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
};

const actionsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
};

export default ImageCropper;
