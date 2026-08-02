import React from 'react';
import type { ValidationResult } from '@artoon/validator';

export interface ValidationPanelProps {
  validationResult: ValidationResult | null;
  onClose: () => void;
}

export function ValidationPanel({ validationResult, onClose }: ValidationPanelProps) {
  if (!validationResult) return null;

  const { errors, warnings, philosophyBreaches, stats } = validationResult;

  if (stats.totalIssues === 0) {
    return null;
  }

  return (
    <div className="validation-panel" style={{
      position: 'fixed',
      bottom: '40px',
      left: '20px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '16px',
      width: '320px',
      maxHeight: '400px',
      overflowY: 'auto',
      zIndex: 1000,
      direction: 'rtl'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>مشاكل التحقق</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <h4 style={{ color: '#d32f2f', margin: '0 0 8px 0', fontSize: '14px' }}>الأخطاء ({errors.length})</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {errors.map((err, i) => (
              <li key={`err-${i}`} style={{ marginBottom: '8px', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                <strong>سطر {err.line || '-'}:</strong> {err.what}
              </li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <h4 style={{ color: '#f57c00', margin: '0 0 8px 0', fontSize: '14px' }}>التحذيرات ({warnings.length})</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {warnings.map((warn, i) => (
              <li key={`warn-${i}`} style={{ marginBottom: '8px', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                <strong>سطر {warn.line || '-'}:</strong> {warn.what}
              </li>
            ))}
          </ul>
        </div>
      )}

      {philosophyBreaches.length > 0 && (
        <div>
          <h4 style={{ color: '#1976d2', margin: '0 0 8px 0', fontSize: '14px' }}>مخالفات الفلسفة ({philosophyBreaches.length})</h4>
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {philosophyBreaches.map((breach, i) => (
              <li key={`phi-${i}`} style={{ marginBottom: '8px', fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
                <strong>سطر {breach.line || '-'}:</strong> {breach.what}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
