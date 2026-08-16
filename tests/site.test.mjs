import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const projectRoot = path.resolve(import.meta.dirname, '..');
const indexHtml = readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const stylesheet = readFileSync(path.join(projectRoot, 'stylesheet.css'), 'utf8');
const siteScriptPath = path.join(projectRoot, 'scripts', 'site.js');
const siteScript = existsSync(siteScriptPath)
  ? readFileSync(siteScriptPath, 'utf8')
  : '';

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function extractSection(source, id) {
  const match = source.match(
    new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>[\\s\\S]*?<\\/section>`),
  );
  assert.ok(match, `missing section: ${id}`);
  return match[0];
}

function extractFooter(source) {
  const match = source.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/);
  assert.ok(match, 'missing footer');
  return match[0];
}

function normalizeText(source) {
  return source
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function colorChannelsOnWhite(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return [0, 2, 4].map((offset) =>
      Number.parseInt(hex[1].slice(offset, offset + 2), 16),
    );
  }

  const rgba = value.match(
    /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i,
  );
  assert.ok(rgba, `unsupported CSS color: ${value}`);
  const alpha = Number(rgba[4]);
  return rgba.slice(1, 4).map((channel) =>
    Number(channel) * alpha + 255 * (1 - alpha),
  );
}

function contrastAgainstWhite(value) {
  const linear = colorChannelsOnWhite(value).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return 1.05 / (luminance + 0.05);
}

function hasHiddenAttribute(tag) {
  return /\bhidden(?:\s*=|\s|>)/.test(tag);
}

function createFilterRadio(value, checked = false) {
  const listeners = new Map();
  return {
    value,
    checked,
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    change() {
      listeners.get('change')?.({ target: this });
    },
  };
}

function createNewsItem() {
  return { hidden: false };
}

function createNewsButton() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    hidden: true,
    textContent: 'Show more',
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    click() {
      listeners.get('click')?.();
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
  };
}

function createVideo(source = 'images/preview.mp4') {
  return {
    controls: false,
    dataset: source ? { src: source } : {},
    loadCalls: 0,
    pauseCalls: 0,
    playCalls: 0,
    paused: true,
    removeAttribute(name) {
      if (name === 'data-src') delete this.dataset.src;
    },
    load() {
      this.loadCalls += 1;
    },
    pause() {
      this.pauseCalls += 1;
      this.paused = true;
    },
    play() {
      this.playCalls += 1;
      this.paused = false;
      return Promise.resolve();
    },
  };
}

function createPaper(selected, videos = []) {
  const paper = {
    dataset: { selected: String(selected) },
    hidden: false,
    querySelectorAll(selector) {
      return selector === 'video' ? videos : [];
    },
  };

  videos.forEach((video) => {
    video.closest = (selector) => (selector === '.paper-entry' ? paper : null);
  });

  return paper;
}

test('uses the reference template header and collapsible news structure', () => {
  assert.match(indexHtml, /res\/css\/bootstrap\.min\.css/);
  assert.match(indexHtml, /class="[^"]*col-md-3[^"]*"[\s\S]*Sunghwan\.jpeg/);
  assert.match(indexHtml, /class="[^"]*col-md-9[^"]*"/);
  const newsSection = extractSection(indexHtml, 'news');
  assert.match(newsSection, /<h2 class="section-title" id="news-heading">News<\/h2>/);
  assert.doesNotMatch(newsSection, /Recent News/);
  const newsListMatch = newsSection.match(
    /<ul\b(?=[^>]*\bclass="[^"]*\bnews-list\b)[^>]*>([\s\S]*?)<\/ul>/,
  );
  assert.ok(newsListMatch, 'missing news list');
  const newsList = newsListMatch[0];
  assert.equal(countMatches(newsList, /<li\b/g), 8);
  assert.equal(countMatches(newsList, /<li\b[^>]*class="[^"]*\bnews-item\b/g), 8);
  assert.equal(countMatches(newsSection, /class="[^"]*\bnews-item\b/g), 8);
  assert.doesNotMatch(newsSection, /<li\b[^>]*\bhidden(?:\s*=|\s|>)/);
  assert.doesNotMatch(newsList, /<ul\b[^>]*\bhidden(?:\s*=|\s|>)/);
  assert.doesNotMatch(newsSection.match(/^<section[^>]*>/)[0], /\bhidden(?:\s*=|\s|>)/);

  const listEnd = newsSection.indexOf('</ul>');
  const toggleStart = newsSection.indexOf('data-news-toggle');
  assert.ok(toggleStart > listEnd, 'news toggle must follow the list');
  const toggleTag = newsSection.slice(newsSection.lastIndexOf('<button', toggleStart), newsSection.indexOf('>', toggleStart) + 1);
  assert.match(toggleTag, /\bdata-news-toggle(?:\s|=|>)/);
  assert.match(toggleTag, /\baria-expanded="false"/);
  assert.ok(hasHiddenAttribute(toggleTag));
});

test('links UC San Diego and orders biography and Research content', () => {
  assert.match(indexHtml, /<a href="https:\/\/ucsd\.edu\/">UC San Diego<\/a>/);
  const biographyStart = indexHtml.indexOf('<p>\n            Hi! My name is');
  const biographyEnd = indexHtml.indexOf('</p>', biographyStart) + '</p>'.length;
  assert.ok(biographyStart >= 0 && biographyEnd > biographyStart);
  const followingBiography = indexHtml.slice(biographyEnd, biographyEnd + 120);
  assert.match(followingBiography, /^\s*<p class="previous-experience">/);
  const previousExperienceEnd = indexHtml.indexOf('</p>', biographyEnd);
  const previousExperience = indexHtml.slice(biographyEnd, previousExperienceEnd + '</p>'.length);
  assert.match(previousExperience, /Agency for Defense Development \(ADD\)/);
  assert.match(previousExperience, /KAIST/);

  const researchSection = extractSection(indexHtml, 'papers');
  assert.match(researchSection, /^<section\b(?=[^>]*\bid="papers")(?=[^>]*\baria-labelledby="research-heading")/);
  const researchHeading = researchSection.search(/<h2\b(?=[^>]*\bid="research-heading")[^>]*>Research<\/h2>/);
  const statementMatch = researchSection.match(/<p\b(?=[^>]*\bclass="[^"]*\bresearch-statement\b)[^>]*>([\s\S]*?)<\/p>/);
  const noteStart = researchSection.search(/<p\b(?=[^>]*\bclass="[^"]*\bpapers-note\b)[^>]*>/);
  const filterStart = researchSection.search(/<fieldset\b(?=[^>]*\bclass="[^"]*\bpaper-filter\b)[^>]*>/);
  const papersListStart = researchSection.search(/<div\b(?=[^>]*\bclass="[^"]*\bpapers-list\b)[^>]*>/);
  assert.ok(researchHeading >= 0);
  assert.ok(statementMatch);
  const statementStart = statementMatch.index;
  assert.equal(
    normalizeText(statementMatch[1]),
    'My research goal is to enable mobile robots to autonomously perform complex, long-horizon tasks that require both navigation and physical interaction in large-scale, unstructured environments. To this end, I aim to develop structured representations of the physical world and leverage them for task execution and planning. In particular, I am currently exploring how 3D maps can support long-horizon reasoning in visuomotor policies. My research is centered on neural scene representations, simultaneous localization and mapping (SLAM), and robot policy learning (e.g., VLA and model-based RL).',
  );
  assert.ok(researchHeading < statementStart);
  assert.ok(statementStart < noteStart);
  assert.ok(noteStart < filterStart);
  assert.ok(filterStart < papersListStart);

  const paperTitles = [
    'SERF: Spatiotemporal Environment and Robot Feature Map for Long-Horizon Mobile Manipulation',
    'Seeing the Bigger Picture: 3D Latent Mapping for Mobile Manipulation Policy Learning',
    'MISO: Multiresolution Submap Optimization for Efficient Globally Consistent Neural Implicit Reconstruction',
    'Textual Query-Driven Mask Transformer for Domain Generalized Segmentation',
    'Texture Learning Domain Randomization for Domain Generalized Segmentation',
    'Data Gathering Trials for the Development of Military Imaging Systems',
  ];
  const paperList = researchSection.slice(papersListStart);
  assert.equal(countMatches(paperList, /<article\b[^>]*class="[^"]*\bpaper-entry\b/g), 6);
  for (const title of paperTitles) {
    assert.ok(paperList.includes(title), `missing paper title: ${title}`);
  }
  assert.doesNotMatch(researchSection, /id="papers-heading"/);
  assert.doesNotMatch(researchSection, /<h2[^>]*>Papers<\/h2>/);
});

test('uses plain email, concise Research note, and linked template credit', () => {
  assert.doesNotMatch(indexHtml, /href="mailto:suk063@ucsd\.edu"/);
  assert.match(indexHtml, /Email:\s*suk063 AT ucsd\.edu<br>/);

  const researchSection = extractSection(indexHtml, 'papers');
  const noteMatch = researchSection.match(
    /<p\b(?=[^>]*\bclass="[^"]*\bpapers-note\b)[^>]*>([\s\S]*?)<\/p>/,
  );
  assert.ok(noteMatch, 'missing paper note');
  assert.equal(normalizeText(noteMatch[1]), '* indicates equal contribution.');
  assert.doesNotMatch(researchSection, /Papers sorted by recency\./);

  const footer = extractFooter(indexHtml);
  const mapEnd = footer.indexOf('</div>');
  const creditStart = footer.indexOf('class="template-credit"');
  assert.ok(creditStart > mapEnd, 'template credit must follow the visitor map');
  assert.match(
    footer,
    /Template based on\s*<a href="https:\/\/haozhiqi\.github\.io\/">this website<\/a>/,
  );
  assert.equal(normalizeText(footer), 'Template based on this website');
});

test('preserves site metadata, favicon, domain, and visitor map', () => {
  assert.match(indexHtml, /<meta name="author" content="Sunghwan Kim">/);
  assert.match(indexHtml, /<meta name="description" content="Sunghwan Kim/);
  assert.match(indexHtml, /<meta property="og:title" content="Sunghwan Kim">/);
  assert.match(indexHtml, /href="images\/ucsd-logo-large\.png"/);
  assert.match(indexHtml, /id="clustrmaps"/);
  assert.equal(readFileSync(path.join(projectRoot, 'CNAME'), 'utf8').trim(), 'sunghwan.me');
});

test('preserves all six papers and marks exactly two as selected', () => {
  assert.equal(countMatches(indexHtml, /class="[^"]*paper-entry[^"]*"/g), 6);
  assert.equal(
    countMatches(indexHtml, /class="[^"]*paper-entry[^"]*"[^>]*data-selected="true"/g),
    2,
  );

  for (const title of [
    'SERF: Spatiotemporal Environment and Robot Feature Map for Long-Horizon Mobile Manipulation',
    'Seeing the Bigger Picture: 3D Latent Mapping for Mobile Manipulation Policy Learning',
    'MISO: Multiresolution Submap Optimization for Efficient Globally Consistent Neural Implicit Reconstruction',
    'Textual Query-Driven Mask Transformer for Domain Generalized Segmentation',
    'Texture Learning Domain Randomization for Domain Generalized Segmentation',
    'Data Gathering Trials for the Development of Military Imaging Systems',
  ]) {
    assert.ok(indexHtml.includes(title), `missing paper title: ${title}`);
  }
});

test('uses plain slash-separated paper links without icon dependencies', () => {
  const researchSection = extractSection(indexHtml, 'papers');
  const linkGroups = [
    ...researchSection.matchAll(
      /<div\b(?=[^>]*\bclass="[^"]*\bpaper-links\b)[^>]*>([\s\S]*?)<\/div>/g,
    ),
  ];

  assert.equal(linkGroups.length, 6);
  assert.deepEqual(
    linkGroups.map((match) => normalizeText(match[1])),
    [
      'Paper / Project Page / Code',
      'Paper / Project Page / Code',
      'Paper / Project Page / Code',
      'Paper / Project Page / Code',
      'Paper / Code',
      'Paper',
    ],
  );
  assert.equal(
    countMatches(
      researchSection,
      /class="paper-link-separator" aria-hidden="true">\/<\/span>/g,
    ),
    9,
  );
  assert.doesNotMatch(researchSection, /class="[^"]*\bbadge\b|<i\b|link-badges/);
  assert.doesNotMatch(indexHtml, /font-awesome/i);

  const resourceLinks = linkGroups.flatMap((match) => [
    ...match[1].matchAll(/<a\b[^>]*>/g),
  ]);
  assert.equal(resourceLinks.length, 15);
  resourceLinks.forEach(([tag]) => {
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  });
  assert.match(stylesheet, /\.paper-links\s*\{[^}]*font-size:\s*1rem;/s);
});

test('declares a left-aligned native Selected and ALL radio filter', () => {
  const researchSection = extractSection(indexHtml, 'papers');
  const noteStart = researchSection.indexOf('class="papers-note"');
  const filterStart = researchSection.indexOf('class="paper-filter"');
  const papersListStart = researchSection.indexOf('class="papers-list"');

  assert.ok(noteStart < filterStart);
  assert.ok(filterStart < papersListStart);
  assert.match(
    researchSection,
    /<fieldset\b(?=[^>]*\bclass="paper-filter")(?=[^>]*\bhidden(?:\s|>))[^>]*>/,
  );
  assert.match(
    researchSection,
    /<legend class="paper-filter-legend">Paper filter<\/legend>/,
  );
  assert.match(
    researchSection,
    /type="radio"[^>]*name="paper-filter"[^>]*value="selected"[^>]*checked/,
  );
  assert.match(
    researchSection,
    /type="radio"[^>]*name="paper-filter"[^>]*value="all"/,
  );
  assert.match(
    researchSection,
    /<label class="paper-filter-label" for="paper-filter-selected">Selected<\/label>[\s\S]*?<span class="paper-filter-separator" aria-hidden="true">\/<\/span>[\s\S]*?<label class="paper-filter-label" for="paper-filter-all">ALL<\/label>/,
  );
  assert.doesNotMatch(researchSection, /paper-filter-button|aria-pressed/);
  assert.doesNotMatch(
    researchSection,
    /class="[^"]*paper-entry[^"]*"[^>]*\shidden(?:\s|=|>)/,
  );
});

test('styles the radio labels as text with selected and focus states', () => {
  assert.match(
    stylesheet,
    /\.paper-filter\s*\{[^}]*display:\s*inline-flex;[^}]*margin:\s*0 0 1\.25rem;/s,
  );
  assert.match(
    stylesheet,
    /\.paper-filter\[hidden\]\s*\{[^}]*display:\s*none;/s,
  );
  assert.match(
    stylesheet,
    /\.paper-filter-input:checked \+ \.paper-filter-label\s*\{(?=[^}]*font-weight:\s*600;)(?=[^}]*text-decoration:\s*underline;)[^}]*\}/s,
  );
  assert.match(
    stylesheet,
    /\.paper-filter-input:focus-visible \+ \.paper-filter-label\s*\{[^}]*outline:\s*3px solid #0071bc;/s,
  );
  assert.match(
    stylesheet,
    /\.paper-filter-label\s*\{[^}]*font-size:\s*1rem;/s,
  );
  assert.doesNotMatch(stylesheet, /\.paper-filter-button/);
});

test('news toggle overrides native button appearance', () => {
  assert.match(
    stylesheet,
    /\.news-toggle\s*\{[^}]*-webkit-appearance:\s*none;[^}]*appearance:\s*none;/s,
  );
});

test('slightly enlarges the Korean name and keeps template credit secondary', () => {
  assert.match(stylesheet, /\.korean-name\s*\{[^}]*font-size:\s*0\.65em;/s);
  assert.match(
    stylesheet,
    /\.template-credit\s*\{(?=[^}]*font-size:\s*0\.75rem;)(?=[^}]*color:\s*var\(--muted-text\);)[^}]*\}/s,
  );
});

test('keeps focus and colored text while removing author-link underlines', () => {
  const focusColor = stylesheet.match(/outline:\s*3px solid ([^;]+);/)[1];
  const hoverColor = stylesheet.match(/--link-hover-color:\s*([^;]+);/)[1];
  const koreanRule = stylesheet.match(/\.korean-name\s*\{([^}]*)\}/s)[1];
  const koreanColor = koreanRule.match(/color:\s*([^;]+);/)[1];
  const awardRule = stylesheet.match(/\.award\s*\{([^}]*)\}/s)[1];
  const awardColor = awardRule.match(/color:\s*([^;]+);/)[1];
  const authorLinkRule = stylesheet.match(
    /\.authors a:link,[\s\S]*?\.authors a:visited\s*\{([^}]*)\}/,
  )[1];

  assert.ok(contrastAgainstWhite(focusColor) >= 3, 'focus outline contrast');
  assert.ok(contrastAgainstWhite(hoverColor) >= 4.5, 'hover text contrast');
  assert.ok(contrastAgainstWhite(koreanColor) >= 4.5, 'Korean name contrast');
  assert.ok(contrastAgainstWhite(awardColor) >= 4.5, 'award text contrast');
  assert.match(authorLinkRule, /text-decoration:\s*none;/);
  assert.doesNotMatch(authorLinkRule, /underline/);
});

test('defaults to Selected and switches between two and six papers', () => {
  assert.notEqual(siteScript, '', 'scripts/site.js must exist');

  const hiddenPaperVideo = createVideo('');
  const papers = [
    createPaper(true),
    createPaper(true),
    createPaper(false, [hiddenPaperVideo]),
    createPaper(false),
    createPaper(false),
    createPaper(false),
  ];
  const selectedRadio = createFilterRadio('selected', true);
  const allRadio = createFilterRadio('all');
  const filterGroup = { hidden: true };

  const document = {
    addEventListener(type, listener) {
      if (type === 'DOMContentLoaded') listener();
    },
    querySelectorAll(selector) {
      if (selector === '.paper-entry[data-selected]') return papers;
      if (selector === 'input[name="paper-filter"]') {
        return [selectedRadio, allRadio];
      }
      if (selector === 'video[data-src]') return [];
      return [];
    },
    querySelector(selector) {
      return selector === '.paper-filter' ? filterGroup : null;
    },
  };

  vm.runInNewContext(siteScript, { document, window: {} });

  assert.equal(papers.filter((paper) => !paper.hidden).length, 2);
  assert.equal(filterGroup.hidden, false);
  assert.equal(selectedRadio.checked, true);
  assert.equal(allRadio.checked, false);

  selectedRadio.checked = false;
  allRadio.checked = true;
  allRadio.change();
  assert.equal(papers.filter((paper) => !paper.hidden).length, 6);

  hiddenPaperVideo.paused = false;
  allRadio.checked = false;
  selectedRadio.checked = true;
  selectedRadio.change();
  assert.equal(papers.filter((paper) => !paper.hidden).length, 2);
  assert.equal(hiddenPaperVideo.pauseCalls, 1);
});

test('news defaults to three entries and toggles all eight without persistence', () => {
  const createNewsDocument = (newsItems, newsButton) => ({
    readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === '.news-item') return newsItems;
      if (selector === '.paper-entry[data-selected]') return [];
      if (
        selector === 'input[name="paper-filter"]' ||
        selector === 'video[data-src]'
      ) {
        return [];
      }
      return [];
    },
    querySelector(selector) {
      return selector === '[data-news-toggle]' ? newsButton : null;
    },
  });

  const newsItems = Array.from({ length: 8 }, createNewsItem);
  const newsButton = createNewsButton();
  vm.runInNewContext(siteScript, {
    document: createNewsDocument(newsItems, newsButton),
    window: {},
  });

  assert.equal(newsItems.filter((item) => !item.hidden).length, 3);
  assert.equal(newsButton.hidden, false);
  assert.equal(newsButton.textContent, 'Show more');
  assert.equal(newsButton.getAttribute('aria-expanded'), 'false');

  newsButton.click();
  assert.equal(newsItems.filter((item) => !item.hidden).length, 8);
  assert.equal(newsButton.textContent, 'Show less');
  assert.equal(newsButton.getAttribute('aria-expanded'), 'true');

  newsButton.click();
  assert.equal(newsItems.filter((item) => !item.hidden).length, 3);
  assert.equal(newsButton.textContent, 'Show more');
  assert.equal(newsButton.getAttribute('aria-expanded'), 'false');

  const freshNewsItems = Array.from({ length: 8 }, createNewsItem);
  const freshNewsButton = createNewsButton();
  vm.runInNewContext(siteScript, {
    document: createNewsDocument(freshNewsItems, freshNewsButton),
    window: {},
  });
  assert.equal(freshNewsItems.filter((item) => !item.hidden).length, 3);
  assert.equal(freshNewsButton.hidden, false);
  assert.equal(freshNewsButton.textContent, 'Show more');
  assert.equal(freshNewsButton.getAttribute('aria-expanded'), 'false');
});

test('lazy videos load on intersection and pause outside the viewport', () => {
  const video = createVideo('images/serf.mp4');
  const filterGroup = { hidden: true };
  let observerCallback;

  class IntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }
    observe() {}
    unobserve() {}
  }

  const document = {
    readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === 'video[data-src]') return [video];
      return [];
    },
    querySelector(selector) {
      return selector === '.paper-filter' ? filterGroup : null;
    },
  };
  const window = { IntersectionObserver };

  vm.runInNewContext(siteScript, { document, window });
  assert.equal(video.controls, true);
  assert.equal(video.loadCalls, 0);
  assert.equal(video.playCalls, 0);

  observerCallback([{ isIntersecting: true, target: video }]);
  assert.equal(video.src, 'images/serf.mp4');
  assert.equal(video.loadCalls, 1);
  assert.equal(video.playCalls, 1);

  observerCallback([{ isIntersecting: false, target: video }]);
  assert.equal(video.pauseCalls, 1);
});

test('video previews avoid inert controls and static poster images', () => {
  assert.equal(countMatches(indexHtml, /<video\b[^>]*\scontrols(?:\s|>)/g), 0);
  const videoTags = [...indexHtml.matchAll(/<video\b[^>]*>/g)].map(
    (match) => match[0],
  );
  assert.equal(videoTags.length, 4);
  videoTags.forEach((tag) => assert.doesNotMatch(tag, /\sposter=/));

  for (const poster of [
    'images/serf-poster.jpg',
    'images/sbtp.png',
    'images/MISO.png',
    'images/tqdm.png',
  ]) {
    assert.equal(existsSync(path.join(projectRoot, poster)), false, poster);
  }
});

test('fallback media loading never plays videos inside hidden papers', () => {
  const selectedVideo = createVideo('images/selected.mp4');
  const hiddenVideo = createVideo('images/hidden.mp4');
  const papers = [
    createPaper(true, [selectedVideo]),
    createPaper(false, [hiddenVideo]),
  ];
  const selectedRadio = createFilterRadio('selected', true);
  const allRadio = createFilterRadio('all');

  const document = {
    readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === '.paper-entry[data-selected]') return papers;
      if (selector === 'input[name="paper-filter"]') {
        return [selectedRadio, allRadio];
      }
      if (selector === 'video[data-src]') return [selectedVideo, hiddenVideo];
      return [];
    },
    querySelector() {
      return { hidden: true };
    },
  };

  vm.runInNewContext(siteScript, { document, window: {} });

  assert.equal(selectedVideo.loadCalls, 1);
  assert.equal(selectedVideo.playCalls, 1);
  assert.equal(hiddenVideo.loadCalls, 0);
  assert.equal(hiddenVideo.playCalls, 0);

  selectedRadio.checked = false;
  allRadio.checked = true;
  allRadio.change();
  assert.equal(hiddenVideo.loadCalls, 1);
  assert.equal(hiddenVideo.playCalls, 1);
});

test('references only local assets that exist', () => {
  const references = [...indexHtml.matchAll(/(?:href|src|data-src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((reference) => !/^(?:https?:|mailto:|\/\/|#)/.test(reference))
    .map((reference) => reference.split(/[?#]/, 1)[0]);

  const missing = references.filter(
    (reference) => !existsSync(path.join(projectRoot, reference)),
  );

  assert.deepEqual(missing, []);
});
