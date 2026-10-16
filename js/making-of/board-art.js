// Board faces for the making-of: one flat cel illustration per pipeline step,
// drawn on a 4:5 canvas in that bay's wash (ink, one hue, cream light, one hot detail).
// Pictures load async; `ready` resolves once a face that uses one is painted.
import { thumbPath } from '../data.js';

export const FACE = { w: 512, h: 640 };
const LOOKS = [
  ['#fed66a', '#fdb52b', '#1d142c'],
  ['#fdb465', '#e951c5', '#2c072d'],
  ['#4fc8ea', '#0c57ae', '#0a1a3a'],
];
const QUEUE = ['#fdc82f', '#e951c5', '#1ca9e4', '#8bdc58', '#d71b19', '#2e2e7b', '#4657b0'];

const images = new Map();
function image(src) {
  if (!images.has(src)) {
    images.set(src, new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    }));
  }
  return images.get(src);
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
function bar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
}
function pill(ctx, text, x, y, p) {
  ctx.font = '700 17px "Bricolage Grotesque", system-ui, sans-serif';
  const w = ctx.measureText(text).width + 26;
  ctx.fillStyle = p.ink;
  rr(ctx, x, y, w, 34, 4);
  ctx.fill();
  ctx.fillStyle = p.skyMid;
  ctx.fillText(text, x + 13, y + 23);
}
function lines(ctx, x, y, w, n, color, gap = 22) {
  for (let i = 0; i < n; i++) bar(ctx, x, y + i * gap, w * [1, 0.82, 0.6][i % 3], 9, color);
}

// the wash grade on a photo: luminance through ink -> hue -> cream, like the CSS dt filters
function graded(ctx, img, x, y, w, h, p) {
  if (!img) return;
  ctx.save();
  rr(ctx, x, y, w, h, 6);
  ctx.clip();
  ctx.filter = 'grayscale(1) contrast(1.15)';
  const s = Math.max(w / img.width, h / img.height);
  ctx.drawImage(img, x + (w - img.width * s) / 2, y + (h - img.height * s) / 2, img.width * s, img.height * s);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = p.skyTop;
  ctx.fillRect(x, y, w, h);
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = p.ink;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function card(ctx, x, y, w, h, [a, b, ink], rot, label) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.strokeStyle = '#0d0820';
  ctx.lineWidth = 6;
  rr(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.font = '900 46px Fraunces, Georgia, serif';
  ctx.fillText(label, -w / 2 + 16, -h / 2 + 52);
  bar(ctx, -w / 2 + 16, -h / 2 + 76, w * 0.6, 9, ink);
  bar(ctx, -w / 2 + 16, -h / 2 + 96, w * 0.4, 9, ink);
  ctx.restore();
}

function badge(ctx, x, y, r, glyph, p) {
  ctx.fillStyle = p.hot;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.paper;
  ctx.font = `700 ${r * 1.1}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(glyph, x, y + r * 0.38);
  ctx.textAlign = 'start';
}

// ---------- Bay 1: the explainer reel ----------
const reel = {
  async script(ctx, p) {
    pill(ctx, 'SCRIPT', 40, 120, p);
    ['STAKES', 'QUESTION', 'TURN', 'REHOOK'].forEach((tag, i) => {
      const y = 190 + i * 92;
      ctx.fillStyle = p.hot;
      ctx.font = '700 18px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(tag, 40, y + 18);
      lines(ctx, 190, y + 4, 270, i % 2 ? 2 : 3, p.ink, 20);
      ctx.fillStyle = p.ink;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(40, y + 70, 432, 2);
      ctx.globalAlpha = 1;
    });
  },
  async beats(ctx, p) {
    pill(ctx, 'SHOT LIST', 40, 120, p);
    ['FOOTAGE', 'MOTION', 'FOOTAGE', 'MOTION', 'MOTION', 'FOOTAGE'].forEach((m, i) => {
      const x = 40 + (i % 2) * 222;
      const y = 190 + Math.floor(i / 2) * 120;
      const motion = m === 'MOTION';
      ctx.fillStyle = motion ? p.hot : p.ink;
      rr(ctx, x, y, 210, 96, 6);
      ctx.fill();
      ctx.fillStyle = motion ? p.ink : p.paper;
      ctx.font = '900 30px Fraunces, Georgia, serif';
      ctx.fillText(`B0${i + 1}`, x + 18, y + 42);
      ctx.font = '700 17px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(m, x + 18, y + 74);
    });
  },
  async footage(ctx, p) {
    graded(ctx, await image(thumbPath('tafilalt-ksar.webp')), 40, 110, 432, 420, p);
    ctx.strokeStyle = p.hot;
    ctx.lineWidth = 7;
    rr(ctx, 110, 220, 230, 160, 4);
    ctx.stroke();
    ctx.save();
    ctx.translate(300, 520);
    ctx.rotate(-0.06);
    ctx.fillStyle = p.paper;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 4;
    rr(ctx, 0, 0, 190, 74, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = p.ink;
    ctx.font = '700 19px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillText('SOURCE logged', 16, 30);
    ctx.fillText('LICENCE on file ✓', 16, 58);
    ctx.restore();
  },
  async looks(ctx, p) {
    pill(ctx, 'PICK ONE LOOK', 40, 120, p);
    card(ctx, 30, 220, 170, 300, LOOKS[0], -0.16, 'A');
    card(ctx, 312, 220, 170, 300, LOOKS[2], 0.16, 'C');
    card(ctx, 171, 196, 170, 300, LOOKS[1], 0, 'B');
    badge(ctx, 336, 200, 26, '★', p);
  },
  async strip(ctx, p) {
    pill(ctx, 'ASSEMBLING', 40, 120, p);
    const files = ['tafilalt-ksar', 'tafilalt-oasis', 'tafilalt-caravan', 'tafilalt-dunes', 'tafilalt-people', 'tafilalt-mountains'];
    const imgs = await Promise.all(files.map((f) => image(thumbPath(`${f}.webp`))));
    ctx.fillStyle = p.ink;
    rr(ctx, 30, 200, 452, 300, 6);
    ctx.fill();
    imgs.forEach((img, i) => graded(ctx, img, 48 + (i % 3) * 144, 222 + Math.floor(i / 3) * 140, 128, 122, p));
    for (let i = 0; i < 12; i++) bar(ctx, 44 + i * 37, 206, 18, 8, p.paper);
  },
  async final(ctx, p) {
    graded(ctx, await image(thumbPath('tafilalt-caravan.webp')), 30, 100, 452, 470, p);
    ctx.fillStyle = p.paper;
    ctx.beginPath();
    ctx.arc(256, 290, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.ink;
    ctx.beginPath();
    ctx.moveTo(240, 266);
    ctx.lineTo(240, 314);
    ctx.lineTo(280, 290);
    ctx.fill();
    ctx.fillStyle = p.ink;
    rr(ctx, 120, 400, 272, 50, 4);
    ctx.fill();
    ctx.font = '800 26px Fraunces, Georgia, serif';
    ctx.fillStyle = p.paper;
    ctx.fillText('the road', 140, 434);
    ctx.fillStyle = p.hot;
    ctx.fillText('back', 252, 434);
    ctx.fillStyle = p.paper;
    ctx.fillText('home', 314, 434);
    [90, 50, 70, 40, 80].reduce((x, w, i) => {
      bar(ctx, x, 520, w, 22, i === 0 ? p.hot : p.paper);
      return x + w + 8;
    }, 50);
  },
};

// ---------- Bay 2: the carousel ----------
const slides = {
  async source(ctx, p) {
    ctx.fillStyle = p.paper;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 6;
    rr(ctx, 50, 110, 412, 450, 6);
    ctx.fill();
    ctx.stroke();
    pill(ctx, 'SOURCE', 80, 140, p);
    bar(ctx, 80, 200, 330, 20, p.ink);
    lines(ctx, 80, 250, 340, 3, 'rgba(8,16,11,.35)');
    bar(ctx, 80, 330, 350, 18, p.hot);
    lines(ctx, 80, 380, 340, 6, 'rgba(8,16,11,.35)');
  },
  async covers(ctx, p) {
    pill(ctx, 'THREE COVERS', 40, 120, p);
    card(ctx, 26, 230, 190, 238, LOOKS[0], -0.16, '03');
    card(ctx, 296, 230, 190, 238, LOOKS[2], 0.16, '05');
    card(ctx, 161, 206, 190, 238, LOOKS[1], 0, '04');
  },
  async approve(ctx, p) {
    pill(ctx, 'APPROVED', 40, 120, p);
    ctx.globalAlpha = 0.25;
    card(ctx, 10, 330, 150, 188, LOOKS[0], -0.4, '03');
    card(ctx, 352, 330, 150, 188, LOOKS[2], 0.4, '05');
    ctx.globalAlpha = 1;
    card(ctx, 126, 190, 260, 326, LOOKS[1], 0, '04');
    badge(ctx, 256, 520, 38, '✓', p);
  },
  async colour(ctx, p) {
    QUEUE.slice(0, 4).forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(40 + i * 108, 110, 108, 380);
    });
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 110, 432, 380);
    pill(ctx, 'NEXT COLOUR STORY', 40, 516, p);
    QUEUE.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.strokeStyle = p.ink;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(64 + i * 52, 590, i === 3 ? 20 : 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  },
  async build(ctx, p) {
    const g = ctx.createLinearGradient(0, 100, 0, 580);
    g.addColorStop(0, p.horizon);
    g.addColorStop(1, p.skyMid);
    ctx.fillStyle = g;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 6;
    rr(ctx, 40, 100, 432, 480, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = p.skyTop;
    ctx.font = '900 170px Fraunces, Georgia, serif';
    ctx.fillText('03', 60, 260);
    bar(ctx, 70, 290, 250, 22, p.ink);
    bar(ctx, 70, 324, 170, 22, p.hot);
    lines(ctx, 70, 372, 180, 2, p.ink);
    ctx.fillStyle = p.ink;
    ctx.beginPath();
    ctx.ellipse(400, 590, 170, 70, 0, Math.PI, 0);
    ctx.fill();
    const mascot = await image('assets/img/mascot-cutout.webp');
    if (mascot) {
      const h = 330;
      ctx.drawImage(mascot, 300, 560 - h, h * (mascot.width / mascot.height), h);
    }
    ctx.fillStyle = p.ink;
    ctx.font = '700 16px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillText('03 / 09', 390, 132);
  },
  async ready(ctx, p) {
    [[-0.18, -40, LOOKS[0][0]], [0.12, 40, p.horizon], [0, 0, p.paper]].forEach(([rot, dx, fill]) => {
      ctx.save();
      ctx.translate(256 + dx, 300);
      ctx.rotate(rot);
      ctx.fillStyle = fill;
      ctx.strokeStyle = p.ink;
      ctx.lineWidth = 6;
      rr(ctx, -120, -150, 240, 300, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    ctx.fillStyle = p.hot;
    ctx.font = '900 64px Fraunces, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PDF', 256, 300);
    ctx.fillStyle = p.ink;
    ctx.font = '700 20px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillText('9 pages', 256, 334);
    ctx.textAlign = 'start';
    ['#marketing', '#maroc', '#contenu'].reduce((x, tag) => {
      ctx.font = '700 18px "Bricolage Grotesque", system-ui, sans-serif';
      const w = ctx.measureText(tag).width + 26;
      ctx.fillStyle = p.ink;
      rr(ctx, x, 500, w, 36, 18);
      ctx.fill();
      ctx.fillStyle = p.skyMid;
      ctx.fillText(tag, x + 13, 524);
      return x + w + 10;
    }, 60);
  },
};

export const FACES = {
  phone: [reel.script, reel.beats, reel.footage, reel.looks, reel.strip, reel.final],
  slide: [slides.source, slides.covers, slides.approve, slides.colour, slides.build, slides.ready],
};

// paints one face: the paper ground, the step number plate, then the step's art
export async function paintFace(canvas, draw, n, p) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = p.horizon;
  ctx.fillRect(0, 0, FACE.w, FACE.h);
  ctx.fillStyle = p.ink;
  ctx.font = '900 64px Fraunces, Georgia, serif';
  ctx.fillText(String(n).padStart(2, '0'), 36, 78);
  ctx.fillStyle = p.hot;
  ctx.fillRect(140, 52, 60, 8);
  await draw(ctx, p);
}
