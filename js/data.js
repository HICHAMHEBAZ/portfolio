// All page content lives here. Edit text and images in this file only.
export const IMG = 'assets/img/';
export const imgPath = (file) => IMG + file;
export const thumbPath = (file) => IMG + 'thumb/' + file;

const PROFILE_LINKEDIN_ACTIVITY = 'https://www.linkedin.com/in/hicham-hebaz/recent-activity/all/';

export const PROFILE = {
  name: 'Hicham Hebaz',
  email: 'hello@yourdomain.com',
  city: 'Rabat, Morocco',
  linkedin: 'https://www.linkedin.com/in/hicham-hebaz/',
  // paste the profile URLs here; footer links stay hidden while these are empty
  instagram: '',
  behance: '',
};

// Ch. 05: what I write. Each entry is one "tape" on the shelf.
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
];

export const PROCESS = [
  { step: 'Brief & research', text: 'Who buys, why, from whom else. I read the market before I open Photoshop.' },
  { step: 'Strategy', text: 'Positioning, the message, and the channels that carry it.' },
  { step: 'Concept & copy', text: 'One idea and the words for it, in the language your audience actually speaks.' },
  { step: 'Design', text: 'Posts, grids, carousels and ads, built as a system so the next one is faster.' },
  { step: 'Measure', text: 'Reach, saves, clicks. Keep what works, change what doesn\'t.' },
];

export const FAQ = [
  { q: 'Do you write the captions too?', a: 'Yes. Copy and design come together, in Darija, French or English. Most of my campaigns are written in Darija.' },
  { q: 'Can you work remotely?', a: 'Yes. I\'m based in Rabat and work with clients anywhere in Morocco and abroad.' },
  { q: 'How does a project start?', a: 'Send the form below with what you sell and what you need. I reply with questions, then a plan and a quote.' },
  { q: 'Do you only design, or plan as well?', a: 'Both. I have a master\'s in strategic marketing, so I can take a project from research to the last post.' },
];

// Ch. 05: the making-of. Two content workflows, each an editing bay: the field notes I took
// while watching the task by hand (the noise), then the pipeline that replaced it, beat by beat.
export const WORKFLOWS = [
  {
    id: 'explainer', grade: 'road', device: 'phone', slate: 'Bay 1', kind: 'Explainer video',
    counter: { label: 'Runtime', total: 60 },
    notes: ['09:40 · script, version 4', '11:15 · who owns this clip?', '13:05 · "can it feel more local?"', '15:30 · footage still missing', '17:50 · export_final_v3.mp4'],
    headline: 'A 60-second explainer, without the week of back-and-forth.', accent: 'week',
    observed: 'I followed how short explainer reels get made: a script passed between people, hours lost hunting footage and checking who owns it, then rounds of edits nobody could trace. Most of the time went into the same steps, done by hand, every time.',
    steps: [
      { title: 'Script with a spine', text: 'Every script follows the same structure: the stakes, the big question, a turn, a rehook. In Darija, in caption-sized chunks.' },
      { title: 'Shot list, beat by beat', text: 'Each line becomes a beat, and each beat is either real footage or a motion graphic, decided by written rules.' },
      { title: 'Footage with receipts', text: 'Real footage of the named place, person or document, sourced with its licence logged. No generic stock.' },
      { title: 'Looks on one board', text: 'Two or three looks per scene, all on one page. The client picks once instead of answering ten emails.' },
      { title: 'Build, check, assemble', text: 'Scenes are built in the house style, checked against a checklist, then joined into the final cut.' },
      { title: 'Final cut you can edit', text: 'Captions, speed and order can be changed per clip after the render, without starting over.' },
    ],
    agency: [
      'Your brand rules become the written rules every video follows.',
      'Your approval steps stay. They just move to one board.',
      'Every pick is logged, so the next video starts closer to your taste.',
    ],
  },
  {
    id: 'carousel', grade: 'jungle', device: 'slide', slate: 'Bay 2', kind: 'Carousel',
    counter: { label: 'Slide', total: 9 },
    notes: ['Mon · same template again', 'Tue · cover rewritten twice', 'Wed · "looks like last week"', 'Thu · typo found after export', 'Fri · "who picked this colour?"'],
    headline: 'Carousels that never look like last week\'s post.', accent: 'last',
    observed: 'I watched carousels get made from zero every time, or copied from the last one until the feed looked the same. Decisions were made for the client instead of with them, and fixes came after the export.',
    steps: [
      { title: 'Read the source', text: 'An article, a link or a script. The story is pulled out before anything is designed.' },
      { title: 'Variants, not guesses', text: 'Two or three options for each decision: format, cover headline, slide outline, colour story, caption.' },
      { title: 'One click to approve', text: 'The client approves each block on one page. Nothing is built before that.' },
      { title: 'A new colour story each post', text: 'A rotating colour queue means two posts in a row never share a palette.' },
      { title: 'Build only what was approved', text: 'Slides are built from a fixed design system, then checked frame by frame.' },
      { title: 'Ready to post', text: 'A LinkedIn-ready PDF, the caption and the hashtags. Nothing else to chase.' },
    ],
    agency: [
      'Your design system replaces mine. Same pipeline, your look.',
      'Formats match your client\'s channels and languages.',
      'Your team approves, the pipeline does the repetitive part.',
    ],
  },
];

export const WORKFLOWS_CLOSE = { text: 'Have a workflow that eats your week? Show me how it runs.', button: 'Map my workflow' };
