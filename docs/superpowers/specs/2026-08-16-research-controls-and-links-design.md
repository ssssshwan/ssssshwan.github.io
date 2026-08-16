# Research Controls and Links Design

## Goal

Simplify the Research section by replacing the right-aligned paper-filter buttons with a left-aligned inline text selector, and replace paper-link badges with plain slash-separated links. Preserve the existing default view and filtering behavior.

## Paper Filter

- Place the filter below `* indicates equal contribution.` and immediately above the paper list, aligned with the left edge of the section.
- Show the two options as `Selected / ALL` with no visible container, border, background, or icon.
- Match the selector and paper-link text to the surrounding body size with `1rem` typography.
- Keep `Selected` as the initial value.
- Indicate the active value with darker, slightly heavier text and a blue underline. Keep the inactive value in the site's normal link color.
- Keep a clearly visible keyboard focus treatment distinct from the selected treatment.

### Semantics and Interaction

- Implement the two mutually exclusive values as native radio inputs sharing one name, grouped in a `fieldset` with an accessible legend.
- Visually hide only the native radio circles; keep the associated text labels visible and clickable.
- Render the slash as non-interactive, presentation-only text.
- Let native radio behavior provide Tab, arrow-key, and Space-key interaction.
- Update the paper list on the radios' `change` event. `Selected` shows only entries whose `data-selected` value is `true`; `All` shows every entry.
- Keep the existing progressive-enhancement behavior: the selector is hidden until JavaScript initializes, while all paper entries remain available when JavaScript does not run.
- Preserve the current video pause, lazy-load, autoplay, and reduced-motion behavior as papers are hidden or revealed.

## Paper Links

- Replace each outlined, icon-bearing link badge with a normal text link.
- Display available links in this order: `Paper / Project Page / Code`.
- Add a slash only between links that exist, so partial sets read naturally, such as `Paper / Code` or `Paper`.
- Preserve every existing destination, new-tab behavior, and `rel="noopener noreferrer"` protection.
- Remove the Font Awesome stylesheet dependency if no icons remain elsewhere on the page.
- Use the site's existing link and hover colors. Do not add a border, background, pill shape, or decorative icon.

## Responsive Layout

- Keep the selector left-aligned at all viewport widths.
- Allow paper links to wrap naturally on narrow screens without clipping or horizontal scrolling.
- Preserve the current paper media and details layout and breakpoints.

## Verification

- Confirm the initial enhanced view shows only selected papers and marks `Selected` as checked.
- Confirm choosing `All` reveals every paper and choosing `Selected` hides non-selected papers again.
- Confirm keyboard navigation works through the native radio group and focus remains visible.
- Confirm the accessible group name and checked state are exposed without button or tab semantics.
- Confirm hidden-paper videos pause and revealed videos retain the existing lazy-load/play behavior.
- Confirm every paper presents its available links in the approved order with separators only between links.
- Confirm the link controls have no badge styling or icons and the Font Awesome dependency is absent when unused.
- Run the complete existing site test suite and inspect the rendered desktop and mobile layouts.

## Rationale

The inline text treatment fits the visual simplicity of an academic homepage and satisfies the requested left placement without adding another boxed control. Native radio semantics match the two mutually exclusive views and avoid the custom keyboard behavior required by ARIA tabs. The slash-separated paper links reduce visual weight and make publication metadata easier to scan.

## References

- W3C WAI-ARIA Authoring Practices, Radio Group Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/
- Nielsen Design System, Tabs: https://nielsendesignsystem.com/components/tabs/
- Academic homepage example using `Selected Publications` and `view all`: https://pb0316.github.io/

## Out of Scope

- No changes to research copy, paper titles, authors, venues, destinations, selection membership, paper order, or media assets.
- No additional paper filters, search, sorting, URL state, or saved filter preference.
