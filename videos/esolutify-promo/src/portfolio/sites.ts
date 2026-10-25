import type { Capture } from "../components/Devices";

// One Instagram Story per portfolio site (PortfolioStory.tsx), posted one by
// one and saved to a Highlight. Captures: scripts/capture_sites.mjs writes
// public/sites/<slug>/{mobile,desktop}.jpg + meta.json; clipCss and sticky
// below are copied from meta.json (mobile.clipCssHeight / stickyHeader).
// Callouts are facts read off each live page.

export type Callout = { title: string; sub: string };

export type StorySite = {
  name: string;
  kind: string; // industry · city
  url: string; // shown on screen
  phone: Capture;
  // css-px scroll positions the phone stops at (hero first); one callout
  // appears at each stop after the hero
  stops: number[];
  callouts: [Callout, Callout, Callout];
};

const mobile = (
  slug: string,
  clipCss: number,
  sticky: number,
  statusBg: string,
): Capture => ({
  slug,
  device: "mobile",
  cssWidth: 390,
  clipCss,
  sticky,
  statusBg,
});

export const STORY_SITES = {
  downtowndentists: {
    name: "Downtown Dentists",
    kind: "Dental clinic · Houston",
    url: "esolutify.com/demo/downtowndentists",
    phone: mobile("downtowndentists", 6400, 0, "#1C2A33"),
    stops: [0, 900, 2020, 4330],
    callouts: [
      { title: "Fits the workday", sub: "open 7 a.m., lunch-hour visits" },
      { title: "Symptom checker", sub: "points patients to the right visit" },
      { title: "Same-day crowns", sub: "one visit, no temporary" },
    ],
  },
  pedinnails: {
    name: "Pedi n Nails",
    kind: "Nail spa · Scarborough",
    url: "esolutify.com/demo/pedinnails",
    phone: mobile("pedinnails", 6400, 0, "#FFFFFF"),
    stops: [0, 1500, 3000, 4600],
    callouts: [
      { title: "80 services, priced", sub: "no surprises at the desk" },
      { title: "Virtual nail try-on", sub: "shape, finish and colour" },
      { title: "Book for up to 6", sub: "side by side, any technician" },
    ],
  },
  samantha: {
    name: "Samantha Beauty Salon",
    kind: "Hair studio · Richmond Hill",
    url: "esolutify.com/demo/samantha",
    phone: mobile("samantha", 6400, 0, "#1A120B"),
    stops: [0, 1500, 3000, 4600],
    callouts: [
      { title: "Online booking", sub: "six weeks of free times" },
      {
        title: "Before & after slider",
        sub: "colour correction, side by side",
      },
      { title: "221 five-star reviews", sub: "right on the page" },
    ],
  },
  crown: {
    name: "Crown",
    kind: "Luxury luggage · Dubai",
    url: "esolutify.com/demo/crown",
    phone: mobile("crown", 6400, 0, "#0E0E0E"),
    stops: [0, 1500, 3000, 4600],
    callouts: [
      { title: "Monogram it in 3D", sub: "3 letters, gold or silver foil" },
      { title: "Shop in AED", sub: "free UAE delivery in 1–3 days" },
      { title: "10-year warranty", sub: "shell, wheels, handles and lock" },
    ],
  },
  rielbuild: {
    name: "Riel Build",
    kind: "Home renovation · Toronto",
    url: "esolutify.com/demo/rielbuild",
    phone: mobile("rielbuild", 6550, 64, "#2B3E4F"),
    stops: [0, 1700, 3300, 4900],
    callouts: [
      { title: "Four promises", sub: "put in writing" },
      {
        title: "4 steps, no surprises",
        sub: "talk, quote, build, walk through",
      },
      { title: "16 service areas", sub: "Toronto and the whole GTA" },
    ],
  },
  gincoaluminium: {
    name: "National Aluminium",
    kind: "Façade contractor · UAE",
    url: "esolutify.com/demo/gincoaluminium",
    phone: mobile("gincoaluminium", 8651, 0, "#172231"),
    stops: [0, 1688, 3376, 6263],
    callouts: [
      { title: "Scroll-film hero", sub: "a tower above the clouds" },
      { title: "Since 1983, in numbers", sub: "200+ projects, 600+ people" },
      { title: "Hold to build a unit", sub: "an interactive curtain wall" },
    ],
  },
  hb: {
    name: "HB Developments",
    kind: "Design-build · Toronto",
    url: "esolutify.com/demo/hb",
    phone: mobile("hb", 6400, 0, "#1E2B22"),
    stops: [0, 1500, 3000, 4600],
    callouts: [
      { title: "See your property", sub: "enter your lot, see the potential" },
      { title: "Before & after", sub: "the site vs. the architect's render" },
      { title: "Pick your finish", sub: "mid-range or luxury" },
    ],
  },
  newpc: {
    name: "Coldloop",
    kind: "Custom PC studio",
    url: "esolutify.com/demo/pc",
    phone: mobile("newpc", 6400, 64, "#0A1117"),
    stops: [0, 1400, 2900, 4600],
    callouts: [
      { title: "Scroll-film hero", sub: "the build, part by part" },
      { title: "Clear pricing tiers", sub: "gaming and workstation" },
      { title: "7-stage process", sub: "leak-tested for 24 hours" },
    ],
  },
  nhfclinics: {
    name: "N.H.F Clinics",
    kind: "Medical aesthetics · Newmarket",
    url: "nhfclinics.com",
    phone: mobile("nhfclinics", 6400, 0, "#FFFFFF"),
    stops: [0, 1500, 3000, 4600],
    callouts: [
      { title: "Live promotions", sub: "5 offers, prices shown" },
      { title: "36 treatments", sub: "in six clear groups" },
      { title: "0% financing", sub: "explained right on the page" },
    ],
  },
} satisfies Record<string, StorySite>;

export type StoryKey = keyof typeof STORY_SITES;
// posting order for the Highlight
export const STORY_ORDER: StoryKey[] = [
  "downtowndentists",
  "pedinnails",
  "samantha",
  "crown",
  "rielbuild",
  "gincoaluminium",
  "hb",
  "newpc",
  "nhfclinics",
];
