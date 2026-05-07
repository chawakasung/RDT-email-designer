// Vercel serverless function — POST /api/send
// Calls Resend API with the per-recipient resolved HTML.

import { generateEmailHTML } from '../src/utils/emailExport.js';
import { resolveBlocks, resolveMerge } from '../src/utils/merge.js';

const RESEND_URL = 'https://api.resend.com/emails';

// Vercel: increase body size limit for base64 images
export const config = {
  api: {
    bodyParser: { sizeLimit: '20mb' },
  },
};

// Extract data: image URLs and convert them to inline CID attachments
// (Gmail strips data: URLs from <img>; CID attachments render in every client)
function extractInlineImages(html) {
  const attachments = [];
  const seen = new Map();
  const re = /data:image\/([a-z0-9+]+);base64,([A-Za-z0-9+/=]+)/gi;
  const newHtml = html.replace(re, (_, type, base64) => {
    const key = `${type}|${base64}`;
    let cid = seen.get(key);
    if (!cid) {
      cid = `img${attachments.length + 1}`;
      seen.set(key, cid);
      attachments.push({
        filename: `${cid}.${type === 'svg+xml' ? 'svg' : type === 'jpeg' ? 'jpg' : type}`,
        content: base64,
        content_id: cid,
      });
    }
    return `cid:${cid}`;
  });
  return { html: newHtml, attachments };
}

async function sendOne({ apiKey, from, to, subject, html, replyTo }) {
  const { html: cleanedHtml, attachments } = extractInlineImages(html);
  const body = {
    from,
    to: [to],
    subject,
    html: cleanedHtml,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(attachments.length ? { attachments } : {}),
  };
  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not set on server' });
  }

  const { blocks, settings, recipients, test } = req.body || {};
  if (!Array.isArray(blocks) || !settings || !Array.isArray(recipients)) {
    return res.status(400).json({ error: 'expected { blocks, settings, recipients }' });
  }

  const from = settings.fromName
    ? `${settings.fromName} <${settings.fromEmail}>`
    : settings.fromEmail;

  const results = [];
  for (const r of recipients) {
    const personalizedBlocks = resolveBlocks(blocks, r);
    const html = generateEmailHTML(personalizedBlocks, settings);
    const subject = resolveMerge(settings.subject, r);
    try {
      const out = await sendOne({
        apiKey,
        from,
        to: r.email,
        subject,
        html,
        replyTo: settings.replyTo,
      });
      results.push({
        email: r.email,
        ok: out.ok,
        status: out.status,
        error: out.ok ? null : (out.data?.message || `HTTP ${out.status}`),
      });
    } catch (e) {
      results.push({ email: r.email, ok: false, status: 0, error: e.message });
    }
  }

  const sent = results.filter(x => x.ok).length;
  return res.status(200).json({ sent, total: results.length, results, test: !!test });
}
