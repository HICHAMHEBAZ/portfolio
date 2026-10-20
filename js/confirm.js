import { PROFILE } from './data.js';
import { el, whatsappUrl } from './render.js';

// Both forms only hand a draft to the visitor's mail app. With no mail client nothing
// opens, so after submit the form gives way to this panel: the address, a Copy button
// and a way back. Shown inside the form's own .path slab.

// clipboard API first; a hidden textarea + execCommand for pages where it is blocked
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const tmp = el('textarea', { readonly: '', 'aria-hidden': 'true', style: 'position:fixed;opacity:0;top:0' });
    tmp.value = text;
    document.body.append(tmp);
    tmp.select();
    const ok = document.execCommand?.('copy') ?? false;
    tmp.remove();
    return ok;
  }
}

function copyButton(label, getText, field) {
  const btn = el('button', { class: 'btn btn--ghost btn--sm', type: 'button' }, [label]);
  btn.addEventListener('click', async () => {
    const ok = await copyText(getText());
    // blocked: leave the address selected so Ctrl+C or a long press still works
    if (!ok) { field.focus(); field.select(); }
    btn.textContent = ok ? 'Copied' : 'Copy blocked, select it above';
    setTimeout(() => { btn.textContent = label; }, 2200);
  });
  return btn;
}

// host: the .path slab that holds the form; opts: title, plus subject and body of the email just opened
export function showSent(host, { title, subject, body, onEdit }) {
  host.querySelector('.sent')?.remove();
  const address = el('input', { class: 'sent__address', value: PROFILE.email, readonly: '', 'aria-label': 'Email address', size: String(PROFILE.email.length) });
  const edit = el('button', { class: 'sent__edit', type: 'button' }, ['Edit and send again']);
  const actions = el('div', { class: 'sent__actions' }, [copyButton('Copy address', () => PROFILE.email, address)]);
  if (body) actions.append(copyButton('Copy my message', () => `Subject: ${subject}\n\n${body}`, address));
  if (/^\d{8,15}$/.test(PROFILE.whatsapp || '')) {
    actions.append(el('a', { class: 'btn btn--wa btn--sm', href: whatsappUrl(), target: '_blank', rel: 'noopener' }, ['Use WhatsApp instead']));
  }

  const heading = el('h3', { class: 'sent__title', tabindex: '-1', text: title });
  const panel = el('div', { class: 'sent', role: 'status' }, [
    el('p', { class: 'path__kicker', text: 'Almost there' }),
    heading,
    el('p', { class: 'sent__text', text: 'Your mail app should open with the message ready. Nothing opened? Send it from any mail account to:' }),
    address,
    actions,
    edit,
  ]);

  edit.addEventListener('click', () => {
    panel.remove();
    host.classList.remove('is-sent');
    onEdit?.();
  });
  host.append(panel);
  host.classList.add('is-sent');
  heading.focus({ preventScroll: true });
}
