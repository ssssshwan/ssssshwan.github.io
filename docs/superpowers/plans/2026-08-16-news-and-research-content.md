# News and Research Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse Recent News to three entries by default and reorganize the biography and Research section exactly as approved.

**Architecture:** Keep all content in semantic HTML and progressively enhance News from `scripts/site.js`, matching the paper filter's no-JavaScript fallback. Reuse the existing Bootstrap layout and custom stylesheet; do not add dependencies or change the paper-filter DOM contract.

**Tech Stack:** HTML5, Bootstrap 4.1.3 CSS, custom CSS, vanilla JavaScript, Node.js built-in test runner, Nokogiri HTML5 parser

---

## File Structure

- Modify `index.html`: biography paragraphs, UC San Diego link, News toggle markup, and Research content order.
- Modify `scripts/site.js`: initialize and toggle the collapsed News state independently from paper filtering and media loading.
- Modify `stylesheet.css`: add the lightweight News toggle presentation and spacing.
- Modify `tests/site.test.mjs`: cover content hierarchy, progressive enhancement, News state transitions, and existing regressions.

### Task 1: Reorganize Static Content and Progressive-Enhancement Markup

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `index.html`

- [ ] **Step 1: Write failing static-structure tests**

Update the existing reference-layout test and add a focused content-hierarchy test:

```js
test('uses the reference template header and collapsible news structure', () => {
  assert.match(indexHtml, /res\/css\/bootstrap\.min\.css/);
  assert.match(indexHtml, /class="[^"]*col-md-3[^"]*"[\s\S]*Sunghwan\.jpeg/);
  assert.match(indexHtml, /class="[^"]*col-md-9[^"]*"/);
  assert.equal(countMatches(indexHtml, /class="news-item"/g), 8);
  assert.match(
    indexHtml,
    /class="news-toggle"[^>]*data-news-toggle[^>]*aria-expanded="false"[^>]*hidden/,
  );
});

test('links UC San Diego and orders biography and Research content', () => {
  assert.match(indexHtml, /<a href="https:\/\/ucsd\.edu\/">UC San Diego<\/a>/);
  assert.match(
    indexHtml,
    /<p class="previous-experience">[\s\S]*Previously, I was a research officer[\s\S]*KAIST[\s\S]*<\/p>/,
  );
  assert.match(
    indexHtml,
    /id="research-heading">Research<\/h2>[\s\S]*class="research-statement">\s*My research goal[\s\S]*class="papers-note">Papers sorted by recency[\s\S]*class="paper-filter"/,
  );
  assert.doesNotMatch(indexHtml, /id="papers-heading">Papers<\/h2>/);
});
```

- [ ] **Step 2: Run the tests and verify the intended failures**

Run:

```bash
node --test --test-name-pattern='reference template|links UC San Diego' tests/site.test.mjs
```

Expected: FAIL because the News toggle, UC San Diego anchor, separate paragraph, and `Research` hierarchy do not exist yet.

- [ ] **Step 3: Make the minimal HTML changes**

In the biography, link UC San Diego and split the previous-work/education sentences:

```html
<p>
  Hi! My name is
  <span class="pronunciation" tabindex="0">Sunghwan Kim<span class="pronunciation-text" role="tooltip">pronounced "Sung-Hwahn" (su as in "sun")</span></span>.
  I also go by Shawn. I am a Ph.D. student in the Department of Electrical and Computer Engineering at <a href="https://ucsd.edu/">UC San Diego</a>, where I work with the <a href="https://existentialrobotics.org/">Existential Robotics Laboratory</a>. I'm fortunate to be advised by Prof. <a href="https://natanaso.github.io/">Nikolay Atanasov</a>. I'm also closely working with Prof. <a href="https://www.tianyulun.com/">Yulun Tian</a> at University of Michigan.
</p>
<p class="previous-experience">
  Previously, I was a research officer at the <a href="https://www.add.re.kr/eps">Agency for Defense Development (ADD)</a>, the South Korean counterpart to the U.S. DARPA. I received my B.S. in Electrical Engineering and Mathematics (double major) at <a href="https://www.kaist.ac.kr/en/">KAIST</a>.
</p>
```

Keep all eight News `<li class="news-item">` elements unchanged, then add a hidden progressive-enhancement control after the list:

```html
<button class="news-toggle" type="button" data-news-toggle aria-expanded="false" hidden>Show more</button>
```

Reorder the paper section header so the existing statement introduces the publication controls:

```html
<section class="container page-section papers-section" id="papers" aria-labelledby="research-heading">
  <div class="papers-header">
    <div>
      <h2 class="section-title" id="research-heading">Research</h2>
      <p class="research-statement">
        My research goal is to enable mobile robots to autonomously perform complex, long-horizon tasks that require both navigation and physical interaction in large-scale, unstructured environments. To this end, I aim to develop structured representations of the physical world and leverage them for task execution and planning. In particular, I am currently exploring how 3D maps can support long-horizon reasoning in visuomotor policies. My research is centered on neural scene representations, simultaneous localization and mapping (SLAM), and robot policy learning (e.g., VLA and model-based RL).
      </p>
      <p class="papers-note">Papers sorted by recency. * indicates equal contribution.</p>
    </div>
    <div class="paper-filter" role="group" aria-label="Paper filter" hidden>
      <button class="paper-filter-button active" type="button" data-filter="selected" aria-pressed="true">Selected</button>
      <button class="paper-filter-button" type="button" data-filter="all" aria-pressed="false">All</button>
    </div>
  </div>
```

- [ ] **Step 4: Run the static and full suites**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: the new static tests PASS; the existing filter, media, metadata, and asset tests remain PASS.

- [ ] **Step 5: Commit the static content change**

```bash
git add index.html tests/site.test.mjs
git commit -m "Reorganize biography and research content"
```

### Task 2: Add the News Toggle Behavior and Styling

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `scripts/site.js`
- Modify: `stylesheet.css`

- [ ] **Step 1: Add failing News behavior test helpers**

Add these small real-behavior fakes beside the existing button helper:

```js
function createNewsItem() {
  return { hidden: false };
}

function createNewsButton() {
  const attributes = new Map([['aria-expanded', 'false']]);
  let clickListener;
  return {
    hidden: true,
    textContent: 'Show more',
    addEventListener(type, listener) {
      if (type === 'click') clickListener = listener;
    },
    click() {
      clickListener?.();
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
  };
}
```

- [ ] **Step 2: Add a failing three-to-eight-to-three state test**

```js
test('news defaults to three entries and toggles all eight without persistence', () => {
  const newsItems = Array.from({ length: 8 }, createNewsItem);
  const newsButton = createNewsButton();
  const document = {
    readyState: 'complete',
    querySelectorAll(selector) {
      if (selector === '.news-item') return newsItems;
      return [];
    },
    querySelector(selector) {
      if (selector === '[data-news-toggle]') return newsButton;
      return null;
    },
  };

  vm.runInNewContext(siteScript, { document, window: {} });
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
});
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
node --test --test-name-pattern='news defaults' tests/site.test.mjs
```

Expected: FAIL because all eight items remain visible and the hidden button has no click listener.

- [ ] **Step 4: Implement minimal News initialization**

Inside `initializeSite()` in `scripts/site.js`, query and manage News independently:

```js
var newsItems = Array.prototype.slice.call(document.querySelectorAll('.news-item'));
var newsToggle = document.querySelector('[data-news-toggle]');

function setNewsExpanded(expanded) {
  newsItems.slice(3).forEach(function (item) {
    item.hidden = !expanded;
  });
  newsToggle.setAttribute('aria-expanded', String(expanded));
  newsToggle.textContent = expanded ? 'Show less' : 'Show more';
}

if (newsToggle && newsItems.length > 3) {
  newsToggle.addEventListener('click', function () {
    var expanded = newsToggle.getAttribute('aria-expanded') === 'true';
    setNewsExpanded(!expanded);
  });
  setNewsExpanded(false);
  newsToggle.hidden = false;
}
```

The guard ensures test documents without News markup and pages with three or fewer entries remain unaffected.

- [ ] **Step 5: Add lightweight toggle styling**

Add after the News list styles in `stylesheet.css`:

```css
.news-toggle {
  -webkit-appearance: none;
  appearance: none;
  margin: 0 0 0 1.25rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--link-color);
  cursor: pointer;
  font: inherit;
  font-weight: 500;
}

.news-toggle:hover {
  color: var(--link-hover-color);
}
```

- [ ] **Step 6: Run focused and full tests**

Run:

```bash
node --test --test-name-pattern='news defaults' tests/site.test.mjs
node --test tests/site.test.mjs
```

Expected: focused test PASS; full suite reports zero failures.

- [ ] **Step 7: Commit the News interaction**

```bash
git add scripts/site.js stylesheet.css tests/site.test.mjs
git commit -m "Add accessible recent news toggle"
```

### Task 3: Complete Regression and Markup Verification

**Files:**
- Verify: `index.html`
- Verify: `scripts/site.js`
- Verify: `stylesheet.css`
- Verify: `tests/site.test.mjs`
- Verify: `res/css/bootstrap.min.css`

- [ ] **Step 1: Run the complete behavioral suite**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: all tests PASS, including News 3/8/3, Research ordering, Selected/All 2/6/2, lazy media, no-JavaScript fallbacks, metadata, and local assets.

- [ ] **Step 2: Parse HTML5 and check JavaScript syntax**

Run:

```bash
ruby -e 'require "nokogiri"; html=File.read("index.html", encoding: "UTF-8"); document=Nokogiri::HTML5.parse(html); abort(document.errors.map(&:message).join("\n")) unless document.errors.empty?; puts "HTML5 parse: OK"'
node --check scripts/site.js
```

Expected: `HTML5 parse: OK` and both commands exit 0.

- [ ] **Step 3: Check formatting and the exact Bootstrap vendor file**

Run:

```bash
git diff --check
git hash-object res/css/bootstrap.min.css
```

Expected: no diff errors; Bootstrap hash is `6a69a43115f43727d901adc14813026113bb57b9`.

- [ ] **Step 4: Review the final diff against the approved scope**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only the homepage implementation, tests, Bootstrap vendor file, SERF poster, and approved documentation are in scope; no unrelated files appear.

- [ ] **Step 5: Commit any remaining in-scope vendor assets**

```bash
git add res/css/bootstrap.min.css images/serf-poster.jpg
git commit -m "Add homepage template assets"
```

- [ ] **Step 6: Re-run tests after the final commit**

Run:

```bash
node --test tests/site.test.mjs
git status --short
```

Expected: all tests PASS and the worktree is clean.
