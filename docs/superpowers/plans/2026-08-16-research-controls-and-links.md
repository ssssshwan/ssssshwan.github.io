# Research Controls and Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Research section's boxed controls with a left-aligned `Selected / ALL` text selector and render publication resources as plain slash-separated links at the surrounding body-text size.

**Architecture:** Keep the existing static HTML, CSS, and small progressive-enhancement script. Use native radio inputs for the mutually exclusive paper views, let CSS render their labels as lightweight text, and keep the current `data-selected` filtering and video lifecycle behavior. Keep paper-link separators explicit in HTML so missing links never produce stray slashes.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, Node.js built-in test runner and `vm` test harness.

---

### Task 1: Replace paper-link badges with plain slash-separated links

**Files:**
- Modify: `tests/site.test.mjs:304-324`
- Modify: `index.html:19,108-220`
- Modify: `stylesheet.css:282-317`

- [ ] **Step 1: Write the failing paper-link structure test**

Add this test after `preserves all six papers and marks exactly two as selected` in `tests/site.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: FAIL in `uses plain slash-separated paper links without icon dependencies` because `.paper-links` does not exist and Font Awesome is still loaded.

- [ ] **Step 3: Remove the unused Font Awesome dependency**

Delete this line from `index.html`:

```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

- [ ] **Step 4: Replace all six badge containers with plain links**

Use these exact containers in paper order in `index.html`:

```html
            <div class="paper-links">
              <a href="https://arxiv.org/abs/2606.12956" target="_blank" rel="noopener noreferrer">Paper</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://existentialrobotics.org/serf/" target="_blank" rel="noopener noreferrer">Project Page</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://github.com/ExistentialRobotics/SERF-VLA" target="_blank" rel="noopener noreferrer">Code</a>
            </div>
```

```html
            <div class="paper-links">
              <a href="https://arxiv.org/abs/2510.03885" target="_blank" rel="noopener noreferrer">Paper</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://existentialrobotics.org/sbp_page/" target="_blank" rel="noopener noreferrer">Project Page</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://github.com/ExistentialRobotics/SBP" target="_blank" rel="noopener noreferrer">Code</a>
            </div>
```

```html
            <div class="paper-links">
              <a href="https://arxiv.org/abs/2504.19104v1" target="_blank" rel="noopener noreferrer">Paper</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://existentialrobotics.org/miso_rss25/" target="_blank" rel="noopener noreferrer">Project Page</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://github.com/ExistentialRobotics/MISO" target="_blank" rel="noopener noreferrer">Code</a>
            </div>
```

```html
            <div class="paper-links">
              <a href="https://arxiv.org/pdf/2407.09033" target="_blank" rel="noopener noreferrer">Paper</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://byeonghyunpak.github.io/tqdm/" target="_blank" rel="noopener noreferrer">Project Page</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://github.com/ByeongHyunPak/tqdm" target="_blank" rel="noopener noreferrer">Code</a>
            </div>
```

```html
            <div class="paper-links">
              <a href="https://arxiv.org/abs/2303.11546" target="_blank" rel="noopener noreferrer">Paper</a><span class="paper-link-separator" aria-hidden="true">/</span><a href="https://github.com/ssssshwan/TLDR" target="_blank" rel="noopener noreferrer">Code</a>
            </div>
```

```html
            <div class="paper-links">
              <a href="https://spie.org/spie-sensors-imaging/presentation/Data-gathering-trials-for-the-development-of-military-imaging-systems/12737-27" target="_blank" rel="noopener noreferrer">Paper</a>
            </div>
```

- [ ] **Step 5: Replace the badge CSS with plain-link spacing**

Replace the complete `.link-badges` rule group in `stylesheet.css` with:

```css
.paper-links {
  margin-top: 4px;
  margin-bottom: 4px;
  font-size: 1rem;
  line-height: 1.4;
}

.paper-link-separator {
  margin: 0 0.35rem;
  color: #9ca3af;
}
```

- [ ] **Step 6: Run the full test suite**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 7: Commit the paper-link change**

```bash
git add index.html stylesheet.css tests/site.test.mjs
git commit -m "Simplify research paper links"
```

### Task 2: Replace filter buttons with an accessible inline radio selector

**Files:**
- Modify: `tests/site.test.mjs:76-113,304-324,360-406,407-420,500-535`
- Modify: `index.html:78-88`
- Modify: `stylesheet.css:178-220,368-377`
- Modify: `scripts/site.js:9-15,62-95,106-113`

- [ ] **Step 1: Replace the button test double with a radio test double**

Delete `createClassList` and `createFilterButton` from `tests/site.test.mjs`, then add:

```js
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
```

- [ ] **Step 2: Replace the filter markup and CSS assertions**

Replace the existing `declares an accessible Selected and All paper filter without hiding fallback content` and `paper filter overrides native button appearance for a clear active state` tests with:

```js
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
```

- [ ] **Step 3: Update the filter behavior tests for radio change events**

In `defaults to Selected and switches between two and six papers`, replace the filter controls and related selector/assertion code with:

```js
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
```

In `news defaults to three entries and toggles all eight without persistence`, replace the combined empty-selector condition with:

```js
      if (
        selector === 'input[name="paper-filter"]' ||
        selector === 'video[data-src]'
      ) {
        return [];
      }
```

In `fallback media loading never plays videos inside hidden papers`, use these controls and selectors:

```js
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
```

- [ ] **Step 4: Run the tests to verify they fail**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: FAIL because the page still renders buttons and the script still listens for button clicks.

- [ ] **Step 5: Replace the filter markup**

Replace `.papers-header` in `index.html` with:

```html
      <p class="papers-note">* indicates equal contribution.</p>
      <fieldset class="paper-filter" hidden>
        <legend class="paper-filter-legend">Paper filter</legend>
        <input class="paper-filter-input" type="radio" name="paper-filter" id="paper-filter-selected" value="selected" checked>
        <label class="paper-filter-label" for="paper-filter-selected">Selected</label>
        <span class="paper-filter-separator" aria-hidden="true">/</span>
        <input class="paper-filter-input" type="radio" name="paper-filter" id="paper-filter-all" value="all">
        <label class="paper-filter-label" for="paper-filter-all">ALL</label>
      </fieldset>
```

- [ ] **Step 6: Replace the boxed filter styles with inline text styles**

Replace `.papers-header`, `.papers-note`, `.paper-filter`, and all `.paper-filter-button` rules with:

```css
.papers-note {
  margin-bottom: 0.35rem;
}

.paper-filter {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  margin: 0 0 1.25rem;
  padding: 0;
  border: 0;
}

.paper-filter[hidden] {
  display: none;
}

.paper-filter-legend,
.paper-filter-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.paper-filter-label {
  margin: 0;
  color: var(--link-color);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1.2;
}

.paper-filter-label:hover {
  color: var(--link-hover-color);
}

.paper-filter-input:checked + .paper-filter-label {
  color: var(--text-color);
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--link-color);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.paper-filter-input:focus-visible + .paper-filter-label {
  outline: 3px solid #0071bc;
  outline-offset: 2px;
}

.paper-filter-separator {
  color: #9ca3af;
}
```

Remove the `.papers-header` and `.paper-filter` overrides from the mobile media query; the base rules already keep the selector left-aligned and spaced correctly at every width.

- [ ] **Step 7: Update the script to use radio values and change events**

Replace the filter-control declaration in `scripts/site.js` with:

```js
    var filterInputs = Array.prototype.slice.call(
      document.querySelectorAll('input[name="paper-filter"]'),
    );
```

Remove the `filterButtons.forEach` block at the end of `setPaperFilter`; native radios own their checked state.

Replace the button listener and initial filter calls with:

```js
    filterInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        if (input.checked) setPaperFilter(input.value);
      });
    });

    var initialFilter = filterInputs.find(function (input) {
      return input.checked;
    });
    setPaperFilter(initialFilter ? initialFilter.value : 'selected');
    if (filterGroup) filterGroup.hidden = false;
```

- [ ] **Step 8: Run the full test suite**

Run:

```bash
node --test tests/site.test.mjs
```

Expected: all tests PASS, including initial Selected filtering, radio change events, hidden-video pausing, fallback video loading, and structural accessibility assertions.

- [ ] **Step 9: Commit the filter change**

```bash
git add index.html stylesheet.css scripts/site.js tests/site.test.mjs
git commit -m "Replace paper filter buttons with text selector"
```

### Task 3: Verify layout, behavior, and repository cleanliness

**Files:**
- Verify: `index.html`
- Verify: `stylesheet.css`
- Verify: `scripts/site.js`
- Verify: `tests/site.test.mjs`

- [ ] **Step 1: Run automated verification from a clean command**

Run:

```bash
node --test tests/site.test.mjs
git diff --check
```

Expected: every test passes and `git diff --check` prints no errors.

- [ ] **Step 2: Inspect the page at desktop width**

Serve the repository locally and open `index.html` at approximately 1440 pixels wide. Confirm:

- `Selected / ALL` is below the contribution note and aligned to the Research section's left edge.
- `Selected` starts underlined and only the two selected papers appear.
- Choosing `All` reveals all six papers without moving the selector to the right.
- The first four entries read `Paper / Project Page / Code`, the fifth reads `Paper / Code`, and the sixth reads `Paper`.
- No control has a box, pill, background fill, or icon.

- [ ] **Step 3: Inspect the page at mobile width**

Resize to approximately 390 pixels wide. Confirm the selector stays left-aligned, focus outlines are not clipped, paper links wrap without horizontal scrolling, and the existing stacked media/details layout remains intact.

- [ ] **Step 4: Verify keyboard and reduced-motion behavior**

Use Tab to focus the active radio label, arrow keys to switch between `Selected` and `All`, and Shift+Tab/Tab to leave the group. Enable reduced motion and confirm videos do not autoplay; disable reduced motion and confirm visible videos retain the existing lazy-load/play behavior.

- [ ] **Step 5: Review the final diff and status**

Run:

```bash
git diff HEAD~2 -- index.html stylesheet.css scripts/site.js tests/site.test.mjs
git status --short
```

Expected: the diff is limited to the approved Research controls, paper links, tests, and removal of the unused Font Awesome dependency. The only unrelated untracked path may be `.superpowers/` from the approved visual brainstorming session; do not add it to a product commit.
