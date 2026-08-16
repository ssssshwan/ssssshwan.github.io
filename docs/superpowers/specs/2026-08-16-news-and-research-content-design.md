# News and Research Content Design

## Goal

Refine the academic homepage content hierarchy without changing the existing Bootstrap-based visual system or paper data. Recent news should be concise by default, the research statement should introduce the publication list, and the biography should have clearer paragraph boundaries and an explicit UC San Diego link.

## Content Structure

### Biography

- Link the visible text `UC San Diego` to `https://ucsd.edu/`.
- Keep the current introduction, advisor, collaborator, and laboratory content together in the first paragraph.
- Move the sentence beginning `Previously, I was a research officer...` and the following KAIST sentence into a separate paragraph immediately below the introduction.
- Remove the research-goal paragraph from the biography area.

### Recent News

- Preserve all eight existing news entries and their current order and links.
- With JavaScript enabled, show the first three entries by default and hide the remaining five.
- Add one native button below the list. It reads `Show more` while collapsed and `Show less` while expanded.
- Keep `aria-expanded` synchronized with the visible state.
- Do not persist the state. A reload returns to the collapsed three-entry view.
- Keep all eight entries visible and hide the inactive toggle when JavaScript is unavailable.

### Research

- Rename the `Papers` heading to `Research` while retaining the section anchor and paper-filter DOM contract.
- Order the section as: `Research` heading, research-goal statement, paper note and `Selected / All` filter, then the paper list.
- Preserve the existing research-goal statement verbatim.
- Preserve all paper titles, authors, venues, awards, links, selected flags, and media behavior.

## Behavior

The News toggle will use the existing vanilla JavaScript file. Base HTML will not hide news entries; initialization will hide entries after the first three and reveal the toggle. Clicking the native button will switch all extra entries together and update its label and `aria-expanded` value. Native button keyboard handling provides Enter and Space support.

The existing paper filter remains independent. News state will not affect paper filtering or lazy media loading.

## Styling

Reuse the site's button language while keeping the News control visually lighter than the paper filter. Add only the spacing and state styles required for the News toggle. Existing Bootstrap breakpoints remain unchanged.

## Verification

- Confirm eight news entries remain in the document.
- Confirm initialization displays three entries, `Show more` displays all eight, and `Show less` restores three.
- Confirm `aria-expanded` and the button label update on every transition and reload starts collapsed.
- Confirm no-JavaScript markup exposes all eight news entries without an inert control.
- Confirm the biography has a UC San Diego link and a separate previous-work/education paragraph.
- Confirm `Research` precedes the unchanged research statement, paper note/filter, and all six papers.
- Re-run the existing paper-filter, media-loading, asset, HTML5, JavaScript, and diff checks.

## Out of Scope

- No news content, paper content, URLs, metadata, or media files will be added or removed.
- No persistent News state, Bootstrap JavaScript, jQuery, new site section, or navigation will be introduced.
