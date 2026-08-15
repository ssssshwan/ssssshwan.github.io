# Source Sans Pro Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the reference site's Source Sans Pro family and desktop/mobile type scale across the portfolio without changing its content, colors, layout, or interactions.

**Architecture:** Load the exact Source Sans Pro family through Google Fonts in the document head, then make the existing stylesheet the single source of truth for type family, size, weight, and line height. Preserve the current layout breakpoints while adding the reference site's 700px typography breakpoint.

**Tech Stack:** Static HTML5, CSS3, Google Fonts CSS API, shell-based source-contract checks

---

## File map

- Modify `index.html`: load Source Sans Pro and remove the profile name's inline size override.
- Modify `stylesheet.css`: remove bundled Lato faces, set the Source Sans Pro fallback stack, normalize desktop sizes, and add the responsive type scale.

### Task 1: Font delivery and desktop type scale

**Files:**
- Modify: `index.html:14-15,26`
- Modify: `stylesheet.css:1-171,248-255,315-351`

- [ ] **Step 1: Run the desktop typography contract and verify it fails**

Run:

```bash
rg -q 'fonts.googleapis.com/css2?family=Source\+Sans\+Pro' index.html && ! rg -q "Lato|font-size:2\\.7em" index.html stylesheet.css
```

Expected: exit status 1 because the Source Sans Pro link is absent and Lato plus the inline profile-name size are present.

- [ ] **Step 2: Load Source Sans Pro and remove the inline name size**

Insert before the existing `stylesheet.css` link in `index.html`:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;0,700;1,400;1,700&amp;display=swap" rel="stylesheet">
```

Replace the profile heading with:

```html
            <h1 class="about-name">Sunghwan Kim <span style="font-size:0.5em; font-weight:300; color:#888; letter-spacing:0.05em;">(김성환)</span></h1>
```

- [ ] **Step 3: Replace the Lato faces and desktop type rules**

Delete the Lato `@font-face` rules at the top of `stylesheet.css`. Replace the base typography blocks with:

```css
body,
td,
th,
tr,
p,
a {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif;
  font-size: 15.4px;
  line-height: 1.55;
  color: #333;
}

strong {
  font-family: inherit;
  font-size: inherit;
}

h2 {
  margin: 0;
  font-family: inherit;
  font-size: 22px;
  font-weight: normal;
}

.papertitle {
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
}

name {
  font-family: inherit;
  font-size: 32px;
  font-weight: 600;
  line-height: 1.3;
}
```

Use these complete replacements for component-specific overrides:

```css
.about-name {
  grid-column: 1;
  grid-row: 1;
  margin: 0;
  font-family: inherit;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.3;
  color: #333;
  text-align: left;
}

.about-links {
  font-size: inherit;
  margin-bottom: 0 !important;
}

.news-show-more {
  display: inline-block;
  border: 0;
  background: none;
  padding: 0;
  color: #1772d0;
  font-family: inherit;
  font-size: inherit;
  text-decoration: none;
  margin-top: 4px;
  cursor: pointer;
}

.research-title {
  font-family: inherit;
  font-size: 17px !important;
  font-weight: 700;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.research-authors {
  font-size: inherit;
  margin: 0 0 6px 0;
  line-height: 1.55;
}

.research-venue {
  font-size: inherit;
  color: #000;
  margin: 0 0 10px 0;
}

.research-links {
  font-size: inherit;
  margin: 0 0 10px 0;
}
```

Change `.news-list li` to `line-height: 1.55;`. Keep `.tooltip .tooltiptext` at 13px because it is a dedicated annotation.

- [ ] **Step 4: Run the desktop contract and verify it passes**

Run:

```bash
rg -q 'fonts.googleapis.com/css2?family=Source\+Sans\+Pro' index.html && ! rg -q "Lato|font-size:2\\.7em|font-size: 14px" index.html stylesheet.css
rg -n "font-size: 15\\.4px|font-size: 22px|font-size: 32px|font-size: 17px" stylesheet.css
git diff --check
```

Expected: the first and third commands exit 0; the second command reports the desktop body, heading, profile-name, and paper-title sizes.

- [ ] **Step 5: Commit the desktop typography**

```bash
git add index.html stylesheet.css
git commit -m "Apply Source Sans Pro typography"
```

### Task 2: Responsive type scale and regression verification

**Files:**
- Modify: `stylesheet.css` after the `.about-name` rule and before the existing 640px about-layout breakpoint

- [ ] **Step 1: Run the mobile typography contract and verify it fails**

Run:

```bash
rg -Uq '@media \(max-width: 700px\)[\s\S]*font-size: 15px;[\s\S]*font-size: 20px;[\s\S]*font-size: 28px;' stylesheet.css
```

Expected: exit status 1 because the 700px responsive typography block does not exist.

- [ ] **Step 2: Add the mobile typography breakpoint**

Add this block after the desktop `.about-name` rule:

```css
@media (max-width: 700px) {
  body,
  td,
  th,
  tr,
  p,
  a {
    font-size: 15px;
    line-height: 1.55;
  }

  h2 {
    font-size: 20px;
  }

  name,
  .about-name {
    font-size: 28px;
    line-height: 1.3;
  }
}
```

Do not add a mobile override for `.research-title`; it remains 17px at every width as specified.

- [ ] **Step 3: Run the mobile and full typography contracts**

Run:

```bash
rg -Uq '@media \(max-width: 700px\)[\s\S]*font-size: 15px;[\s\S]*font-size: 20px;[\s\S]*font-size: 28px;' stylesheet.css
rg -q 'Source\+Sans\+Pro:ital,wght@0,400;0,600;0,700;1,400;1,700' index.html
! rg -q "Lato|font-size:2\\.7em|font-size: 14px" index.html stylesheet.css
git diff --check
```

Expected: all commands exit 0 with no whitespace errors.

- [ ] **Step 4: Verify the hosted font contract**

Run:

```bash
curl -fsSL -A 'Mozilla/5.0' 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;0,700;1,400;1,700&display=swap' | rg "font-family: 'Source Sans Pro'|font-weight: (400|600|700)"
```

Expected: output contains Source Sans Pro face declarations for normal weights 400, 600, 700 and italic weights 400 and 700.

- [ ] **Step 5: Review the final diff for scope**

Run:

```bash
git diff -- index.html stylesheet.css
git status --short
```

Expected: only font-loading markup, the profile-name inline size removal, desktop typography rules, and the 700px typography breakpoint differ from the pre-implementation state.

- [ ] **Step 6: Commit responsive typography**

```bash
git add stylesheet.css
git commit -m "Match responsive typography scale"
```

