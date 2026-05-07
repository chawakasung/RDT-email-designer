import { useRef, useState, useEffect } from 'react';

// Rich-text Letter block: bold / italic / color + alignment, content stored as HTML
export function LetterBlock({ html, align, fontSize, editing, onEdit, onClose }) {
  const fs = Number(fontSize) || 18;
  const ref = useRef(null);
  const [color, setColor] = useState('#0066cc');
  const lastHtml = useRef(html);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html || '';
      lastHtml.current = html || '';
    }
  }, [html]);

  const exec = (cmd, val) => {
    if (!editing) return;
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    const next = ref.current?.innerHTML || '';
    if (next !== lastHtml.current) { lastHtml.current = next; onEdit('html', next); }
  };
  const onInput = () => {
    const next = ref.current?.innerHTML || '';
    if (next !== lastHtml.current) { lastHtml.current = next; onEdit('html', next); }
  };
  const colors = ['#1a1a1a', '#0066cc', '#0b41cd', '#d6002a', '#00875a', '#7b1fa2', '#f57c00', '#5e6c84'];

  return (
    <div className="e-letter" style={{ textAlign: align || 'left' }}>
      {editing && (
        <div className="e-letter__toolbar" onMouseDown={(e) => e.preventDefault()}>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('bold')} title="Bold"><b>B</b></button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('italic')} title="Italic"><i>I</i></button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('underline')} title="Underline"><u>U</u></button>
          <span className="e-letter__sep" />
          <div className="e-letter__color">
            <span style={{ color, fontWeight: 700 }}>A</span>
            <div className="e-letter__swatches">
              {colors.map(c => (
                <button key={c} type="button" onMouseDown={(e) => e.preventDefault()} style={{ background: c }} onClick={() => { setColor(c); exec('foreColor', c); }} />
              ))}
              <input type="color" value={color} onMouseDown={(e) => e.stopPropagation()} onChange={(e) => { setColor(e.target.value); exec('foreColor', e.target.value); }} />
            </div>
          </div>
          <span className="e-letter__sep" />
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onEdit('align', 'left')} className={align==='left'?'is-on':''} title="Left">⇤</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onEdit('align', 'center')} className={align==='center'?'is-on':''} title="Center">⇔</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onEdit('align', 'right')} className={align==='right'?'is-on':''} title="Right">⇥</button>
          <span className="e-letter__sep" />
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('removeFormat')} title="Clear formatting">⎚</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); onClose?.(); }} title="Close toolbar">✕</button>
        </div>
      )}
      <div
        ref={ref}
        className="e-letter__body"
        style={{ fontSize: fs + 'px' }}
        contentEditable={editing}
        suppressContentEditableWarning
        onInput={onInput}
      />
    </div>
  );
}
