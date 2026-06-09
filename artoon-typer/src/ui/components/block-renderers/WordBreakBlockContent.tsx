/**
 * Word break block content
 */
export function WordBreakBlockContent() {
  return (
    <div className="block__content word-break-block">
      <span
        className="word-break-indicator"
        title="فاصل كلمة"
        style={{
          color: '#999',
          fontSize: '0.8em',
          opacity: 0.5,
          userSelect: 'none',
        }}
      >
        ⎵
      </span>
      <wbr />
    </div>
  );
}
