import React from 'react';

export interface StatusBarProps {
    blockCount: number;
    direction: 'rtl' | 'ltr';
    theme: 'light' | 'dark';
    statusLabel?: string;
}

export function StatusBar({ blockCount, direction, theme, statusLabel = 'تم الحفظ' }: StatusBarProps) {
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
