// Generates a production-ready HTML email from block data
import { ROCHE_LOGO_BLUE_DATA_URL, ROCHE_LOGO_WHITE_DATA_URL } from './rocheLogoEmail.js';

function esc(t) {
  if (!t) return '';
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Renders an <img> tag for the Roche logo. Uses base64 PNG (works in all email clients,
// unlike inline SVG which Gmail/Outlook strip).
function rocheLogoImg(flipped = false) {
  const src = flipped ? ROCHE_LOGO_WHITE_DATA_URL : ROCHE_LOGO_BLUE_DATA_URL;
  return `<img src="${src}" alt="Roche" width="80" height="42" class="roche-logo" style="display:block;border:0;outline:none;text-decoration:none;width:80px;height:42px;" />`;
}

function blockToEmailHTML(kind, props, primary, heroBg) {
  switch (kind) {
    case 'header': {
      // If the client rasterised the live banner DOM into a PNG, just embed it
      // as a single full-width image. Scales naturally on mobile, looks
      // identical to the canvas, sidesteps every email-client CSS quirk.
      if (props._renderedImg) {
        const alt = esc(props.headline || 'Email banner');
        return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0" style="width:750px;">
          <tr><td style="padding:0;font-size:0;line-height:0;"><img src="${props._renderedImg}" width="750" alt="${alt}" style="display:block;border:0;outline:none;text-decoration:none;width:100%;max-width:750px;height:auto;" /></td></tr>
        </table>`;
      }
      // Fallback: HTML/CSS layout (used by HTML download, where we don't rasterise)
      const bg = esc(props.bgColor || '#FFF7F5');
      const fs = Number(props.fontSize) || 26;
      const headline = esc(props.headline || '');
      const flipped = !!props.flipped;
      const showLogo = props.showLogo !== false;
      const img = props.img || '';
      const imgX = props.imgX != null ? props.imgX : 50;
      const imgY = props.imgY != null ? props.imgY : 50;

      // Logo อยู่ซ้ายมุมบน + ตัวหนังสือเลื่อนขวา (เหมือน editor preview)
      const leftTd = `<td class="banner-cell banner-cell--text" width="410" bgcolor="${bg}" valign="middle" style="width:410px;height:205px;background-color:${bg};padding:24px 20px;vertical-align:middle;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
          ${showLogo ? `<td valign="top" width="100" style="width:100px;vertical-align:top;padding:0;">${rocheLogoImg(flipped)}</td>` : ''}
          <td valign="middle" style="vertical-align:middle;padding:0;">
            <p class="banner-headline" style="font-family:'Inter','Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:100;font-size:${fs}px;line-height:1.1;color:#000000;margin:0;letter-spacing:-0.01em;">${headline}</p>
          </td>
        </tr></table>
      </td>`;

      const rightTd = img
        ? `<td class="banner-cell banner-cell--img" width="340" height="205" valign="middle" bgcolor="#d8d5d0" background="${img}" style="width:340px;height:205px;background-color:#d8d5d0;background-image:url('${img}');background-position:${imgX}% ${imgY}%;background-size:cover;background-repeat:no-repeat;padding:0;font-size:0;line-height:0;">
          <!--[if gte mso 9]>
          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:340px;height:205px;">
            <v:fill type="frame" src="${img}" color="#d8d5d0" />
            <v:textbox inset="0,0,0,0">
          <![endif]-->
          <div style="width:340px;height:205px;font-size:0;line-height:0;">&nbsp;</div>
          <!--[if gte mso 9]>
            </v:textbox>
          </v:rect>
          <![endif]-->
        </td>`
        : `<td class="banner-cell banner-cell--img" width="340" bgcolor="#d8d5d0" style="width:340px;height:205px;background-color:#d8d5d0;">&nbsp;</td>`;

      return `<table role="presentation" class="banner-table" width="750" border="0" cellpadding="0" cellspacing="0" style="width:750px;">
        <tr>${flipped ? rightTd + leftTd : leftTd + rightTd}</tr>
      </table>`;
    }

    case 'hero': {
      const eyebrow = esc(props.eyebrow || '');
      const title = esc(props.title || '');
      const copy = esc(props.copy || '');
      const cta = esc(props.cta || '');
      const href = esc(props.href || '#');
      const img = props.img || '';
      const imgH = Number(props.img_h) || 300;
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0" bgcolor="${heroBg}" style="background-color:${heroBg};">
        ${img ? `<tr><td><img src="${img}" width="750" height="${imgH}" alt="" style="display:block;width:100%;height:${imgH}px;object-fit:cover;" /></td></tr>` : ''}
        <tr><td style="padding:32px;">
          ${eyebrow ? `<p style="font-family:Arial,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#706B69;font-weight:500;margin:0 0 12px;">${eyebrow}</p>` : ''}
          <h1 style="font-family:Arial,sans-serif;font-weight:300;font-size:32px;line-height:1.1;letter-spacing:-0.02em;color:#544F4F;margin:0 0 12px;">${title}</h1>
          <p style="font-family:Arial,sans-serif;font-weight:300;font-size:18px;line-height:1.55;color:#544F4F;margin:0 0 18px;">${copy}</p>
          ${cta ? `<a href="${href}" style="display:inline-block;padding:11px 22px;background-color:${primary};color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:500;">${cta}</a>` : ''}
        </td></tr>
      </table>`;
    }

    case 'text': {
      const heading = esc(props.heading || '');
      const bgColor = props.bg_color || '';
      const isDark = ['#0066CC', '#003366', '#1a1a1a', '#000000'].includes(bgColor);
      const textColor = isDark ? '#ffffff' : '#544F4F';
      const headingSize = Number(props.heading_size) || 20;
      const copySize = Number(props.copy_size) || 18;
      const paras = (props.copy || '').split(/\n\n+/).map(p =>
        `<p style="font-family:Arial,sans-serif;font-weight:300;font-size:${copySize}px;line-height:1.55;color:${textColor};margin:0 0 12px;">${esc(p)}</p>`
      ).join('');
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0"${bgColor ? ` bgcolor="${bgColor}" style="background-color:${bgColor};"` : ''}>
        <tr><td style="padding:24px 32px;">
          ${heading ? `<h2 style="font-family:Arial,sans-serif;font-weight:400;font-size:${headingSize}px;line-height:1.3;color:${textColor};margin:0 0 10px;">${heading}</h2>` : ''}
          ${paras}
        </td></tr>
      </table>`;
    }

    case 'letter': {
      const fs = Number(props.font_size) || 18;
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:24px 32px;font-family:Arial,sans-serif;font-weight:300;font-size:${fs}px;line-height:1.65;color:#544F4F;text-align:${props.align || 'left'};">
          ${props.html || ''}
        </td></tr>
      </table>`;
    }

    case 'image': {
      const img = props.img || '';
      const imgH = Number(props.img_h) || 260;
      const imgW = Number(props.img_w) || 100;
      const caption = esc(props.caption || '');
      const pxW = Math.round(750 * imgW / 100);
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        ${img ? `<tr><td align="center"><img src="${img}" width="${pxW}" height="${imgH}" alt="" style="display:block;max-width:100%;height:${imgH}px;object-fit:cover;" /></td></tr>` : ''}
        ${caption ? `<tr><td style="padding:8px 32px 18px;font-family:Arial,sans-serif;font-size:11px;color:#706B69;font-style:italic;">${caption}</td></tr>` : ''}
      </table>`;
    }

    case 'gallery': {
      // Render grid เป็นแถวๆ — pack รูปเข้าแถวเมื่อ colSpan รวมเกิน cols
      const cols = Math.max(3, Math.min(8, Number(props.cols) || 6));
      const cellSize = Math.max(40, Number(props.cellSize) || 80);
      const gap = Number(props.gap) ?? 6;
      const items = (Array.isArray(props.items) ? props.items : []).filter(it => it.src);
      const innerW = 750 - 64; // padding 32 each side
      const cellW = (innerW - gap * (cols - 1)) / cols;

      // แบ่งเป็นแถวอย่างง่าย: pack รูปต่อแถวจนเต็ม cols
      const rows = [];
      let cur = [], curCols = 0;
      for (const it of items) {
        const cs = Math.max(1, Math.min(cols, Number(it.colSpan) || 1));
        const rs = Math.max(1, Number(it.rowSpan) || 1);
        if (curCols + cs > cols) {
          if (cur.length) rows.push(cur);
          cur = []; curCols = 0;
        }
        cur.push({ src: it.src, cs, rs });
        curCols += cs;
      }
      if (cur.length) rows.push(cur);

      const rowsHtml = rows.map((row, i) => {
        const cells = row.map(({ src, cs, rs }) => {
          const w = Math.round(cellW * cs + gap * (cs - 1));
          const h = Math.round(cellSize * rs + gap * (rs - 1));
          return `<td valign="top" width="${w}" style="padding:0;width:${w}px;">
            <img src="${src}" width="${w}" height="${h}" alt="" style="display:block;width:${w}px;height:${h}px;object-fit:cover;" />
          </td>`;
        }).join(`<td width="${gap}" style="width:${gap}px;font-size:0;line-height:0;">&nbsp;</td>`);
        return `<tr>${cells}</tr>${i < rows.length - 1 ? `<tr><td colspan="99" height="${gap}" style="height:${gap}px;font-size:0;line-height:0;">&nbsp;</td></tr>` : ''}`;
      }).join('');

      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:20px 32px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">${rowsHtml}</table>
        </td></tr>
      </table>`;
    }

    case 'twocol': {
      const cells = ['a', 'b'].map(k => {
        const img = props[`${k}_img`] || '';
        const imgH = Number(props[`${k}_img_h`]) || 140;
        const title = esc(props[`${k}_title`] || '');
        const copy = esc(props[`${k}_copy`] || '');
        const cta = esc(props[`${k}_cta`] || '');
        const href = esc(props[`${k}_href`] || '#');
        return `<td class="stack-column" width="336" valign="top" style="vertical-align:top;padding:0 9px;">
          ${img ? `<img class="col-img" src="${img}" width="336" height="${imgH}" alt="" style="display:block;width:336px;height:${imgH}px;object-fit:cover;margin-bottom:10px;" />` : `<div style="width:336px;height:${imgH}px;background-color:#DBD6D1;margin-bottom:10px;">&nbsp;</div>`}
          <h3 style="font-family:Arial,sans-serif;font-weight:300;font-size:22px;line-height:1.2;color:#544F4F;margin:0 0 8px;">${title}</h3>
          <p style="font-family:Arial,sans-serif;font-weight:300;font-size:16px;line-height:1.5;color:#544F4F;margin:0 0 8px;">${copy}</p>
          ${cta ? `<a href="${href}" style="font-family:Arial,sans-serif;font-size:16px;color:${primary};text-decoration:none;">${cta}</a>` : ''}
        </td>`;
      });
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:24px 23px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>${cells.join('')}</tr></table>
        </td></tr>
      </table>`;
    }

    case 'threecol': {
      const imgH = Number(props.img_h) || 110;
      const cells = ['a', 'b', 'c'].map(k => {
        const img = props[`${k}_img`] || '';
        const title = esc(props[`${k}_title`] || '');
        const copy = esc(props[`${k}_copy`] || '');
        const cta = esc(props[`${k}_cta`] || '');
        const href = esc(props[`${k}_href`] || '#');
        return `<td class="stack-column" width="214" valign="top" style="vertical-align:top;padding:0 6px;">
          ${img ? `<img class="col-img" src="${img}" width="214" height="${imgH}" alt="" style="display:block;width:214px;height:${imgH}px;object-fit:cover;margin-bottom:8px;" />` : `<div style="width:214px;height:${imgH}px;background-color:#DBD6D1;margin-bottom:8px;">&nbsp;</div>`}
          <h3 style="font-family:Arial,sans-serif;font-weight:300;font-size:20px;line-height:1.2;color:#544F4F;margin:0 0 6px;">${title}</h3>
          <p style="font-family:Arial,sans-serif;font-weight:300;font-size:15px;line-height:1.5;color:#544F4F;margin:0 0 6px;">${copy}</p>
          ${cta ? `<a href="${href}" style="font-family:Arial,sans-serif;font-size:15px;color:${primary};text-decoration:none;">${cta}</a>` : ''}
        </td>`;
      });
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:24px 26px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>${cells.join('')}</tr></table>
        </td></tr>
      </table>`;
    }

    case 'storylist': {
      const count = Math.max(1, Math.min(6, Number(props.count) || 3));
      const defaultH = Number(props.img_h) || 160;
      const rows = [];
      for (let i = 1; i <= count; i++) {
        const k = `s${i}`;
        const img = props[`${k}_img`] || '';
        const title = esc(props[`${k}_title`] || '');
        const copy = esc(props[`${k}_copy`] || '');
        const cta = esc(props[`${k}_cta`] || '');
        const href = esc(props[`${k}_href`] || '#');
        const rowH = Number(props[`${k}_h`]) || defaultH;
        const rowWPct = Math.max(20, Math.min(100, Number(props[`${k}_w`]) || 100));
        // คอลัมน์รูปสูงสุดครึ่งหน้า (343px จาก 686 inner) — rowWPct % ของคอลัมน์ครึ่งหน้า
        const colMax = 343;
        const imgW = Math.round(colMax * rowWPct / 100);
        if (i > 1) rows.push(`<tr><td colspan="3" height="1" style="height:1px;background-color:rgba(10,16,32,0.12);padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>`);
        rows.push(`<tr>
          <td width="${colMax}" valign="top" style="vertical-align:top;padding:20px 24px 20px 0;width:${colMax}px;">
            ${img ? `<img src="${img}" width="${imgW}" height="${rowH}" alt="" style="display:block;width:${imgW}px;height:${rowH}px;object-fit:cover;" />` : `<div style="width:${imgW}px;height:${rowH}px;background-color:#DBD6D1;">&nbsp;</div>`}
          </td>
          <td valign="top" style="vertical-align:top;padding:20px 0;">
            <h3 style="font-family:Arial,sans-serif;font-weight:300;font-size:22px;line-height:1.25;color:#544F4F;margin:0 0 8px;">${title}</h3>
            <p style="font-family:Arial,sans-serif;font-weight:300;font-size:16px;line-height:1.55;color:#544F4F;margin:0 0 8px;">${copy}</p>
            ${cta ? `<a href="${href}" style="font-family:Arial,sans-serif;font-size:16px;color:${primary};text-decoration:none;">${cta}</a>` : ''}
          </td>
        </tr>`);
      }
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:20px 32px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">${rows.join('')}</table>
        </td></tr>
      </table>`;
    }

    case 'button': {
      const label = esc(props.label || 'Read more');
      const href = esc(props.href || '#');
      const align = props.align || 'center';
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td align="${align}" style="padding:16px 32px;">
          <a href="${href}" style="display:inline-block;padding:12px 26px;background-color:${primary};color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;font-weight:500;">${label}</a>
        </td></tr>
      </table>`;
    }

    case 'divider':
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 32px;"><div style="height:1px;background-color:rgba(10,16,32,0.12);font-size:0;line-height:0;">&nbsp;</div></td></tr>
      </table>`;

    case 'spacer': {
      const h = Math.max(1, Math.round(Number(props.height) || 32));
      const spacer = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0" style="width:750px;">
        <tr><td height="${h}" style="height:${h}px;line-height:${h}px;font-size:0;mso-line-height-rule:exactly;"><img src="${spacer}" width="1" height="${h}" alt="" style="display:block;border:0;outline:none;width:1px;height:${h}px;" /></td></tr>
      </table>`;
    }

    case 'notice': {
      const note = esc(props.note || '');
      const linkText = esc(props.linkText || '');
      const linkHref = esc(props.linkHref || '#');
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td align="right" style="padding:8px 32px 0;text-align:right;">
          <p class="notice-text" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-style:italic;color:#706B69;margin:0 0 6px;text-align:right;">${note}</p>
          <p class="notice-text" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${primary};margin:0;text-align:right;"><a href="${linkHref}" style="color:${primary};text-decoration:underline;">${linkText}</a></p>
        </td></tr>
      </table>`;
    }

    case 'webinar': {
      const bannerImg = props.bannerImg || '';
      const bannerH = Number(props.bannerH) || 280;
      const title = esc(props.title || '');
      const description = esc(props.description || '');
      const speakerImg = props.speakerImg || '';
      const speakerSize = Math.max(80, Math.min(400, Number(props.speakerSize) || 160));
      const speakerColW = speakerSize + 40;
      const speakerName = esc(props.speakerName || '');
      const speakerInfo = esc(props.speakerInfo || '');
      const date = esc(props.date || '');
      const time = esc(props.time || '');
      const disclaimer = esc(props.disclaimer || '');
      const ctaLabel = esc(props.ctaLabel || 'Register');
      const ctaHref = esc(props.ctaHref || '#');
      const bodyBg = esc(props.bodyBg || '#FFFFFF');
      const bodyDark = ['#0B41CD', '#0066CC', '#003366', '#1a1a1a', '#000000'].includes(bodyBg.toUpperCase());
      const textColor = bodyDark ? '#ffffff' : '#544F4F';
      const dimColor = bodyDark ? '#cfd8e8' : '#706B69';
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0" bgcolor="${bodyBg}" style="background-color:${bodyBg};">
        ${bannerImg ? `<tr><td bgcolor="#0B2154" style="background-color:#0B2154;padding:0;font-size:0;line-height:0;"><img src="${bannerImg}" width="750" height="${bannerH}" alt="" style="display:block;width:100%;max-width:750px;height:${bannerH}px;object-fit:cover;" /></td></tr>` : ''}
        <tr><td style="padding:40px 40px 0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="stack-column webinar-img-col" width="${speakerColW}" valign="top" style="vertical-align:top;padding:0 32px 0 0;">
                ${speakerImg ? `<img class="webinar-speaker-img" src="${speakerImg}" width="${speakerSize}" height="${speakerSize}" alt="${speakerName}" style="display:block;width:${speakerSize}px;height:${speakerSize}px;border-radius:${Math.round(speakerSize/2)}px;object-fit:cover;background-color:#DBD6D1;" />` : `<div style="width:${speakerSize}px;height:${speakerSize}px;border-radius:${Math.round(speakerSize/2)}px;background-color:#DBD6D1;">&nbsp;</div>`}
              </td>
              <td class="stack-column webinar-content-col" valign="top" style="vertical-align:top;">
                <h1 style="font-family:Arial,Helvetica,sans-serif;font-weight:300;font-size:32px;line-height:1.15;letter-spacing:-0.01em;color:${textColor};margin:0 0 24px;">${title}</h1>
                <p style="font-family:Arial,Helvetica,sans-serif;font-weight:400;font-size:15px;line-height:1.55;color:${textColor};margin:0 0 24px;">${description}</p>
                <h3 style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:15px;line-height:1.4;color:${textColor};margin:0 0 6px;">${speakerName}</h3>
                <p style="font-family:Arial,Helvetica,sans-serif;font-weight:400;font-size:14px;line-height:1.5;color:${textColor};margin:0 0 28px;">${speakerInfo}</p>
                <p style="font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:18px;line-height:1.3;color:${primary};margin:0 0 4px;">${date}</p>
                <p style="font-family:Arial,Helvetica,sans-serif;font-weight:400;font-size:18px;line-height:1.3;color:${primary};margin:0 0 16px;">${time}</p>
                <p style="font-family:Arial,Helvetica,sans-serif;font-weight:400;font-size:13px;line-height:1.5;color:${dimColor};margin:0 0 32px;">${disclaimer}</p>
                <table role="presentation" class="webinar-cta-table" border="0" cellpadding="0" cellspacing="0" style="margin:0;">
                  <tr><td bgcolor="${primary}" style="background-color:${primary};">
                    <a href="${ctaHref}" style="display:inline-block;padding:16px 80px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:400;color:#ffffff;text-decoration:none;background-color:${primary};">${ctaLabel}</a>
                  </td></tr>
                </table>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 0 40px;font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>`;
    }

    case 'quote': {
      const text = esc(props.text || '');
      const attrib = esc(props.attrib || '');
      const width = Number(props.width) || 100;
      const qSize = Number(props.text_size) || 28;
      const aSize = Number(props.attrib_size) || 12;
      const pxW = Math.round(686 * width / 100);
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:24px 32px;">
          <table border="0" cellpadding="0" cellspacing="0" width="${pxW}" style="margin:0 auto;">
            <tr>
              <td width="2" bgcolor="${primary}" style="background-color:${primary};">&nbsp;</td>
              <td style="padding:0 0 0 18px;">
                <p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:300;font-size:${qSize}px;line-height:1.35;color:#544F4F;margin:0 0 14px;">&ldquo;${text}&rdquo;</p>
                ${attrib ? `<p style="font-style:normal;font-family:Arial,sans-serif;font-size:${aSize}px;color:#706B69;margin:0;">&mdash; ${attrib}</p>` : ''}
              </td>
            </tr>
          </table>
        </td></tr>
      </table>`;
    }

    case 'video': {
      const thumb = props.thumb || '';
      const href = esc(props.href || '#');
      const caption = esc(props.caption || '');
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 32px;">
          <a href="${href}" style="display:block;text-decoration:none;position:relative;">
            ${thumb ? `<img src="${thumb}" width="686" alt="Video thumbnail" style="display:block;width:100%;max-width:686px;" />` : `<div style="width:686px;height:386px;background-color:#1a1a1a;">&nbsp;</div>`}
            <table border="0" cellpadding="0" cellspacing="0" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"><tr><td align="center" width="56" height="56" style="width:56px;height:56px;border-radius:50%;background-color:rgba(255,255,255,0.92);text-align:center;vertical-align:middle;">
              <span style="font-size:18px;color:${primary};margin-left:3px;">&#9654;</span>
            </td></tr></table>
          </a>
          ${caption ? `<p style="font-family:Arial,sans-serif;font-size:11px;color:#706B69;font-style:italic;margin:8px 0 0;">${caption}</p>` : ''}
        </td></tr>
      </table>`;
    }

    case 'podcast': {
      const artwork = props.artwork || '';
      const show = esc(props.show || '');
      const episode = esc(props.episode || '');
      const host = esc(props.host || '');
      const duration = esc(props.duration || '');
      const href = esc(props.href || '#');
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td style="padding:16px 32px;">
          <table border="0" cellpadding="0" cellspacing="0" width="686" bgcolor="#FFF7F5" style="border:1px solid rgba(10,16,32,0.12);background-color:#FFF7F5;">
            <tr>
              <td class="stack-column" width="140" style="padding:16px;vertical-align:top;">
                ${artwork ? `<img src="${artwork}" width="140" height="140" alt="Podcast artwork" style="display:block;width:140px;height:140px;object-fit:cover;" />` : `<div style="width:140px;height:140px;background:linear-gradient(135deg,#1a3a8a,#0b2154);">&nbsp;</div>`}
              </td>
              <td class="stack-column" style="padding:16px 16px 16px 0;vertical-align:top;">
                <p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#706B69;font-weight:600;margin:0 0 4px;">${show}</p>
                <p style="font-family:Arial,sans-serif;font-size:16px;font-weight:600;color:#544F4F;margin:0 0 4px;line-height:1.3;">${episode}</p>
                <p style="font-family:Arial,sans-serif;font-size:12px;color:#706B69;margin:0 0 16px;">${host}</p>
                <a href="${href}" style="display:inline-block;padding:8px 20px;background-color:${primary};color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;font-weight:500;">&#9654; Listen &middot; ${duration}</a>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>`;
    }

    case 'language': {
      const note = esc(props.note || '');
      const prompt = esc(props.prompt || '');
      const examples = esc(props.examples || '');
      const langs = (props.languages || '').split('|').map(s => s.trim()).filter(Boolean);
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:8px 32px 20px;text-align:center;">
          <p style="font-family:Arial,sans-serif;font-size:12px;font-style:italic;color:#706B69;margin:0 0 4px;">${note}</p>
          <p style="font-family:Arial,sans-serif;font-size:13px;color:#544F4F;margin:0 0 6px;">${prompt}</p>
          <p style="font-family:Arial,sans-serif;font-size:13px;color:#544F4F;margin:0;">
            ${examples} ${langs.map((l, i) => (i > 0 ? '<span style="margin:0 6px;color:#706B69;">/</span>' : '') + `<a href="#" style="color:${primary};text-decoration:underline;">${l}</a>`).join('')}
          </p>
        </td></tr>
      </table>`;
    }

    case 'footer': {
      const address = esc(props.address || '');
      const legal = esc(props.legal || '');
      const fbg = props.bg_color || '#f7f5f2';
      const ftc = props.text_color || '#706B69';
      return `<table role="presentation" width="750" border="0" cellpadding="0" cellspacing="0" bgcolor="${fbg}" style="background-color:${fbg};border-top:1px solid rgba(10,16,32,0.12);">
        <tr><td style="padding:24px 20px 28px;">
          <p style="font-family:Arial,sans-serif;font-size:11px;color:${ftc};line-height:1.6;margin:0 0 12px;">${address}</p>
          <div style="height:1px;background-color:rgba(10,16,32,0.12);margin:12px 0;font-size:0;line-height:0;">&nbsp;</div>
          <p style="font-family:Arial,sans-serif;font-size:10px;color:${ftc};margin:0;line-height:1.5;opacity:0.85;">${legal}</p>
        </td></tr>
      </table>`;
    }

    default:
      return '';
  }
}

function absolutizeUrls(html) {
  const origin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://rdt-email-designer.vercel.app';
  // Rewrite any root-relative URL (e.g. "/samples/sample-01.webp") used in
  // src="..." or url('...') / url("...") to absolute, so the email renders
  // outside the app where relative paths can't resolve.
  return html
    .replace(/(src=")\/(?!\/)/g, `$1${origin}/`)
    .replace(/(url\(\s*['"]?)\/(?!\/)/g, `$1${origin}/`);
}

export function generateEmailHTML(blocks, settings) {
  const primary = settings.brand?.primary || '#0B41CD';
  const heroBg = settings.brand?.heroBg || '#FFF7F5';
  const subject = settings.subject || '';
  const preheader = settings.preheader || '';

  const blockHTMLs = blocks.map(b => blockToEmailHTML(b.kind, b.props, primary, heroBg)).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>${esc(subject)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<!--[if !mso]><!-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400&display=swap" rel="stylesheet">
<!--<![endif]-->
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400&display=swap');
  body { margin: 0; padding: 0; background-color: #f5f5f2; font-family: Arial, Helvetica, sans-serif; }
  .banner-headline { font-family: 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif !important; font-weight: 100 !important; }
  table { border-collapse: collapse; }
  img { border: 0; display: block; -ms-interpolation-mode: bicubic; }
  a { color: ${primary}; }
  @media only screen and (max-width: 768px) {
    .email-container { width: 100% !important; min-width: 100% !important; }
    .stack-column { display: block !important; width: 100% !important; padding: 0 !important; margin: 0 0 16px !important; box-sizing: border-box !important; }
    img { max-width: 100% !important; height: auto !important; }
    /* Column images: full-width, fixed crop height so all images line up */
    .col-img { width: 100% !important; height: 220px !important; max-height: 220px !important; object-fit: cover !important; margin-bottom: 10px !important; }
    /* Webinar speaker photo stays circular even when its column stacks */
    .webinar-speaker-img { width: 140px !important; height: 140px !important; max-width: 140px !important; max-height: 140px !important; border-radius: 70px !important; margin: 0 auto 16px !important; }
    /* Webinar: photo + content stack and center on mobile */
    .webinar-img-col { padding: 0 0 16px !important; text-align: center !important; }
    .webinar-content-col { text-align: center !important; padding: 0 !important; }
    .webinar-cta-table { margin: 0 auto !important; }
    /* Notice: shrink to footer-size on mobile */
    .notice-text, .notice-text a { font-size: 11px !important; line-height: 1.5 !important; }
    /* Banner: stack cells vertically and scale image to width */
    .banner-table, .banner-table tr, .banner-table tbody { display: block !important; width: 100% !important; }
    .banner-cell { display: block !important; width: 100% !important; height: auto !important; box-sizing: border-box !important; }
    .banner-cell--text { padding: 20px !important; }
    .banner-cell--img { padding: 0 !important; width: 100% !important; height: 220px !important; background-size: cover !important; background-position: center center !important; }
    .banner-cell--img > div { width: 100% !important; height: 220px !important; }
    .banner-img { width: 100% !important; height: auto !important; max-height: 240px !important; object-fit: cover !important; }
    /* Roche logo: keep fixed size — never expand to 100% on mobile */
    .roche-logo { width: 80px !important; height: 42px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f2;">
<!-- Preheader text -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">${esc(preheader)}</div>

<!-- Email wrapper -->
<table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f5f2" style="background-color:#f5f5f2;">
<tr><td align="center" style="padding:20px 0;">

  <!-- Email container: 750px -->
  <table role="presentation" class="email-container" width="750" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:750px;max-width:750px;background-color:#ffffff;">
    <!-- From: ${esc(settings.fromName)} <${esc(settings.fromEmail)}> -->

${blockHTMLs}

  </table>
  <!-- /Email container -->

</td></tr>
</table>
<!-- /Email wrapper -->
</body>
</html>`;
  return absolutizeUrls(html);
}

export function downloadEmailHTML(blocks, settings, emailName) {
  const html = generateEmailHTML(blocks, settings);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (emailName || 'email').replace(/[^a-z0-9\-_]/gi, '_') + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
