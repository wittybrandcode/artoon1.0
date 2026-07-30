import React from 'react';

import type { ValidationResult } from '@artoon/validator';

export interface StatusBarProps {
    validationResult?: ValidationResult | null;
    onToggleValidationPanel?: () => void;
    blockCount: number;
    direction: 'rtl' | 'ltr';
    theme: 'light' | 'dark';
    statusLabel?: string;
}

export function StatusBar({ blockCount, direction, theme, statusLabel = 'تم الحفظ', validationResult, onToggleValidationPanel }: StatusBarProps) {
    return (
        <div className="status-bar" role="status" aria-live="polite">
            <div className="status-bar__left">
                <div className="status-bar__item">
                    <span className="status-bar__indicator"></span>
                    <span>{statusLabel}</span>
                </div>
                <div className="status-bar__item">
                    <i className="fas fa-cube"></i>
                    <span>{blockCount} {blockCount === 1 ? 'بلوك' : 'بلوكات'}</span>
                </div>

                {validationResult && (
                    <div
                        className="status-bar__item"
                        style={{ cursor: 'pointer', padding: '0 8px', borderRadius: '4px', backgroundColor: validationResult.stats.errorCount > 0 ? '#ffebee' : validationResult.stats.warningCount > 0 ? '#fff3e0' : 'transparent' }}
                        onClick={onToggleValidationPanel}
                    >
                        {validationResult.stats.errorCount > 0 ? (
                            <span style={{ color: '#d32f2f' }}>⚠️ أخطاء: {validationResult.stats.errorCount}</span>
                        ) : validationResult.stats.warningCount > 0 ? (
                            <span style={{ color: '#f57c00' }}>ℹ️ تحذيرات: {validationResult.stats.warningCount}</span>
                        ) : (
                            <span style={{ color: '#388e3c' }}>✅ صالح</span>
                        )}
                    </div>
                )}

            </div>
            <div className="status-bar__right">
                <div className="status-bar__item">
                    <i className="fas fa-language"></i>
                    <span>{direction === 'rtl' ? 'العربية' : 'English'}</span>
                </div>
                <div className="status-bar__item">
                    <i className={`fas ${theme === 'light' ? 'fa-sun' : 'fa-moon'}`}></i>
                    <span>{theme === 'light' ? 'فاتح' : 'داكن'}</span>
                </div>
            </div>
        </div>
    );
}
