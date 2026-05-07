import { Fragment } from 'react';
import { EditableImage } from './EditableImage.jsx';
import { LetterBlock } from './LetterBlock.jsx';
import { RocheLogo } from './RocheLogo.jsx';

export { resolveMerge, resolveBlockProps } from '../utils/merge.js';

// Rendered block — what shows in the canvas + final email
export function BlockBody({ kind, props, brand, editing, onEdit, onCloseLetter }) {
  const ce = (key) => editing
    ? { contentEditable: true, suppressContentEditableWarning: true, onBlur: e => onEdit(key, e.currentTarget.innerText) }
    : {};

  switch (kind) {
    case 'header': return <HeaderBlock props={props} editing={editing} onEdit={onEdit} ce={ce} />;
    case 'hero': return (
      <div className="e-hero" style={{ background: brand.heroBg }}>
        {(props.img || editing) && <div className="e-hero__media"><EditableImage src={props.img} editing={editing} onReplace={v => onEdit('img', v)} widthPct={100} heightPx={props.img_h} onResize={(_w,h) => onEdit('img_h', h)} defaultHeight={300} allowResize={true} /></div>}
        <div className="e-hero__body">
          {props.eyebrow && <p className="e-hero__eyebrow" {...ce('eyebrow')}>{props.eyebrow}</p>}
          <h1 className="e-hero__title" {...ce('title')}>{props.title}</h1>
          <p className="e-hero__copy" {...ce('copy')}>{props.copy}</p>
          {props.cta && <a className="e-hero__btn" style={{ background: brand.primary }} {...ce('cta')}>{props.cta}</a>}
        </div>
      </div>
    );
    case 'text': {
      const hasBgImg = !!props.bg_img;
      const bgColor = props.bg_color || '';
      const isDark = hasBgImg || ['#0066CC','#003366','#1a1a1a','#000000'].includes(bgColor);
      const textColor = isDark ? '#ffffff' : 'inherit';
      const blockStyle = {
        ...(bgColor ? { backgroundColor: bgColor } : {}),
        ...(hasBgImg ? {
          backgroundImage: `url(${props.bg_img})`,
          backgroundSize: props.bg_scale ? `${props.bg_scale}%` : 'cover',
          backgroundPosition: props.bg_pos || 'center center',
          backgroundColor: bgColor || '#1a1a1a',
        } : {}),
      };
      const headingSize = Number(props.heading_size) || 20;
      const copySize = Number(props.copy_size) || 18;
      return (
        <div className="e-text" style={blockStyle}>
          {hasBgImg && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', pointerEvents:'none' }} />}
          <div style={{ position:'relative', color: textColor }}>
            {props.heading && <h2 style={{ color: textColor, fontSize: headingSize + 'px' }} {...ce('heading')}>{props.heading}</h2>}
            {editing ? (
              <div
                {...ce('copy')}
                style={{ color: textColor, fontSize: copySize + 'px', fontWeight: 300, whiteSpace: 'pre-wrap', lineHeight: 1.55, fontFamily: 'var(--font-roche)' }}
              >{props.copy || ''}</div>
            ) : (
              <div>{(props.copy || '').split(/\n\n+/).map((p, i) => (
                <p key={i} style={{ color: textColor, fontSize: copySize + 'px' }}>{p}</p>
              ))}</div>
            )}
          </div>
        </div>
      );
    }
    case 'letter': return (
      <LetterBlock html={props.html} align={props.align} fontSize={props.font_size} editing={editing} onEdit={onEdit} onClose={onCloseLetter} />
    );
    case 'image': return (
      <div className="e-image">
        <EditableImage src={props.img} editing={editing} onReplace={v => onEdit('img', v)} widthPct={props.img_w} heightPx={props.img_h} onResize={(w,h) => { onEdit('img_w', w); onEdit('img_h', h); }} defaultHeight={260} />
        {props.caption && <div className="e-image__cap" {...ce('caption')}>{props.caption}</div>}
      </div>
    );
    case 'gallery': return <GalleryBlock props={props} editing={editing} onEdit={onEdit} />;
    case 'twocol': return (
      <div className="e-2col">
        {['a','b'].map(k => (
          <div className="e-col__item" key={k}>
            <EditableImage src={props[k+'_img']} editing={editing} onReplace={v => onEdit(k+'_img', v)} widthPct={100} heightPx={props[k+'_img_h']} onResize={(_w,h) => onEdit(k+'_img_h', h)} defaultHeight={140} />
            <h3 {...ce(k+'_title')}>{props[k+'_title']}</h3>
            <p {...ce(k+'_copy')}>{props[k+'_copy']}</p>
            <a style={{ color: brand.primary }} href={props[k+'_href'] || '#'} {...ce(k+'_cta')}>{props[k+'_cta']}</a>
          </div>
        ))}
      </div>
    );
    case 'threecol': return (
      <div className="e-3col">
        {['a','b','c'].map(k => (
          <div className="e-col__item" key={k}>
            <EditableImage src={props[k+'_img']} editing={editing} onReplace={v => onEdit(k+'_img', v)} widthPct={100} heightPx={props.img_h} onResize={(_w,h) => onEdit('img_h', h)} defaultHeight={110} />
            <h3 {...ce(k+'_title')}>{props[k+'_title']}</h3>
            <p {...ce(k+'_copy')}>{props[k+'_copy']}</p>
            {props[k+'_cta'] && <a style={{ color: brand.primary }} href={props[k+'_href'] || '#'} {...ce(k+'_cta')}>{props[k+'_cta']}</a>}
          </div>
        ))}
      </div>
    );
    case 'storylist': return <StoryListBlock props={props} editing={editing} brand={brand} onEdit={onEdit} ce={ce} />;
    case 'button': return (
      <div className="e-button-wrap" style={{ textAlign: props.align || 'center' }}>
        <a className="e-button" style={{ background: brand.primary }} href={props.href} {...ce('label')}>{props.label}</a>
      </div>
    );
    case 'divider': return <div className="e-divider-wrap"><div className="e-divider" /></div>;
    case 'spacer': return <div className="e-spacer" style={{ height: (Number(props.height) || 32) + 'px' }}><span className="e-spacer__lbl">{Number(props.height) || 32}px</span></div>;
    case 'notice': return (
      <div className="e-notice" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <p className="e-notice__note" style={{ margin: '0 0 6px' }} {...ce('note')}>{props.note}</p>
        <a className="e-notice__link" style={{ color: brand.primary }} href={props.linkHref || '#'} {...ce('linkText')}>{props.linkText}</a>
      </div>
    );
    case 'webinar': {
      const speakerSize = Number(props.speakerSize) || 160;
      const onSpeakerResize = (e) => {
        if (!editing) return;
        e.preventDefault();
        e.stopPropagation();
        const startPt = e.touches ? e.touches[0] : e;
        const startX = startPt.clientX;
        const startY = startPt.clientY;
        const startSize = speakerSize;
        const move = (ev) => {
          const pt = ev.touches ? ev.touches[0] : ev;
          const dx = pt.clientX - startX;
          const dy = pt.clientY - startY;
          const delta = Math.max(dx, dy);
          const newSize = Math.max(80, Math.min(360, startSize + delta));
          onEdit('speakerSize', Math.round(newSize));
          if (ev.preventDefault) ev.preventDefault();
        };
        const up = () => {
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
          window.removeEventListener('touchmove', move);
          window.removeEventListener('touchend', up);
        };
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move, { passive: false });
        window.addEventListener('touchend', up);
      };
      const onSpeakerPick = (e) => {
        if (!editing) return;
        e.stopPropagation();
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = (ev) => {
          const f = ev.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => onEdit('speakerImg', r.result);
          r.readAsDataURL(f);
        };
        inp.click();
      };
      const bodyBg = props.bodyBg || '#FFFFFF';
      const bodyDark = ['#0B41CD', '#0066CC', '#003366', '#1a1a1a', '#000000'].includes(bodyBg);
      return (
        <div className="e-webinar" style={{ background: bodyBg, color: bodyDark ? '#ffffff' : undefined }}>
          <div className="e-webinar__banner" style={{ height: (Number(props.bannerH) || 280) + 'px' }}>
            <EditableImage src={props.bannerImg} editing={editing} onReplace={v => onEdit('bannerImg', v)} widthPct={100} heightPx={Number(props.bannerH) || 280} onResize={(_w, h) => onEdit('bannerH', h)} defaultHeight={280} allowResize={true} />
          </div>
          <div className="e-webinar__body" style={{ background: bodyBg }}>
            <div className="e-webinar__row">
              <div className="e-webinar__photo" style={{ width: speakerSize + 'px', height: speakerSize + 'px' }}>
                {props.speakerImg ? (
                  <img src={props.speakerImg} alt={props.speakerName || ''} onClick={onSpeakerPick} />
                ) : (
                  <div className="e-webinar__photo-ph" onClick={onSpeakerPick}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="9" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
                  </div>
                )}
                {editing && props.speakerImg && (
                  <button className="e-webinar__photo-replace" onClick={onSpeakerPick} onMouseDown={e => e.stopPropagation()}>⇄ Replace</button>
                )}
                {editing && (
                  <div className="e-webinar__photo-resize" onMouseDown={onSpeakerResize} onTouchStart={onSpeakerResize} title="Drag to resize">
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11 L11 2 M6 11 L11 6 M9 11 L11 9"/></svg>
                  </div>
                )}
              </div>
              <div className="e-webinar__content">
                <h1 className="e-webinar__title" {...ce('title')}>{props.title}</h1>
                <p className="e-webinar__desc" {...ce('description')}>{props.description}</p>
                <h3 className="e-webinar__speaker-name" {...ce('speakerName')}>{props.speakerName}</h3>
                <p className="e-webinar__speaker-credentials" {...ce('speakerInfo')}>{props.speakerInfo}</p>
                <div className="e-webinar__when">
                  <p className="e-webinar__date" style={{ color: brand.primary }} {...ce('date')}>{props.date}</p>
                  <p className="e-webinar__time" style={{ color: brand.primary }} {...ce('time')}>{props.time}</p>
                </div>
                <p className="e-webinar__disclaimer" {...ce('disclaimer')}>{props.disclaimer}</p>
                <div className="e-webinar__cta-wrap">
                  <a className="e-webinar__cta" style={{ background: brand.primary }} href={props.ctaHref || '#'} {...ce('ctaLabel')}>{props.ctaLabel}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    case 'quote': {
      const qSize = Number(props.text_size) || 28;
      const aSize = Number(props.attrib_size) || 12;
      return (
        <div className="e-quote">
          <div className="e-quote__inner" style={{ borderLeftColor: brand.primary, maxWidth: (props.width ?? 100) + '%', marginLeft: 'auto', marginRight: 'auto' }}>
            <p style={{ fontSize: qSize + 'px' }} {...ce('text')}>"{props.text}"</p>
            {props.attrib && <cite style={{ fontSize: aSize + 'px' }} {...ce('attrib')}>— {props.attrib}</cite>}
          </div>
        </div>
      );
    }
    case 'video': return (
      <div className="e-video">
        <div className="e-video__frame">
          <img src={props.thumb} alt="" />
          <div className="e-video__play"><div className="circ"><svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4" /></svg></div></div>
        </div>
        {props.caption && <div className="e-video__cap" {...ce('caption')}>{props.caption}</div>}
      </div>
    );
    case 'podcast': return <PodcastBlock props={props} brand={brand} ce={ce} />;
    case 'language': return <LanguageBlock props={props} brand={brand} ce={ce} />;
    case 'footer': {
      const fbg = props.bg_color || '#f7f5f2';
      const ftc = props.text_color || '#706B69';
      return (
        <div className="e-footer" style={{ background: fbg, color: ftc }}>
          <div className="e-footer__addr" style={{ color: ftc }} {...ce('address')}>{props.address}</div>
          <div className="e-footer__rule" />
          <div className="e-footer__legal" style={{ color: ftc, opacity: 0.85 }} {...ce('legal')}>{props.legal}</div>
        </div>
      );
    }
    default: return null;
  }
}

// ─── Header (Email Banner) ─────────────────────
function HeaderBlock({ props, editing, onEdit, ce }) {
  const flipped = !!props.flipped;
  const showLogo = props.showLogo !== false;
  const bg = props.bgColor || '#FFF7F5';
  const fontSize = Number(props.fontSize) || 26;
  const headline = props.headline || 'A passion for impossible discovery';
  const imgX = props.imgX != null ? props.imgX : 50;
  const imgY = props.imgY != null ? props.imgY : 50;
  const logoFill = flipped ? '#ffffff' : '#0B41CD';

  const onImgDown = (e) => {
    if (!editing || !props.img) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const startPt = e.touches ? e.touches[0] : e;
    const startX = startPt.clientX, startY = startPt.clientY;
    const startImgX = imgX, startImgY = imgY;
    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      const dx = pt.clientX - startX;
      const dy = pt.clientY - startY;
      const nx = Math.max(0, Math.min(100, startImgX - (dx / rect.width) * 100));
      const ny = Math.max(0, Math.min(100, startImgY - (dy / rect.height) * 100));
      target.style.backgroundPosition = `${nx}% ${ny}%`;
      target._nx = nx; target._ny = ny;
      if (ev.preventDefault) ev.preventDefault();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
      if (target._nx != null) {
        onEdit('imgX', target._nx);
        onEdit('imgY', target._ny);
      }
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  const onPickBanner = (e) => {
    e.stopPropagation();
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = (ev) => {
      const f = ev.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => onEdit('img', r.result);
      r.readAsDataURL(f);
    };
    inp.click();
  };

  const leftPanel = (
    <div className="e-banner__left" style={{ background: bg }}>
      <div
        className="e-banner__text"
        style={{ fontSize: fontSize + 'px', marginLeft: showLogo ? 100 : 0 }}
        {...ce('headline')}
      >{headline}</div>
    </div>
  );

  const rightPanel = (
    <div
      className={'e-banner__right' + (props.img ? '' : ' is-empty')}
      style={props.img ? {
        backgroundImage: `url(${props.img})`,
        backgroundPosition: `${imgX}% ${imgY}%`,
      } : null}
      onMouseDown={onImgDown}
      onTouchStart={onImgDown}
      onClick={!props.img && editing ? onPickBanner : undefined}
    >
      {!props.img && (
        <div className="e-banner__ph">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="1"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <span>Click to add image</span>
        </div>
      )}
      {props.img && editing && (
        <>
          <button className="e-banner__replace" onClick={onPickBanner} onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>⇄ Replace</button>
          <div className="e-banner__drag-hint">⤧ Drag to reposition</div>
        </>
      )}
    </div>
  );

  return (
    <div className="e-banner e-banner--split">
      <div className="e-banner__scaler" ref={el => {
        if (!el || el._observed) return;
        el._observed = true;
        const apply = () => {
          const w = el.clientWidth;
          if (!w) return;
          const scale = w / 750;
          const wrap = el.firstChild;
          if (wrap) {
            wrap.style.transform = `scale(${scale})`;
            wrap.style.transformOrigin = 'top left';
          }
          el.style.height = (205 * scale) + 'px';
        };
        apply();
        const ro = new ResizeObserver(apply);
        ro.observe(el);
      }}>
        <div className="e-banner__wrap">
          {showLogo && (
            <div className="e-banner__logo"><RocheLogo fill={logoFill} /></div>
          )}
          {flipped ? rightPanel : leftPanel}
          {flipped ? leftPanel : rightPanel}
        </div>
      </div>
    </div>
  );
}

// ─── Image Gallery (responsive grid + drag-resize) ─────────────────────
function GalleryBlock({ props, editing, onEdit }) {
  const cols = Math.max(3, Math.min(8, Number(props.cols) || 6));
  const cellSize = Math.max(40, Number(props.cellSize) || 80);
  const gap = Number(props.gap) ?? 6;
  const items = Array.isArray(props.items) ? props.items : [];

  const updateItems = (next) => onEdit('items', next);
  const updateItem = (id, patch) => updateItems(items.map(it => it.id === id ? { ...it, ...patch } : it));
  const removeItem = (id) => updateItems(items.filter(it => it.id !== id));
  const addItem = () => updateItems([...items, {
    id: 'g' + Math.random().toString(36).slice(2, 7),
    src: '', colSpan: 1, rowSpan: 1,
  }]);

  const onPickImage = (id) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = (ev) => {
      const f = ev.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => updateItem(id, { src: r.result });
      r.readAsDataURL(f);
    };
    inp.click();
  };

  const onResizeStart = (e, id, item) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    const startPt = e.touches ? e.touches[0] : e;
    const startX = startPt.clientX, startY = startPt.clientY;
    const startCol = item.colSpan, startRow = item.rowSpan;
    const step = cellSize + gap;
    const move = (ev) => {
      const pt = ev.touches ? ev.touches[0] : ev;
      const dx = pt.clientX - startX;
      const dy = pt.clientY - startY;
      const nc = Math.max(1, Math.min(cols, startCol + Math.round(dx / step)));
      const nr = Math.max(1, Math.min(8, startRow + Math.round(dy / step)));
      updateItem(id, { colSpan: nc, rowSpan: nr });
      if (ev.preventDefault) ev.preventDefault();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
  };

  // hidden จนกว่าจะมีรูป — preview mode ไม่แสดง slot ว่าง
  const visibleItems = editing ? items : items.filter(it => it.src);

  return (
    <div className="e-gallery2" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridAutoRows: cellSize + 'px',
      gap: gap + 'px',
      padding: '20px 32px',
    }}>
      {visibleItems.map(it => {
        const cs = Math.max(1, Math.min(cols, Number(it.colSpan) || 1));
        const rs = Math.max(1, Number(it.rowSpan) || 1);
        return (
          <div
            key={it.id}
            style={{
              gridColumn: `span ${cs}`,
              gridRow: `span ${rs}`,
              position: 'relative',
              background: it.src ? 'transparent' : '#f0ebe2',
              border: it.src ? 'none' : '1px dashed rgba(10,16,32,0.18)',
              cursor: editing && !it.src ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
            onClick={() => editing && !it.src && onPickImage(it.id)}
          >
            {it.src ? (
              <img
                src={it.src} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : editing ? (
              <div style={{
                width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'var(--fg-3)', fontSize: 11, gap: 4
              }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="3" width="18" height="18" rx="1"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            ) : null}

            {editing && it.src && (
              <button
                onClick={(e) => { e.stopPropagation(); onPickImage(it.id); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,.55)', color: '#fff',
                  border: 0, padding: '4px 8px', fontSize: 10, cursor: 'pointer', borderRadius: 3,
                }}
              >⇄</button>
            )}

            {editing && (
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(it.id); }}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 6, left: 6,
                  background: 'rgba(180,0,0,.7)', color: '#fff',
                  border: 0, width: 22, height: 22, fontSize: 14, cursor: 'pointer', borderRadius: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Delete"
              >×</button>
            )}

            {editing && (
              <div
                onMouseDown={(e) => onResizeStart(e, it.id, { colSpan: cs, rowSpan: rs })}
                onTouchStart={(e) => onResizeStart(e, it.id, { colSpan: cs, rowSpan: rs })}
                style={{
                  position: 'absolute', right: 0, bottom: 0,
                  width: 18, height: 18, background: 'var(--roche-blue)', color: '#fff',
                  cursor: 'nwse-resize', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10,
                }}
                title="Drag to resize"
              >⌟</div>
            )}
          </div>
        );
      })}

      {editing && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); addItem(); }}
          style={{
            gridColumn: 'span 1', gridRow: 'span 1',
            border: '1.5px dashed var(--roche-blue)', background: 'rgba(11,65,205,0.04)',
            color: 'var(--roche-blue)', cursor: 'pointer', fontSize: 22, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Add image"
        >+</button>
      )}
    </div>
  );
}

function StoryListBlock({ props, editing, brand, onEdit, ce }) {
  const count = Math.max(1, Math.min(6, Number(props.count) || 3));
  const defaultH = Number(props.img_h) || 160;
  const addRow = () => {
    const n = count + 1;
    if (n > 6) return;
    const k = 's' + n;
    onEdit('count', n);
    if (!props[k + '_title']) {
      onEdit(k + '_title', 'New story');
      onEdit(k + '_copy', 'Description here.');
      onEdit(k + '_cta', 'Read more →');
      onEdit(k + '_href', 'https://roche.com');
    }
  };
  const removeRow = () => { if (count > 1) onEdit('count', count - 1); };

  const rows = [];
  for (let i = 1; i <= count; i++) {
    const k = 's' + i;
    const rowH = Number(props[k + '_h']) || defaultH;
    rows.push(
      <Fragment key={i}>
        <div className="e-storylist__row">
          <EditableImage
            src={props[k + '_img']} editing={editing}
            onReplace={(v) => onEdit(k + '_img', v)}
            widthPct={100} heightPx={rowH}
            onResize={(_w, h) => onEdit(k + '_h', h)}
            defaultHeight={defaultH}
            allowResize={true}
            className="e-storylist__img"
          />
          <div className="e-storylist__body">
            <h3 className="e-storylist__title" {...ce(k + '_title')}>{props[k + '_title'] || 'Story title'}</h3>
            <p className="e-storylist__copy" {...ce(k + '_copy')}>{props[k + '_copy'] || 'Description'}</p>
            <a className="e-storylist__link" href={props[k + '_href'] || '#'} style={{ color: brand.primary }}
              {...ce(k + '_cta')}>{props[k + '_cta'] || 'Read more →'}</a>
          </div>
        </div>
        {i < count && <div className="e-storylist__divider" />}
      </Fragment>
    );
  }

  return (
    <div className="e-storylist">
      {rows}
      {editing && (
        <div className="e-storylist__actions">
          <button className="e-storylist__add" onClick={(e) => { e.stopPropagation(); addRow(); }} title="Add story row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          {count > 1 && (
            <button className="e-storylist__add" style={{ borderColor: 'var(--red-light)', color: 'var(--red-dark)' }} onClick={(e) => { e.stopPropagation(); removeRow(); }} title="Remove last row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PodcastBlock({ props, brand, ce }) {
  return (
    <div className="e-podcast">
      <div className="e-podcast__card">
        <div className="e-podcast__art">
          {props.artwork ? <img src={props.artwork} alt="" /> : <div className="e-podcast__art-ph" />}
          <div className="e-podcast__art-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3"/>
              <path d="M5 11a7 7 0 0 0 14 0"/>
              <line x1="12" y1="18" x2="12" y2="21"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
        </div>
        <div className="e-podcast__body">
          <div className="e-podcast__show" {...ce('show')}>{props.show}</div>
          <div className="e-podcast__episode" {...ce('episode')}>{props.episode}</div>
          <div className="e-podcast__host" {...ce('host')}>{props.host}</div>
          <div className="e-podcast__player">
            <button className="e-podcast__play" style={{ background: brand.primary }}>
              <svg viewBox="0 0 24 24" fill="#fff"><polygon points="7 4 21 12 7 20 7 4"/></svg>
            </button>
            <div className="e-podcast__progress">
              <div className="e-podcast__bar"><div style={{ background: brand.primary }} /></div>
              <div className="e-podcast__times">
                <span>0:00</span>
                <span {...ce('duration')}>{props.duration}</span>
              </div>
            </div>
            <div className="e-podcast__waveform" aria-hidden="true">
              {Array.from({length: 28}).map((_, i) => {
                const h = 30 + Math.abs(Math.sin((i+1)*1.7)) * 70;
                return <span key={i} style={{ height: h+'%', background: i < 8 ? brand.primary : 'var(--grey-3)' }} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageBlock({ props, brand, ce }) {
  const langs = (props.languages || '').split('|').map(s => s.trim()).filter(Boolean);
  return (
    <div className="e-language">
      <div className="e-language__note" {...ce('note')}>{props.note}</div>
      <div className="e-language__prompt" {...ce('prompt')}>{props.prompt}</div>
      <div className="e-language__row">
        <span className="e-language__examples" {...ce('examples')}>{props.examples}</span>
        <span className="e-language__links">
          {langs.map((s, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="e-language__sep">/</span>}
              <a href="#" style={{ color: brand.primary }}>{s}</a>
            </Fragment>
          ))}
        </span>
      </div>
    </div>
  );
}

