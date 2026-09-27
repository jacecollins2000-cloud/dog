// Fill and submit each business's own website contact form with its outreach message.
// Usage: node submit_forms.js queue.json sent_log.csv [shots_dir]
// Skips CAPTCHAs and "no solicitation" pages. Never fills hidden (honeypot) fields.
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PW_PATH || 'playwright');

const ME = {
  first: 'Jace', last: 'Collins', full: 'Jace Collins', company: 'Stand Out Studios',
  email: 'jace.standoutstudios@gmail.com', phone: process.env.MY_PHONE || '',
  street: '1000 North Green Valley Parkway', city: 'Henderson', state: 'NV', zip: '89074',
  site: 'https://stand-out-studios.pages.dev', subject: 'A free homepage mockup for you',
};
const SUCCESS = /thank|received|success|been sent|was sent|submitted|in touch|get back to you|message has been|we will contact|we'll contact/i;
const [,, queuePath, logPath, shotsDir] = process.argv;
const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8')).filter(q => q.channel === 'form');

function csvRow(vals) {
  return vals.map(v => '"' + String(v ?? '').replace(/"/g, '""') + '"').join(',') + '\n';
}
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, csvRow(['date', 'channel', 'slug', 'name', 'domain', 'to', 'result', 'detail', 'preview_url']));
}

async function valueFor(el, msg) {
  return el.evaluate((el, [ME, msg]) => {
    const style = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const visible = el.type !== 'hidden' && style.display !== 'none' && style.visibility !== 'hidden' &&
      style.opacity !== '0' && r.width > 2 && r.height > 2;
    const lab = (el.labels && el.labels[0] ? el.labels[0].innerText : '') ||
      (el.closest('label') ? el.closest('label').innerText : '');
    const d = [el.name, el.id, el.placeholder, el.getAttribute('aria-label'), lab, el.getAttribute('autocomplete')]
      .join(' ').toLowerCase();
    const required = el.required || el.getAttribute('aria-required') === 'true' || /\*/.test(lab);
    const tag = el.tagName.toLowerCase();
    const type = (el.type || '').toLowerCase();
    let v = null;
    if (!visible || /honeypot|leave.*(blank|empty)|captcha|^hp_|\bbot\b/.test(d)) return { skip: true };
    if (tag === 'textarea') v = msg;
    else if (tag === 'select') v = '__select__';
    else if (type === 'checkbox') v = (required || /agree|consent|terms|privacy|policy|accept/.test(d)) ? '__check__' : null;
    else if (type === 'radio') v = required ? '__radio__' : null;
    else if (['submit', 'button', 'file', 'image', 'reset', 'date', 'time', 'number', 'range', 'color'].includes(type)) v = null;
    else if (type === 'email' || /e-?mail/.test(d)) v = ME.email;
    else if (type === 'tel' || /phone|tel\b|mobile|cell/.test(d)) v = ME.phone || (required ? '__need_phone__' : null);
    else if (/company|business|organi[sz]ation/.test(d)) v = ME.company;
    else if (/first/.test(d)) v = ME.first;
    else if (/last|surname/.test(d)) v = ME.last;
    else if (/name/.test(d)) v = ME.full;
    else if (/subject|topic|regarding|reason/.test(d)) v = ME.subject;
    else if (/zip|postal/.test(d)) v = ME.zip;
    else if (/city/.test(d)) v = ME.city;
    else if (/state/.test(d)) v = ME.state;
    else if (/address|street/.test(d)) v = required ? ME.street : null;
    else if (/website|url|site/.test(d)) v = required ? ME.site : null;
    else if (/message|comment|question|details|how can we help|project/.test(d)) v = msg;
    else if (required) v = '__unknown_required__';
    return { v, type, tag, required };
  }, [ME, msg]);
}

async function submitOne(page, q) {
  await page.goto(q.contact_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);
  const body = (await page.innerText('body').catch(() => '')).slice(0, 200000);
  if (/solicit/i.test(body)) return ['skipped', 'no-solicitation notice'];
  if (await page.$('iframe[src*="recaptcha/api2/anchor"], iframe[src*="hcaptcha"], iframe[src*="challenges.cloudflare"], .g-recaptcha:not([data-size="invisible"])')) {
    return ['skipped', 'captcha'];
  }
  // The form with a textarea (the contact form), in the page or a same-origin frame.
  let form = null;
  for (const fr of page.frames()) {
    const forms = await fr.$$('form');
    for (const f of forms) {
      if (await f.$('textarea')) { form = f; break; }
    }
    if (form) break;
  }
  if (!form) return ['failed', 'no form with a message box'];
  const fields = await form.$$('input, textarea, select');
  const radiosDone = new Set();
  for (const el of fields) {
    const info = await valueFor(el, q.form_message);
    if (info.skip || info.v == null) continue;
    if (info.v === '__need_phone__') return ['skipped', 'phone required'];
    if (info.v === '__unknown_required__') return ['skipped', 'unknown required field'];
    try {
      if (info.v === '__select__') {
        const opts = await el.$$eval('option', os => os.map(o => ({ v: o.value, t: o.textContent.trim() })));
        const pick = opts.find(o => o.v && /other|general|question|contact|website/i.test(o.t)) ||
          (info.required ? opts.find(o => o.v) : null);
        if (pick) await el.selectOption(pick.v);
      } else if (info.v === '__check__') {
        await el.check({ force: true });
      } else if (info.v === '__radio__') {
        const name = await el.getAttribute('name');
        if (!radiosDone.has(name)) { await el.check({ force: true }); radiosDone.add(name); }
      } else {
        await el.fill(info.v);
      }
    } catch (e) { /* field not editable; move on */ }
  }
  const before = await page.innerText('body').catch(() => '');
  const btn = await form.$('button[type=submit], input[type=submit], button:not([type]), [role=button]') ||
    await form.$('button, input[type=button]');
  if (!btn) return ['failed', 'no submit button'];
  const urlBefore = page.url();
  await Promise.all([
    page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {}),
    btn.click({ timeout: 8000 }),
  ]);
  await page.waitForTimeout(4000);
  if (page.url().startsWith('chrome-error')) return ['unconfirmed', 'site errored after submit'];
  const after = await page.innerText('body').catch(() => '');
  const newText = after.replace(before, '');
  if (SUCCESS.test(newText) || (page.url() !== urlBefore && SUCCESS.test(after))) return ['sent', page.url()];
  if (/required|invalid|error|please (enter|fill|complete)/i.test(newText)) return ['failed', 'validation error'];
  return ['unconfirmed', 'submitted, no confirmation text'];
}

(async () => {
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  let sent = 0;
  for (const q of queue) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    let res;
    try { res = await submitOne(page, q); } catch (e) { res = ['failed', String(e.message).slice(0, 120)]; }
    if (shotsDir) await page.screenshot({ path: path.join(shotsDir, q.slug + '.png') }).catch(() => {});
    fs.appendFileSync(logPath, csvRow([new Date().toISOString(), 'form', q.slug, q.name, q.domain, q.contact_url, res[0], res[1], q.preview_url]));
    if (res[0] === 'sent' || res[0] === 'unconfirmed') sent++;
    console.log(res[0].padEnd(12), q.name, '|', res[1]);
    await page.close();
  }
  await browser.close();
  console.log(`done: ${sent}/${queue.length} submitted`);
})();
