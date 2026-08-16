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

function createClassList() {
  const values = new Set();
  return {
    add(value) {
      values.add(value);
    },
    remove(value) {
      values.delete(value);
    },
    contains(value) {
      return values.has(value);
    },
  };
}

function createFilterButton(filter) {
  const attributes = new Map();
  const listeners = new Map();
  return {
    dataset: { filter },
    classList: createClassList(),
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
  assert.equal(countMatches(indexHtml, /class="news-item"/g), 8);
  assert.match(
    indexHtml,
    /<button class="news-toggle"[^>]*data-news-toggle[^>]*aria-expanded="false"[^>]*hidden(?:\s|>)/,
  );
  assert.doesNotMatch(
    indexHtml,
    /class="news-item"[^>]*\shidden(?:\s|=|>)/,
  );
});

test('links UC San Diego and orders biography and Research content', () => {
  assert.match(indexHtml, /<a href="https:\/\/ucsd\.edu\/">UC San Diego<\/a>/);
  assert.match(
    indexHtml,
    /<p class="previous-experience">[\s\S]*Agency for Defense Development \(ADD\)[\s\S]*KAIST[\s\S]*<\/p>/,
  );

  const researchOrder = indexHtml.indexOf('<h2 class="section-title" id="research-heading">Research</h2>');
  assert.notEqual(researchOrder, -1);
  const statementOrder = indexHtml.indexOf('<p class="research-statement">', researchOrder);
  const noteOrder = indexHtml.indexOf('<p class="papers-note">', statementOrder);
  const filterOrder = indexHtml.indexOf('<div class="paper-filter"', noteOrder);
  assert.ok(researchOrder < statementOrder);
  assert.ok(statementOrder < noteOrder);
  assert.ok(noteOrder < filterOrder);
  assert.doesNotMatch(indexHtml, /id="papers-heading"/);
  assert.doesNotMatch(indexHtml, /<h2[^>]*>Papers<\/h2>/);
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

test('declares an accessible Selected and All paper filter without hiding fallback content', () => {
  assert.match(indexHtml, /role="group"[^>]*aria-label="Paper filter"/);
  assert.match(indexHtml, /class="paper-filter"[^>]*\shidden(?:\s|>)/);
  assert.match(indexHtml, /data-filter="selected"[^>]*aria-pressed="true"/);
  assert.match(indexHtml, /data-filter="all"[^>]*aria-pressed="false"/);
  assert.doesNotMatch(
    indexHtml,
    /class="[^"]*paper-entry[^"]*"[^>]*\shidden(?:\s|=|>)/,
  );
});

test('paper filter overrides native button appearance for a clear active state', () => {
  assert.match(
    stylesheet,
    /\.paper-filter-button\s*\{[^}]*appearance:\s*none;/s,
  );
  assert.match(
    stylesheet,
    /\.paper-filter-button\.active\s*\{[^}]*background:\s*var\(--link-color\);/s,
  );
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
  const selectedButton = createFilterButton('selected');
  const allButton = createFilterButton('all');
  const filterGroup = { hidden: true };

  const document = {
    addEventListener(type, listener) {
      if (type === 'DOMContentLoaded') listener();
    },
    querySelectorAll(selector) {
      if (selector === '.paper-entry[data-selected]') return papers;
      if (selector === '[data-filter]') return [selectedButton, allButton];
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
  assert.equal(selectedButton.getAttribute('aria-pressed'), 'true');
  assert.equal(allButton.getAttribute('aria-pressed'), 'false');

  allButton.click();
  assert.equal(papers.filter((paper) => !paper.hidden).length, 6);
  assert.equal(selectedButton.getAttribute('aria-pressed'), 'false');
  assert.equal(allButton.getAttribute('aria-pressed'), 'true');

  hiddenPaperVideo.paused = false;
  selectedButton.click();
  assert.equal(papers.filter((paper) => !paper.hidden).length, 2);
  assert.equal(hiddenPaperVideo.pauseCalls, 1);
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

test('video previews avoid inert no-JavaScript controls and provide posters', () => {
  assert.equal(countMatches(indexHtml, /<video\b[^>]*\scontrols(?:\s|>)/g), 0);
  assert.match(
    indexHtml,
    /data-src="images\/serf\.mp4"[^>]*poster="images\/serf-poster\.jpg"/,
  );
});

test('fallback media loading never plays videos inside hidden papers', () => {
  const selectedVideo = createVideo('images/selected.mp4');
  const hiddenVideo = createVideo('images/hidden.mp4');
  const papers = [
    createPaper(true, [selectedVideo]),
    createPaper(false, [hiddenVideo]),
  ];
  const selectedButton = createFilterButton('selected');
  const allButton = createFilterButton('all');

  const document = {
    readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === '.paper-entry[data-selected]') return papers;
      if (selector === '[data-filter]') return [selectedButton, allButton];
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

  allButton.click();
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
