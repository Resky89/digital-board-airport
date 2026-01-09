'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnOverlay?: boolean;
  showLoading?: boolean;
  ariaLabel?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnOverlay = true,
  showLoading = false,
  ariaLabel
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.addEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'hidden';
      
      // Remove automatic focus - let user click on input fields manually
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabel || 'modal-title'}
    >
      <div 
        ref={modalRef}
        className={`modal-content ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {showLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        
        <div className="flex items-center justify-between mb-6">
          <h2 
            id="modal-title"
            className="text-xl font-bold text-white"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
