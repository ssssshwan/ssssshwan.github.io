# Readable Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slightly increase site-wide text sizes and line heights while preserving the 20px research paper title size and existing Lato family.

**Architecture:** Make narrowly scoped numeric changes in the existing `stylesheet.css`; no markup, layout, breakpoint, content, or behavior changes are needed. Verify the exact typography contract before and after the edit and inspect the final diff for numeric-only scope.

**Tech Stack:** Static CSS3, ripgrep-based source-contract checks, Git diff verification

---

## File map

- Modify `stylesheet.css`: increase targeted font sizes by 1px and explicit line heights by 0.05 while exempting paper-title font sizes.

### Task 1: Increase text size and line height

**Files:**
- Modify: `stylesheet.css:77-109,133-171,228-255,315-351,383-398`

- [ ] **Step 1: Run the desired typography contract and verify it fails**

Run:

```bash
rg -q 'font-size: 15px;' stylesheet.css && \
rg -q 'line-height: 1\.65;' stylesheet.css && \
rg -q 'font-size: 23px;' stylesheet.css && \
rg -q 'font-size: 41px;' stylesheet.css && \
rg -q 'font-size: 29px;' stylesheet.css && \
rg -q 'line-height: 1\.60;' stylesheet.css && \
rg -q 'line-height: 1\.55;' stylesheet.css && \
rg -q 'line-height: 1\.35;' stylesheet.css && \
rg -q 'line-height: 1\.45;' stylesheet.css
```

Expected: exit status 1 because the increased typography values are not all present.

- [ ] **Step 2: Apply the minimal CSS changes**

Apply these exact declaration changes in `stylesheet.css`:

```diff
-  font-size: 14px;
-  line-height: 1.6;
+  font-size: 15px;
+  line-height: 1.65;

-  font-size: 22px;
+  font-size: 23px;

-  font-size: 40px;
+  font-size: 41px;

-  font-size: 28px;
+  font-size: 29px;

-  line-height: 1.55;
+  line-height: 1.6;

-  font-size: 13px;
+  font-size: 14px;

-  line-height: 1.5;
+  line-height: 1.55;

-  font-size: 14px;
+  font-size: 15px;

-  line-height: 1.3;
+  line-height: 1.35;

-  font-size: 13px;
-  line-height: 1.4;
+  font-size: 14px;
+  line-height: 1.45;
```

Apply the 13px-to-14px change to `.about-links`, `.research-authors`, `.research-links`, and `.tooltip .tooltiptext`. Apply the remaining 14px-to-15px changes to the base text rule, `strong`, `.news-show-more`, and `.research-venue`.

Do not change these paper-title declarations:

```css
.papertitle {
  font-size: 14px;
}

.research-title {
  font-size: 20px !important;
}
```

- [ ] **Step 3: Run the typography contract and verify it passes**

Run:

```bash
rg -Uq "body,[\\s\\S]*font-size: 15px;[\\s\\S]*line-height: 1\\.65;" stylesheet.css
rg -Uq "h2[\\s\\S]*font-size: 23px;" stylesheet.css
rg -Uq "name[\\s\\S]*font-size: 41px;" stylesheet.css
rg -Uq "\\.about-name[\\s\\S]*font-size: 29px;" stylesheet.css
rg -Uq "\\.about-text p[\\s\\S]*line-height: 1\\.6;" stylesheet.css
rg -Uq "\\.news-list li[\\s\\S]*line-height: 1\\.55;" stylesheet.css
rg -Uq "\\.research-title[\\s\\S]*font-size: 20px !important;[\\s\\S]*line-height: 1\\.35;" stylesheet.css
rg -Uq "\\.research-authors[\\s\\S]*font-size: 14px;[\\s\\S]*line-height: 1\\.45;" stylesheet.css
rg -Uq "\\.papertitle[\\s\\S]*font-size: 14px;" stylesheet.css
rg -q "font-family: 'Lato'" stylesheet.css
git diff --check
```

Expected: every command exits 0 with no whitespace errors.

- [ ] **Step 4: Review the final scope**

Run:

```bash
git diff -- stylesheet.css
git status --short
```

Expected: `stylesheet.css` is the only modified implementation file, and every diff hunk changes only a planned `font-size` or `line-height` number.

- [ ] **Step 5: Commit the typography adjustment**

```bash
git add stylesheet.css
git commit -m "Increase typography size and line height"
```

