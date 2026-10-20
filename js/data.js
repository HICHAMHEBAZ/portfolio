// All page content lives here. Edit text and images in this file only.
export const IMG = 'assets/img/';
export const imgPath = (file) => IMG + file;
export const thumbPath = (file) => IMG + 'thumb/' + file;

const PROFILE_LINKEDIN_ACTIVITY = 'https://www.linkedin.com/in/hicham-hebaz/recent-activity/all/';

export const PROFILE = {
  name: 'Hicham Hebaz',
  email: 'hello@yourdomain.com',
  // international digits, no plus or spaces (e.g. 212600000000); the WhatsApp buttons stay hidden while empty
  whatsapp: '',
  city: 'Rabat, Morocco',
  linkedin: 'https://www.linkedin.com/in/hicham-hebaz/',
  // paste the profile URLs here; footer links stay hidden while these are empty
  instagram: '',
  behance: '',
};

// opening line of the WhatsApp chat, shown to the visitor before they send it
export const WHATSAPP_TEXT = 'Hi Hicham, I saw your portfolio and I would like to talk about a project.';

// Ch. 09: what I write. Each entry is one "tape" on the shelf.
// LinkedIn posts aren't publicly readable, so these are the subjects I write on;
// to feature a specific post, paste its link into `url` and its opening line into `hook`.
export const WRITING = [
  {
    side: 'A',
    topic: 'Language',
    title: 'Why Darija sells',
    hook: 'People buy in the language they think in. A caption in Darija is a conversation, not an announcement.',
    url: PROFILE_LINKEDIN_ACTIVITY,
  },
  {
    side: 'B',
    topic: 'Storytelling',
    title: 'One story, nine frames',
    hook: 'How a single idea can carry a whole grid, and why the profile view is a campaign of its own.',
    url: PROFILE_LINKEDIN_ACTIVITY,
  },
  {
    side: 'A',
    topic: 'Strategy',
    title: 'Research before Photoshop',
    hook: 'The brief is never the problem. The market is. Notes on reading it before designing anything.',
    url: PROFILE_LINKEDIN_ACTIVITY,
  },
  {
    side: 'B',
    topic: 'Media',
    title: 'Who decides what we read?',
    hook: 'Media literacy, attention, and the questions brands should be asking about their own content.',
    url: PROFILE_LINKEDIN_ACTIVITY,
  },
];

// Ch. 02: the one post that comes into focus when the feed goes quiet
export const NOISE_SIGNAL = 'tafilalt-pride.webp';

export const PROJECTS = [
  {
    id: 'tafilalt',
    challenge: 'Make young Moroccans see a region they scroll past as a place worth the trip.',
    idea: 'Nine posts that work twice: one by one as a story, together as a single picture on the profile.',
    title: 'Tafilalt',
    tag: 'Tourism campaign',
    year: '2025',
    cover: 'tafilalt-ksar.webp',
    blurb: 'Nine Instagram posts that read as one picture: oases, mud-brick ksour, the people of the region. Written in Darija, cut like a paper collage, with a red sun repeating across the grid.',
    role: ['Concept', 'Darija copy', 'Art direction', 'Grid design'],
    gallery: ['tafilalt-caravan.webp', 'tafilalt-oasis-eyes.webp', 'tafilalt-pride.webp', 'tafilalt-mountains.webp',
      'tafilalt-oasis.webp', 'tafilalt-ksar.webp', 'tafilalt-people.webp', 'tafilalt-heritage.webp', 'tafilalt-dunes.webp'],
  },
  {
    id: 'okla',
    challenge: 'A new restaurant with no audience, opening into a crowded food scene.',
    idea: 'Look established from day one: one green-and-cream system, menu heroes, and an offer people screenshot.',
    title: 'Okla Bio',
    tag: 'Restaurant social media',
    year: '2024',
    cover: 'okla-healthy.webp',
    blurb: 'Launch content for a healthy-food restaurant: a brand intro, menu hero shots, a 36% discount offer and delivery posts, all in one deep-green system.',
    role: ['Content plan', 'Post design', 'Offer copy'],
    gallery: ['okla-welcome.webp', 'okla-healthy.webp', 'okla-beffy.webp', 'okla-poulet.webp', 'okla-delivery.webp', 'okla-why.webp'],
  },
  {
    id: 'wa3i',
    challenge: 'Talk about media manipulation without lecturing anyone.',
    idea: 'Ask the questions in Darija and let the collage make the argument.',
    title: 'Wa3i Media',
    tag: 'Media literacy series',
    year: '2025',
    cover: 'wa3i-01.webp',
    blurb: 'A Darija carousel asking who decides what we read. Red-and-black collage, old TVs and crumpled newspapers to make the point before the caption does.',
    role: ['Script', 'Collage design', 'Arabic typography'],
    gallery: ['wa3i-01.webp', 'wa3i-02.webp', 'wa3i-03.webp'],
  },
  {
    id: 'mrnk',
    title: 'MRNK',
    tag: 'Performance ad',
    year: '2024',
    cover: 'mrnk.webp',
    blurb: 'Ad for a growth service: reach the most customers for less. Arabic headline, phone mockup and arrows pointing one way.',
    role: ['Ad copy', 'Layout'],
    gallery: ['mrnk.webp'],
  },
  {
    id: 'on',
    title: 'Gold Standard',
    tag: 'Product visual',
    year: '2024',
    cover: 'on-whey.webp',
    blurb: 'Supplement composite: two hands reaching for the tub through a lit doorway.',
    role: ['Photo compositing'],
    gallery: ['on-whey.webp'],
  },
  {
    id: 'gaap',
    title: 'UK GAAP Hiring',
    tag: 'Recruitment ad',
    year: '2024',
    cover: 'uk-gaap.webp',
    blurb: 'Hiring post for UK GAAP accountants in Casablanca. Grid paper, sticker headline, one apply button.',
    role: ['Layout', 'Headline'],
    gallery: ['uk-gaap.webp'],
  },
  {
    id: 'dactylo',
    title: 'Dactylo',
    tag: 'Agency banner',
    year: '2025',
    cover: 'dactylo.webp',
    blurb: 'Cover banner for a creative agency: a typewriter on one side, a phone on the other.',
    role: ['Banner design', 'Copy'],
    gallery: ['dactylo.webp'],
  },
];

export const SERVICES = [
  {
    num: '01',
    title: 'Social media content',
    text: 'Monthly posts and carousels for Instagram, Facebook and TikTok, planned around your offers.',
    deliverables: ['Content calendar', 'Designed posts & carousels', 'Captions in Darija, French or English'],
    fit: 'Restaurants, shops, local brands',
  },
  {
    num: '02',
    title: 'Campaign creative',
    text: 'One idea, worked into a series: a launch, a season, a region, a cause.',
    deliverables: ['Concept & key visual', 'Instagram grid or carousel series', 'Ad variations'],
    fit: 'Tourism, events, NGOs',
  },
  {
    num: '03',
    title: 'Marketing strategy',
    text: 'Market research, positioning and a plan that says which channel does what.',
    deliverables: ['Market & competitor study', 'Positioning & personas', 'Channel plan with KPIs'],
    fit: 'New brands, relaunches',
  },
  {
    num: '04',
    title: 'Ads that convert',
    text: 'Paid social creative with one offer, one message and one clear action.',
    deliverables: ['Offer & hook copy', 'Static ad sets', 'A/B variants'],
    fit: 'E-commerce, services, recruitment',
  },
  {
    num: '05',
    title: 'Content pipelines',
    text: 'I sit with your team while they make a format, then build the pipeline that makes it: script, board, approval, export.',
    deliverables: ['Workflow map with timings', 'Pipeline set to your brand rules', 'Handover to your team'],
    fit: 'Agencies, media teams, in-house studios',
  },
];

export const PROCESS = [
  { step: 'Brief & research', text: 'Who buys, why, from whom else. I read the market before I open Photoshop.' },
  { step: 'Strategy', text: 'Positioning, the message, and the channels that carry it.' },
  { step: 'Concept & copy', text: 'One idea and the words for it, in the language your audience actually speaks.' },
  { step: 'Design', text: 'Posts, grids, carousels and ads, built as a system so the next one is faster.' },
  { step: 'Measure', text: 'Reach, saves, clicks. Keep what works, change what doesn\'t.' },
];

export const FAQ = [
  { q: 'What does a project cost?', a: 'It depends on how many posts, which channels and how much strategy. Every quote is written and fixed before work starts. Send the brief and I\'ll reply with questions first, then the quote.' },
  { q: 'How does a project start?', a: 'Send the form below with what you sell and what you need. I reply with questions, then a plan and a quote.' },
  { q: 'Do you write the captions too?', a: 'Yes. Copy and design come together, in Darija, French or English. Most of my campaigns are written in Darija.' },
  { q: 'Do you only design, or plan as well?', a: 'Both. I have a master\'s in strategic marketing, so I can take a project from research to the last post.' },
  { q: 'Can you set up a pipeline for my team?', a: 'Yes. I watch how your team makes one format, then build the pipeline around your brand rules and approval steps. The dailies above came out of two of them.' },
  { q: 'Can you work remotely?', a: 'Yes. I\'m based in Rabat and work with clients anywhere in Morocco and abroad.' },
];

// Ch. 05: the dailies. Real outputs of the two pipelines, copied from the export manifest.
// Images are relative to assets/img/ (imgPath / thumbPath); video paths are full.
export const DAILIES = {
  films: [
    {
      id: 'kouma81',
      titleAr: '«كوميرة» (20 يونيو 1981، الدار البيضاء)',
      gloss: 'The word a minister used to mock those killed in Casablanca on 20 June 1981, and the casualty figures that never agree.',
      runtime: '3:06', runtimeSec: 186, scenes: 22, language: 'Darija',
      hookAr: 'الدار البيضاء، 20 يونيو 1981. القتلى سماهم إدريس البصري: «شهداء كوميرة» بسخرية. يعني: شهداء الخبز.',
      hookEn: 'Casablanca, 20 June 1981. Idriss Basri called the dead "martyrs of komera", mockingly. Meaning: martyrs of bread.',
      sources: ['Lakome2 (2016-09-05)', 'Assahifa', 'Yabiladi', 'USFP site', 'Al Jazeera encyclopedia'],
      music: 'Infraction "Distant (Cinematic Documentary Drone style)", CC BY 3.0; Chris Zabriskie "The Dark Glow of the Mountains", CC BY 4.0',
      loop: { mp4: 'assets/video/dailies/kouma81-loop.mp4', webm: 'assets/video/dailies/kouma81-loop.webm' },
      hook: 'assets/video/dailies/kouma81-hook.mp4', hookSeconds: 20,
      poster: 'dailies/kouma81-poster.webp',
      frames: ['dailies/kouma81-f01.webp', 'dailies/kouma81-f02.webp', 'dailies/kouma81-f03.webp', 'dailies/kouma81-f04.webp', 'dailies/kouma81-f05.webp', 'dailies/kouma81-f06.webp'],
    },
    {
      id: 'personality-p1',
      titleAr: 'الشخصية فـ تلات طبقات (الجزء 1 / 2)',
      gloss: 'Personality is built in three layers rather than born, drawn from one neuroscience article (part 1 of 2).',
      runtime: '1:59', runtimeSec: 119, scenes: 14, language: 'Darija',
      hookAr: 'الشخصية كتتبنى فـ تلات طبقات، ماشي كتتولد.',
      hookEn: 'Personality is built in three layers, it is not born.',
      sources: ['"The Neuroscience of Personality", ixcarus, Substack, 2 Aug 2026'],
      music: 'MusicLFiles "Placid Ambient", CC BY 4.0',
      loop: { mp4: 'assets/video/dailies/personality-p1-loop.mp4', webm: 'assets/video/dailies/personality-p1-loop.webm' },
      hook: 'assets/video/dailies/personality-p1-hook.mp4', hookSeconds: 17.2,
      poster: 'dailies/personality-p1-poster.webp',
      frames: ['dailies/personality-p1-f01.webp', 'dailies/personality-p1-f02.webp', 'dailies/personality-p1-f03.webp', 'dailies/personality-p1-f04.webp', 'dailies/personality-p1-f05.webp', 'dailies/personality-p1-f06.webp'],
    },
    {
      id: 'personality-p2',
      titleAr: 'كيفاش كتثبت الشخصية وكيفاش كتبدل (الجزء 2 / 2)',
      gloss: 'How personality holds steady and how it can still change, from the same article (part 2 of 2).',
      runtime: '1:58', runtimeSec: 118, scenes: 14, language: 'Darija',
      hookAr: '«أنا كسول» عند المخ توقع، ماشي وصف.',
      hookEn: '"I am lazy" is a prediction to the brain, not a description.',
      sources: ['"The Neuroscience of Personality", ixcarus, Substack, 2 Aug 2026'],
      music: 'MusicLFiles "Painful Path to the Light", CC BY 4.0',
      loop: { mp4: 'assets/video/dailies/personality-p2-loop.mp4', webm: 'assets/video/dailies/personality-p2-loop.webm' },
      hook: 'assets/video/dailies/personality-p2-hook.mp4', hookSeconds: 20,
      poster: 'dailies/personality-p2-poster.webp',
      frames: ['dailies/personality-p2-f01.webp', 'dailies/personality-p2-f02.webp', 'dailies/personality-p2-f03.webp', 'dailies/personality-p2-f04.webp', 'dailies/personality-p2-f05.webp', 'dailies/personality-p2-f06.webp'],
    },
  ],
  // wash: the reel's main colour, for its chip on the contact sheet
  carousels: [
    {
      id: 'media-trained', reel: 'R1', reelName: 'Amber Reel', wash: '#fdc82f',
      titleAr: 'واش باقي الميديا ترينينغ؟',
      gloss: 'Is media training still worth it? The audience can now smell a script from far away.',
      firstCaptionLine: 'واش باقي شي حد بغا يبان «media trained»؟ 🎙️',
      gallery: ['dailies/media-trained-01.webp', 'dailies/media-trained-02.webp', 'dailies/media-trained-03.webp', 'dailies/media-trained-04.webp', 'dailies/media-trained-05.webp', 'dailies/media-trained-06.webp', 'dailies/media-trained-07.webp', 'dailies/media-trained-08.webp', 'dailies/media-trained-09.webp'],
    },
    {
      id: 'story-ip', reel: 'R2', reelName: 'Road Reel', wash: '#1ca9e4',
      titleAr: 'شكون مول الفكرة؟',
      gloss: 'Who owns the idea? AI learns from your work, so who pays you for it?',
      firstCaptionLine: 'الذكاء الاصطناعي كيتعلّم من خدمتك… وشكون اللي كيخلّصك؟ 🤔',
      gallery: ['dailies/story-ip-01.webp', 'dailies/story-ip-02.webp', 'dailies/story-ip-03.webp', 'dailies/story-ip-04.webp', 'dailies/story-ip-05.webp', 'dailies/story-ip-06.webp', 'dailies/story-ip-07.webp', 'dailies/story-ip-08.webp', 'dailies/story-ip-09.webp'],
    },
    {
      id: 'nobel-2026', reel: 'R3', reelName: 'Night Green', wash: '#8bdc58',
      titleAr: 'كيف نُروّض الأزمات؟',
      gloss: 'How do we tame crises? Central banks now model household spending and saving as part of the picture.',
      firstCaptionLine: 'قرارك بالإنفاق أو الادخار صار جزءاً من نماذج البنوك المركزية.',
      gallery: ['dailies/nobel-2026-01.webp', 'dailies/nobel-2026-02.webp', 'dailies/nobel-2026-03.webp', 'dailies/nobel-2026-04.webp', 'dailies/nobel-2026-05.webp', 'dailies/nobel-2026-06.webp', 'dailies/nobel-2026-07.webp', 'dailies/nobel-2026-08.webp', 'dailies/nobel-2026-09.webp'],
    },
    {
      id: 'influencer', reel: 'R4', reelName: 'Magenta Reel', wash: '#e951c5',
      titleAr: '7 قواعد باش ما تحرقش فلوسك مع المؤثرين',
      gloss: 'Seven rules for not burning your money on influencers.',
      firstCaptionLine: 'Influencer marketing ماشي لكل براند. هادي هي الحقيقة.',
      gallery: ['dailies/influencer-01.webp', 'dailies/influencer-02.webp', 'dailies/influencer-03.webp', 'dailies/influencer-04.webp', 'dailies/influencer-05.webp', 'dailies/influencer-06.webp', 'dailies/influencer-07.webp', 'dailies/influencer-08.webp', 'dailies/influencer-09.webp'],
    },
    {
      id: 'origin-economy', reel: 'R5', reelName: 'Alarm Open', wash: '#d71b19',
      titleAr: '7 محطات غيّرت معنى كلمة «الاقتصاد»',
      gloss: 'Seven stops that changed what the word "economy" means.',
      firstCaptionLine: 'كانت كلمة «الاقتصاد» تعني شيئًا بسيطًا: إدارة البيت.',
      gallery: ['dailies/origin-economy-01.webp', 'dailies/origin-economy-02.webp', 'dailies/origin-economy-03.webp', 'dailies/origin-economy-04.webp', 'dailies/origin-economy-05.webp', 'dailies/origin-economy-06.webp', 'dailies/origin-economy-07.webp', 'dailies/origin-economy-08.webp', 'dailies/origin-economy-09.webp'],
    },
  ],
  board: {
    looks: [
      { id: 'intro-ss-a', series: 'Substack ديال اليوم', seriesKey: 'ss', title: 'Red-pen bars', image: 'dailies/board-ss-a.webp', picked: false },
      { id: 'intro-ss-b', series: 'Substack ديال اليوم', seriesKey: 'ss', title: 'Rubber stamp', image: 'dailies/board-ss-b.webp', picked: false },
      { id: 'intro-ss-c', series: 'Substack ديال اليوم', seriesKey: 'ss', title: 'Masthead', image: 'dailies/board-ss-c.webp', picked: true },
      { id: 'intro-bk-a', series: 'كتاب الأسبوع', seriesKey: 'bk', title: 'Cover opens', image: 'dailies/board-bk-a.webp', picked: false },
      { id: 'intro-bk-b', series: 'كتاب الأسبوع', seriesKey: 'bk', title: 'Gold foil', image: 'dailies/board-bk-b.webp', picked: false },
      { id: 'intro-bk-c', series: 'كتاب الأسبوع', seriesKey: 'bk', title: 'Shelf of parts', image: 'dailies/board-bk-c.webp', picked: true },
      { id: 'intro-fx-a', series: 'فهم فـ 60 ثانية', seriesKey: 'fx', title: '60-second ring', image: 'dailies/board-fx-a.webp', picked: false },
      { id: 'intro-fx-b', series: 'فهم فـ 60 ثانية', seriesKey: 'fx', title: 'Wash slabs', image: 'dailies/board-fx-b.webp', picked: false },
      { id: 'intro-fx-c', series: 'فهم فـ 60 ثانية', seriesKey: 'fx', title: 'Dictionary entry', image: 'dailies/board-fx-c.webp', picked: true },
    ],
    approval: 'dailies/approval.webp',
  },
  totals: { films: 3, runtime: '7:03', runtimeSec: 423, slides: 45, colourStories: 5 },
};

export const DAILIES_CLOSE = { text: 'Want one of these pipelines running on your brand rules? I set it up with your team.', button: 'Map my workflow' };

// each carousel also opens in the work lightbox, shaped like a project
export const DAILY_PROJECTS = DAILIES.carousels.map((c) => ({
  id: c.id, title: c.reelName, tag: `Carousel ${c.reel} · ${c.gallery.length} slides`, year: '',
  blurb: c.gloss, role: [`${c.reel} colour story`, 'Approved block by block', 'Fixed design system'], gallery: c.gallery,
}));
