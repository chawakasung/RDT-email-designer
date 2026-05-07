import { useState, useEffect, useMemo, useCallback } from 'react';
import { newBlock, blockLabel } from './data/blocks.js';
import { BlockLibrary, RightPanel } from './components/Panels.jsx';
import { Canvas } from './components/Canvas.jsx';
import { PreviewModal } from './components/PreviewModal.jsx';
import { TestSendModal } from './components/TestSendModal.jsx';
import { TOPBAR_ICONS as I } from './components/icons.jsx';
import { downloadEmailHTML } from './utils/emailExport.js';
import { Lbl } from './components/Panels.jsx';

// สร้าง block ด้วย props ที่กำหนดเอง (ID จะ random ใหม่ทุกครั้ง)
const mkBlock = (kind, props) => {
  const b = newBlock(kind);
  b.props = { ...b.props, ...props };
  return b;
};

const FACTORY_BLOCKS = () => [
  mkBlock('header', {
    img: '', alt: 'Email banner', href: '',
    headline: 'A passion for impossible discovery',
    fontSize: 43, bgColor: '#FFF7F5',
    flipped: false, showLogo: true, imgX: 50, imgY: 50,
  }),
  mkBlock('notice', {
    note: 'For internal distribution only — sent to all Roche Diagnostics employees',
    linkText: 'Learn how to read this message in your preferred language',
    linkHref: 'https://roche.com',
  }),
  mkBlock('text', {
    heading: '',
    copy: 'Select the desired tool components from the left panel, then use drag-and-drop or move them up and down as needed',
    heading_size: 20, copy_size: 20,
    bg_color: '', bg_img: '', bg_scale: 100, bg_pos: 'center center',
  }),
  mkBlock('footer', {
    address: 'Roche Diagnostics (Thailand) Ltd. Head Office 555 RasaTower 18th-19th Floor, Phaholyothin Road, Chatuchak, Bangkok 10900 Thailand',
    legal: 'The information transmitted in this message is intended only for the person or entity to which it is addressed and may contain confidential and/or privileged material. Any review, re-transmission dissemination or other use of, or taking of any action in reliance upon, this information by persons or entities other than the intended recipient is prohibited. If you receive this message in error, please contact the sender and delete the material from any computer.',
    bg_color: '#f7f5f2',
    text_color: '#706B69',
  }),
];

const FACTORY_SETTINGS = {
  subject: 'Email template for demonstration purposes',
  preheader: 'This is a demonstration email template for internal testing',
  fromName: 'Roche Internal Comms',
  fromEmail: 'onboarding@resend.dev',
  replyTo: 'no-reply@roche.com',
  brand: { primary: '#0B41CD', heroBg: '#FFF7F5' },
};

const DEFAULT_KEY = 'roche-email-builder:default';

function loadSavedDefault() {
  try {
    const raw = localStorage.getItem(DEFAULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.blocks)) return null;
    return parsed;
  } catch { return null; }
}

function App() {
  // Lazy init — โหลด default ที่ user save ไว้ ถ้าไม่มีก็ใช้ factory
  const [blocks, setBlocks] = useState(() => {
    const saved = loadSavedDefault();
    return saved ? saved.blocks : FACTORY_BLOCKS();
  });
  const [selectedId, setSelectedId] = useState(null);
  const [settings, setSettingsState] = useState(() => {
    const saved = loadSavedDefault();
    return saved && saved.settings ? { ...FACTORY_SETTINGS, ...saved.settings } : FACTORY_SETTINGS;
  });
  const [mode, setMode] = useState('edit');
  const [toast, setToast] = useState(null);
  const [draggingKind, setDraggingKind] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [emailName, setEmailName] = useState('Q2 Town Hall — internal');
  const [lang] = useState('en');

  const onSettings = (patch) => setSettingsState(s => ({ ...s, ...patch }));

  function flash(msg) { setToast(msg); setTimeout(() => setToast(null), 2000); }

  const addBlock = useCallback((kind, atIndex) => {
    const b = newBlock(kind);
    setBlocks(bs => {
      if (atIndex == null) return [...bs, b];
      const copy = bs.slice(); copy.splice(atIndex, 0, b); return copy;
    });
    setSelectedId(b.id);
    flash((lang === 'th' ? 'เพิ่ม ' : 'Added ') + blockLabel(kind).en);
  }, [lang]);

  const deleteBlock = (id) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBlock = (id) => setBlocks(bs => {
    const i = bs.findIndex(b => b.id === id);
    if (i < 0) return bs;
    const copy = bs.slice();
    const dup = newBlock(bs[i].kind);
    dup.props = structuredClone(bs[i].props);
    copy.splice(i + 1, 0, dup);
    return copy;
  });

  const moveBlock = (id, delta) => setBlocks(bs => {
    const i = bs.findIndex(b => b.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= bs.length) return bs;
    const cp = bs.slice();
    [cp[i], cp[j]] = [cp[j], cp[i]];
    return cp;
  });

  const updateBlock = useCallback((id, key, value) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, props: { ...b.props, [key]: value } } : b));
  }, []);

  const selected = useMemo(() => blocks.find(b => b.id === selectedId), [blocks, selectedId]);

  const handleSaveAsDefault = () => {
    const tryStore = (data) => {
      const json = JSON.stringify(data);
      const sizeKB = (json.length / 1024).toFixed(0);
      localStorage.setItem(DEFAULT_KEY, json);
      return sizeKB;
    };
    try {
      const sizeKB = tryStore({ blocks, settings });
      flash((lang === 'th' ? 'บันทึกแล้ว · ' : 'Saved · ') + sizeKB + ' KB');
    } catch (e) {
      console.error('[Save default] full save failed:', e);
      // ลองอีกครั้งโดยตัด base64 image ออก (ใหญ่เกิน localStorage)
      try {
        const stripImg = (v) => typeof v === 'string' && v.startsWith('data:') ? '' : v;
        const cleanBlocks = blocks.map(b => ({
          ...b,
          props: Object.fromEntries(Object.entries(b.props).map(([k, v]) => [k, stripImg(v)]))
        }));
        const sizeKB = tryStore({ blocks: cleanBlocks, settings });
        flash((lang === 'th' ? 'บันทึก (ตัดรูป base64 ออก) · ' : 'Saved (images stripped) · ') + sizeKB + ' KB');
      } catch (e2) {
        console.error('[Save default] retry failed:', e2);
        flash(lang === 'th' ? 'บันทึกไม่ได้: ' + e2.message : 'Save failed: ' + e2.message);
      }
    }
  };

  const handleResetToDefault = () => {
    const saved = loadSavedDefault();
    if (saved) {
      setBlocks(saved.blocks);
      setSettingsState({ ...FACTORY_SETTINGS, ...(saved.settings || {}) });
      flash(lang === 'th' ? 'รีเซ็ตเป็น default ของคุณ' : 'Reset to your default');
    } else {
      setBlocks(FACTORY_BLOCKS());
      setSettingsState(FACTORY_SETTINGS);
      flash(lang === 'th' ? 'รีเซ็ตเป็นเทมเพลตเริ่มต้น' : 'Reset to factory template');
    }
    setSelectedId(null);
  };

  const handleDownload = () => {
    try {
      downloadEmailHTML(blocks, settings, emailName);
      flash(lang === 'th' ? 'ดาวน์โหลด HTML แล้ว' : 'Downloaded HTML');
    } catch (e) {
      console.error(e);
      flash('Download failed');
    }
  };

  return (
    <div className="app">
      <div className="topbar">
        <img className="topbar__logo" src="/design-system/assets/roche-logo-blue.svg" alt="Roche" />
        <div className="topbar__divider" />
        <div className="topbar__title">Email Designer<small>{lang === 'th' ? 'เครื่องมือสร้างเทมเพลตอีเมล' : lang === 'en' ? 'Internal Comms Builder' : 'เครื่องมือสร้างเทมเพลตอีเมล · Internal Comms'}</small></div>
        <div className="topbar__divider" />
        <input className="topbar__name" value={emailName} onChange={(e) => setEmailName(e.target.value)} title="Email name" />

        <div className="topbar__spacer" />

        <div className="topbar__nav">
          <button className={mode === 'edit' ? 'is-active' : ''} onClick={() => setMode('edit')}>
            <Lbl en="Edit" th="แก้ไข" lang={lang} />
          </button>
          <button onClick={() => setMode('preview-modal')}>
            <Lbl en="Preview" th="ดูตัวอย่าง" lang={lang} />
          </button>
        </div>

        <button className="btn" onClick={handleResetToDefault} title={lang === 'th' ? 'โหลด default' : 'Load saved default'}>
          {I.reset} <Lbl en="Reset" th="รีเซ็ต" lang={lang} />
        </button>
        <button className="btn" onClick={handleSaveAsDefault} title={lang === 'th' ? 'บันทึก layout ปัจจุบัน' : 'Save current layout'}>
          <Lbl en="Save" th="บันทึก" lang={lang} />
        </button>
        <button className="btn" onClick={handleDownload}>
          {I.download} HTML
        </button>
        {import.meta.env.DEV && (
          <button className="btn primary" onClick={() => setMode('test-modal')}>
            {I.send} <Lbl en="Send test" th="ส่งทดสอบ" lang={lang} />
          </button>
        )}
        <button
          className="btn"
          onClick={() => setMode('howto-modal')}
          title={lang === 'th' ? 'วิธีส่ง email' : 'How to send'}
        >
          📧 <Lbl en="How to send" th="วิธีส่ง" lang={lang} />
        </button>
      </div>

      <BlockLibrary
        lang={lang}
        onAdd={(k) => addBlock(k)}
        onDragStart={(e, k) => { setDraggingKind(k); e.dataTransfer.effectAllowed = 'copy'; }}
        onDragEnd={() => { setDraggingKind(null); setDropIndex(null); }}
      />

      <Canvas
        blocks={blocks}
        selectedId={selectedId}
        settings={settings}
        onSelect={setSelectedId}
        onDelete={deleteBlock}
        onDuplicate={duplicateBlock}
        onMove={moveBlock}
        onAddAt={(k, i) => addBlock(k, i)}
        dropIndex={dropIndex}
        setDropIndex={setDropIndex}
        draggingKind={draggingKind}
        setDraggingKind={setDraggingKind}
        draggingId={draggingId}
        setDraggingId={setDraggingId}
        lang={lang}
        onUpdateBlock={updateBlock}
      />

      <RightPanel
        lang={lang}
        selected={selected}
        onUpdate={updateBlock}
        settings={settings}
        onSettings={onSettings}
      />

      {mode === 'preview-modal' && <PreviewModal blocks={blocks} settings={settings} onClose={() => setMode('edit')} lang={lang} />}
      {mode === 'test-modal' && <TestSendModal blocks={blocks} settings={settings} onClose={() => setMode('edit')} lang={lang} />}
      {mode === 'howto-modal' && <HowToSendModal onClose={() => setMode('edit')} lang={lang} />}

      {toast && <div className="toast">{I.check}{toast}</div>}
    </div>
  );
}

function HowToSendModal({ onClose, lang }) {
  const isTh = lang === 'th';
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h3>{isTh ? 'วิธีส่ง Email Template' : 'How to send your email'}<small>{isTh ? '3 วิธีง่ายๆ' : '3 simple ways'}</small></h3>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <div className="modal__body" style={{ fontSize: 14, lineHeight: 1.6 }}>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            <li style={{ marginBottom: 18 }}>
              <strong>{isTh ? 'ผ่าน Outlook (แนะนำ)' : 'Outlook (recommended)'}</strong>
              <ol style={{ paddingLeft: 18, marginTop: 6 }}>
                <li>{isTh ? 'กดปุ่ม HTML ด้านบน → ดาวน์โหลดไฟล์' : 'Click HTML button above → downloads file'}</li>
                <li>{isTh ? 'เปิด Outlook → New Email' : 'Open Outlook → New Email'}</li>
                <li>{isTh ? 'ลากไฟล์ HTML เข้าไปในกล่องข้อความ' : 'Drag the HTML file into the message body'}</li>
                <li>{isTh ? 'ใส่ผู้รับ → Send' : 'Add recipients → Send'}</li>
              </ol>
            </li>
            <li style={{ marginBottom: 18 }}>
              <strong>{isTh ? 'ผ่าน Gmail' : 'Gmail'}</strong>
              <ol style={{ paddingLeft: 18, marginTop: 6 }}>
                <li>{isTh ? 'กด HTML → เปิดไฟล์ใน Chrome' : 'Click HTML → open the file in Chrome'}</li>
                <li>{isTh ? 'กด Cmd+A เลือกทั้งหมด → Cmd+C' : 'Cmd+A select all → Cmd+C copy'}</li>
                <li>{isTh ? 'ไปที่ Gmail → Compose → Cmd+V paste' : 'Go to Gmail → Compose → Cmd+V paste'}</li>
                <li>{isTh ? 'ใส่ subject + ผู้รับ → Send' : 'Add subject + recipients → Send'}</li>
              </ol>
            </li>
            <li>
              <strong>{isTh ? 'พรีวิวก่อนส่ง' : 'Preview before sending'}</strong>
              <p style={{ margin: '6px 0 0', color: 'var(--fg-2)' }}>
                {isTh
                  ? 'กด Preview ด้านบน หรือเปิดไฟล์ HTML ใน browser เพื่อดูผลก่อน'
                  : 'Click Preview above, or open the HTML file in a browser to verify how it looks'}
              </p>
            </li>
          </ol>
          <div style={{ marginTop: 20, padding: 12, background: 'rgba(11,65,205,.04)', borderLeft: '2px solid var(--roche-blue)', fontSize: 13, color: 'var(--fg-2)' }}>
            💡 {isTh
              ? 'ใช้ Outlook ของบริษัทส่ง — email จะดูเป็นทางการ มาจาก @roche.com ของคุณ'
              : "Sending from your company Outlook — email looks official, comes from your @roche.com"}
          </div>
        </div>
        <div className="modal__foot">
          <span style={{ flex: 1 }} />
          <button className="btn primary" onClick={onClose}>{isTh ? 'เข้าใจแล้ว' : 'Got it'}</button>
        </div>
      </div>
    </div>
  );
}

export default App;
