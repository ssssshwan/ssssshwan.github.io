# Readable Typography Design

## Goal

Make the existing Lato typography slightly larger and more open across the site while keeping research paper titles at their current 20px size.

## Type size changes

Use a fixed 1px increase so the change remains subtle and predictable:

- Base body text, strong text, publication venues, and controls: 14px to 15px.
- Section headings: 22px to 23px.
- Legacy `name` element: 40px to 41px.
- About-name class: 28px to 29px; the active inline `2.7em` size also grows naturally because its inherited base grows from 14px to 15px.
- About links, research authors, research links, and tooltips: 13px to 14px.
- Research paper titles: remain exactly 20px.
- Legacy `.papertitle` rule: remain exactly 14px because it represents a paper title.

## Line-height changes

Increase each explicit line-height by 0.05:

- Global text: 1.60 to 1.65.
- About paragraphs: 1.55 to 1.60.
- News items: 1.50 to 1.55.
- Research paper titles: 1.30 to 1.35.
- Research author lists: 1.40 to 1.45.

These line-height changes apply at desktop and mobile widths because the current stylesheet uses the same typography rules at every breakpoint.

## Scope

- Modify only `stylesheet.css`.
- Preserve the Lato font family, layout, spacing margins, colors, content, media, and JavaScript behavior.
- Do not add a new mobile-only typography override.

## Verification

- Confirm every targeted declaration has its after-value and that no untargeted declaration changed.
- Confirm `.research-title` remains 20px and `.papertitle` remains 14px.
- Confirm Lato remains the active font family.
- Confirm the diff contains only the planned numeric typography changes and has no whitespace errors.
