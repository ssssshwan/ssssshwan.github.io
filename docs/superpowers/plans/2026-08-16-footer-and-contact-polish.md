# Footer and Contact Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the email hyperlink, simplify the Research note, enlarge the Korean name slightly, and add a small linked template acknowledgement at the page bottom.

**Architecture:** Make semantic content changes in `index.html` and keep presentation in `stylesheet.css`. Extend the zero-dependency Node test suite with scoped HTML/CSS assertions; do not change JavaScript or existing interaction contracts.

**Tech Stack:** HTML5, Bootstrap 4.1.3 CSS, custom CSS, Node.js built-in test runner, Nokogiri HTML5 parser

---

## File Structure

- Modify `index.html`: plain-text email, shortened Research note, and footer acknowledgement.
- Modify `stylesheet.css`: Korean-name size and compact muted footer-credit styling.
- Modify `tests/site.test.mjs`: exact content, ordering, link, and style regression assertions.

### Task 1: Apply Contact, Research Note, Name, and Footer Refinements

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `index.html`
- Modify: `stylesheet.css`

- [ ] **Step 1: Add failing content and style tests**

Add a footer extraction helper near `extractSection`:

```js
function extractFooter(source) {
  const match = source.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/);
  assert.ok(match, 'missing footer');
  return match[0];
}
```

Add a focused test for the contact, note, and acknowledgement:

```js
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
```

Add CSS assertions:

```js
test('slightly enlarges the Korean name and keeps template credit secondary', () => {
  assert.match(stylesheet, /\.korean-name\s*\{[^}]*font-size:\s*0\.65em;/s);
  assert.match(
    stylesheet,
    /\.template-credit\s*\{(?=[^}]*font-size:\s*0\.75rem;)(?=[^}]*color:\s*var\(--muted-text\);)[^}]*\}/s,
  );
});
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
node --test --test-name-pattern='plain email|Korean name' tests/site.test.mjs
```

Expected: FAIL because the email is linked, the recency sentence remains, the footer credit is absent, and the Korean name is still `0.55em`.

- [ ] **Step 3: Apply the minimal HTML changes**

Replace the email line with plain text:

```html
Email: suk063 AT ucsd.edu<br>
```

Replace the Research note with:

```html
<p class="papers-note">* indicates equal contribution.</p>
```

Append the credit after `.map-embed` but inside the existing footer:

```html
<p class="template-credit">
  Template based on <a href="https://haozhiqi.github.io/">this website</a>
</p>
```

- [ ] **Step 4: Apply the minimal CSS changes**

Change only the `.korean-name` size declaration:

```css
font-size: 0.65em;
```

Add the footer credit styles after `.map-embed`:

```css
.template-credit {
  margin: 0.5rem 0 0;
  color: var(--muted-text);
  font-size: 0.75rem;
  line-height: 1.4;
}

.template-credit a:link,
.template-credit a:visited {
  color: var(--muted-text);
}

.template-credit a:hover {
  color: var(--link-hover-color);
}
```

- [ ] **Step 5: Run focused and full tests**

Run:

```bash
node --test --test-name-pattern='plain email|Korean name' tests/site.test.mjs
node --test tests/site.test.mjs
```

Expected: focused tests PASS and the full suite reports zero failures.

- [ ] **Step 6: Commit the refinements**

```bash
git add index.html stylesheet.css tests/site.test.mjs
git commit -m "Polish contact and footer details"
```

### Task 2: Run Full Verification

**Files:**
- Verify: `index.html`
- Verify: `stylesheet.css`
- Verify: `scripts/site.js`
- Verify: `tests/site.test.mjs`

- [ ] **Step 1: Run the complete behavioral suite**

```bash
node --test tests/site.test.mjs
```

Expected: all tests PASS, including the new contact/footer tests and existing News, Research, paper-filter, media, metadata, and asset tests.

- [ ] **Step 2: Parse HTML5 and check JavaScript syntax**

```bash
ruby -e 'require "nokogiri"; html=File.read("index.html", encoding: "UTF-8"); document=Nokogiri::HTML5.parse(html); abort(document.errors.map(&:message).join("\n")) unless document.errors.empty?; puts "HTML5 parse: OK"'
node --check scripts/site.js
```

Expected: `HTML5 parse: OK`; both commands exit 0.

- [ ] **Step 3: Check diff integrity, reference CSS, and repository state**

```bash
git diff --check
git hash-object res/css/bootstrap.min.css
git status --short
```

Expected: no diff errors; Bootstrap hash is `6a69a43115f43727d901adc14813026113bb57b9`; worktree is clean.

- [ ] **Step 4: Review the final diff against the approved scope**

```bash
git diff da4478e0e96c1317b8d2e01acb86e04ec3ce3c86..HEAD --stat
git log --oneline da4478e0e96c1317b8d2e01acb86e04ec3ce3c86..HEAD
```

Expected: only the approved homepage implementation, assets, tests, and documentation are present.
