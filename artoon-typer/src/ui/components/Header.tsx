import React, { useState, useEffect } from 'react';

const FONTS = [
    { id: 'cairo', name: 'القاهرة', family: "'Cairo', sans-serif" },
    { id: 'tajawal', name: 'تجوال', family: "'Tajawal', sans-serif" },
    { id: 'almarai', name: 'المراعي', family: "'Almarai', sans-serif" },
    { id: 'noto', name: 'نوتو', family: "'Noto Sans Arabic', sans-serif" },
    { id: 'amiri', name: 'أميري', family: "'Amiri', serif", divider: true },
    { id: 'scheherazade', name: 'شهرزاد', family: "'Scheherazade New', serif" },
    { id: 'lateef', name: 'لطيف', family: "'Lateef', cursive" },
    { id: 'reem', name: 'ريم كوفي', family: "'Reem Kufi', sans-serif", divider: true },
    { id: 'kufam', name: 'كوفام', family: "'Kufam', sans-serif" },
    { id: 'aref', name: 'عارف رقعة', family: "'Aref Ruqaa', serif", divider: true },
    { id: 'rakkas', name: 'ركّاص', family: "'Rakkas', cursive" },
    { id: 'lalezar', name: 'لاليزار', family: "'Lalezar', cursive" },
    { id: 'jomhuria', name: 'جمهورية', family: "'Jomhuria', cursive" },
    { id: 'segoe', name: 'Segoe', family: "'Segoe UI', sans-serif", divider: true },
    { id: 'dubai', name: 'دبي', family: "'Dubai', sans-serif" }
];

export interface HeaderProps {
    theme: 'light' | 'dark';
    direction: 'rtl' | 'ltr';
    onThemeToggle: () => void;
    onDirectionToggle: () => void;
    onExport?: () => void;
    onImport?: () => void;
    onTogglePreview?: () => void;
    isPreviewActive?: boolean;
    onToggleSource?: () => void;
    isSourceActive?: boolean;
    fileName?: string | null;
}

export function Header({
    theme,
    direction,
    onThemeToggle,
    onDirectionToggle,
    onExport,
    onImport,
    onTogglePreview,
    isPreviewActive,
    onToggleSource,
    isSourceActive,
    fileName
}: HeaderProps) {
    const [isFontOpen, setIsFontOpen] = useState(false);
    const [currentFont, setCurrentFont] = useState(FONTS[0]);

    // Handle click outside to close font dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.font-selector')) {
                setIsFontOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleFontSelect = (font: typeof FONTS[0]) => {
        setCurrentFont(font);
        setIsFontOpen(false);
        // Setting font to the document body to apply globally
        document.body.setAttribute('data-font', font.id);
        document.body.style.fontFamily = font.family;
    };

    return (
        <header className="app-header" id="app-header">
            <div className="header__logo">
                <div className="logo__icon">A</div>
                <h1 className="logo__title">
                    ARTOON TYPER
                    {fileName && <span style={{ fontSize: '0.6em', opacity: 0.7, marginInlineStart: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fas fa-file-text"></i> {fileName}
                    </span>}
                </h1>
                <span className="logo__badge">v2.0</span>
            </div>

            <div className="header__actions">
                {/* Font Selector */}
                <div className="font-selector">
                    <button
                        type="button"
                        className="btn btn--secondary btn--md font-selector__toggle"
                        title="اختيار الخط"
                        onClick={() => setIsFontOpen(!isFontOpen)}
                    >
                        <i className="fas fa-font"></i>
                        <span>{currentFont.name}</span>
                        <i className="fas fa-chevron-down" style={{ marginInlineStart: '4px', fontSize: '10px' }}></i>
                    </button>

                    <div className={`font-selector__dropdown ${isFontOpen ? 'font-selector__dropdown--open' : ''}`}>
                        {FONTS.map((font, idx) => (
                            <React.Fragment key={font.id}>
                                {font.divider && <div className="font-selector__divider"></div>}
                                <button
                                    type="button"
                                    className={`font-selector__option ${currentFont.id === font.id ? 'font-selector__option--active' : ''}`}
                                    onClick={() => handleFontSelect(font)}
                                >
                                    <span className="font-selector__preview" style={{ fontFamily: font.family }}>
                                        {font.name}
                                    </span>
                                    <span className="font-selector__check">
                                        <i className="fas fa-check"></i>
                                    </span>
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <button type="button" className="btn btn--secondary btn--md" onClick={onDirectionToggle} title={direction === 'rtl' ? 'الاتجاه: من اليمين لليسار' : 'Direction: Left to Right'}>
                    <i className="fas fa-language"></i>
                    <span>{direction === 'rtl' ? 'عربي' : 'EN'}</span>
                </button>

                {onImport && (
                    <button type="button" className="btn btn--secondary btn--md" onClick={onImport} title="استيراد ملف">
                        <i className="fas fa-upload"></i>
                        <span>استيراد</span>
                    </button>
                )}

                {onExport && (
                    <button type="button" className="btn btn--secondary btn--md" onClick={onExport} title="تصدير ARTOON">
                        <i className="fas fa-download"></i>
                        <span>تصدير</span>
                    </button>
                )}

                {onToggleSource && (
                    <button
                        type="button"
                        className={`btn ${isSourceActive ? 'btn--primary' : 'btn--secondary'} btn--md`}
                        onClick={onToggleSource}
                        title="مصدر ARTOON"
                    >
                        <i className="fas fa-code"></i>
                        <span>{isSourceActive ? 'إخفاء المصدر' : 'المصدر'}</span>
                    </button>
                )}

                {onTogglePreview && (
                    <button
                        type="button"
                        className={`btn ${isPreviewActive ? 'btn--primary' : 'btn--secondary'} btn--md`}
                        id="btn-preview"
                        onClick={onTogglePreview}
                        title="معاينة HTML"
                    >
                        <i className={isPreviewActive ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                        <span>{isPreviewActive ? 'إخفاء المعاينة' : 'معاينة'}</span>
                    </button>
                )}

                <button type="button" className="btn btn--icon btn--md" id="btn-theme" onClick={onThemeToggle} title="تبديل السمة">
                    <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
                </button>
            </div>
        </header>
    );
}
