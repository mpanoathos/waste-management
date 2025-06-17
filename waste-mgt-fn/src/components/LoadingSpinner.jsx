import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
    const sizeClasses = {
        small: 'h-4 w-4',
        medium: 'h-8 w-8',
        large: 'h-12 w-12'
    };

    const spinner = (
        <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4">
            {spinner}
        </div>
    );
};

export default LoadingSpinner; 