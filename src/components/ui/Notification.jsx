// src/components/ui/Notification.jsx
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({
    show,
    onClose,
    type = 'success',
    title,
    message,
    duration = 5000,
    position = 'top-right'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);

            // Auto-dismiss após duration
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);

                return () => clearTimeout(timer);
            }
        }
    }, [show, duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Aguarda animação terminar
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 border-green-200',
                    text: 'text-green-800',
                    icon: CheckCircle,
                    iconColor: 'text-green-500',
                    progressBar: 'bg-green-500'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    icon: XCircle,
                    iconColor: 'text-red-500',
                    progressBar: 'bg-red-500'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-800',
                    icon: AlertCircle,
                    iconColor: 'text-yellow-500',
                    progressBar: 'bg-yellow-500'
                };
            case 'info':
                return {
                    bg: 'bg-blue-50 border-blue-200',
                    text: 'text-blue-800',
                    icon: Info,
                    iconColor: 'text-blue-500',
                    progressBar: 'bg-blue-500'
                };
            default:
                return {
                    bg: 'bg-gray-50 border-gray-200',
                    text: 'text-gray-800',
                    icon: Info,
                    iconColor: 'text-gray-500',
                    progressBar: 'bg-gray-500'
                };
        }
    };

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            default:
                return 'top-4 right-4';
        }
    };

    if (!show) return null;

    const styles = getTypeStyles();
    const IconComponent = styles.icon;

    return (
        <div className={fixed z-[9999] ${getPositionStyles()}}>
            <div
                className={`
          ${styles.bg} ${styles.text} 
          border rounded-xl shadow-lg backdrop-blur-sm max-w-sm w-full sm:w-96
          transform transition-all duration-300 ease-out
          ${isVisible
                        ? 'translate-y-0 opacity-100 scale-100'
                        : '-translate-y-2 opacity-0 scale-95'
                    }
        `}
            >
                {/* Progress Bar */}
                {duration > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
                        <div
                            className={h-full ${styles.progressBar} animate-shrink}
                            style={{
                                animation: shrink ${duration}ms linear forwards
                            }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="p-4 pt-6">
                    <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                            <IconComponent className={w-5 h-5 ${styles.iconColor}} />
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h4 className="text-sm font-semibold mb-1">
                                    {title}
                                </h4>
                            )}
                            <p className="text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors duration-200"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-shrink {
          animation: shrink ${duration}ms linear forwards;
        }
      `}</style>
        </div>
    );
};

// Hook para usar notificações
export const useNotification = () => {
    const [notification, setNotification] = useState(null);

    const showNotification = ({ type, title, message, duration, position }) => {
        setNotification({
            id: Date.now(),
            show: true,
            type,
            title,
            message,
            duration,
            position
        });
    };

    const hideNotification = () => {
        setNotification(prev => prev ? { ...prev, show: false } : null);
        setTimeout(() => setNotification(null), 300);
    };

    const NotificationComponent = notification ? (
        <Notification
            key={notification.id}
            show={notification.show}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            duration={notification.duration}
            position={notification.position}
            onClose={hideNotification}
        />
    ) : null;

    return {
        showNotification,
        hideNotification,
        NotificationComponent
    };
};

export default Notification;