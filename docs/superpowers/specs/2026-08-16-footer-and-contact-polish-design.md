# Footer and Contact Polish Design

## Goal

Apply four small presentation refinements to the approved homepage without changing its layout, interactive behavior, or research content.

## Changes

### Contact

- Keep the visible contact string `Email: suk063 AT ucsd.edu` in the profile header.
- Remove its `mailto:` hyperlink so `suk063 AT ucsd.edu` is plain text.

### Research Note

- Remove only `Papers sorted by recency.`.
- Retain `* indicates equal contribution.` in the existing `papers-note` element and position.

### Korean Name

- Increase `.korean-name` from `0.55em` to `0.65em`.
- Preserve its current color, weight, spacing, and no-wrap behavior.

### Template Acknowledgement

- Add a small acknowledgement at the bottom of the existing footer, after the Clustrmaps visitor map.
- Use the visible text `Template based on this website` without a person's name.
- Link only `this website` to `https://haozhiqi.github.io/`.
- Style it as muted secondary text with compact spacing so it does not compete with the main content.

## Verification

- Confirm no `mailto:` link remains and the visible email text is unchanged.
- Confirm the recency sentence is absent while the equal-contribution note remains.
- Confirm `.korean-name` uses `0.65em`.
- Confirm the acknowledgement follows the visitor map within the footer, uses the approved link and visible text, and does not display `Haozhi` or `Qi`.
- Re-run all News, Research, paper-filter, media, asset, HTML5, JavaScript, and diff checks.

## Out of Scope

- No content, URL, filter behavior, media behavior, metadata, or responsive breakpoint changes.
