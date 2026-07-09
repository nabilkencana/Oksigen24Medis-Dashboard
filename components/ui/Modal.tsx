'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default'
}: ModalProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col gap-4"
            >
              {/* Title & Description */}
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-2">
                <Button variant="outline" onClick={onClose}>
                  {cancelText}
                </Button>
                <Button
                  variant={variant === 'destructive' ? 'destructive' : 'primary'}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
