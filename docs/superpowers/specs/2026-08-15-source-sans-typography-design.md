# Source Sans Pro Typography Design

## Goal

Update the site typography to match the font family, type scale, and responsive sizing used by `wenlonghuang.com`, while preserving the current page content, colors, layout, and interaction behavior.

## Font loading

- Load Source Sans Pro from Google Fonts in `index.html` with `font-display: swap` behavior.
- Request the weights and styles used by the site: 400, 600, 700, 400 italic, and 700 italic.
- Use this fallback stack after Source Sans Pro: Apple and Windows system sans-serif fonts, Korean system sans-serif fonts, Arial, then generic `sans-serif`.
- If the web font cannot load, content remains readable through the fallback stack without changing the page structure.

## Desktop type scale

The default desktop rules apply above 700px:

- Body text, authors, venues, links, and controls: 15.4px with 155% line height.
- Section headings: 22px.
- Research paper titles: 17px.
- Profile name: 32px with 130% line height.
- Korean name beside the profile name: 50% of the profile-name size.
- Dedicated annotations, if present: 13px.

Font weights retain their current semantic intent: regular text uses 400, medium emphasis uses 600, and strong or title emphasis uses 700. The current Lato-specific fixed 14px rules will be removed or changed to inherit so they do not override the new scale.

## Mobile type scale

At viewport widths of 700px and below, match the reference site's responsive type scale:

- Body text, authors, venues, links, and controls: 15px with 155% line height.
- Section headings: 20px.
- Research paper titles: 17px.
- Profile name: 28px with 130% line height.
- Korean name beside the profile name: 50% of the profile-name size.

The existing mobile layout, image sizing, card stacking, and spacing remain unchanged unless a typography-induced overflow requires a narrowly scoped wrapping fix.

## Files and implementation boundaries

- `index.html`: add the font-loading links and remove the inline profile-name font-size override.
- `stylesheet.css`: replace Lato declarations with the new stack, apply the desktop type scale, and add the 700px mobile overrides.
- Do not alter page copy, colors, media, card dimensions, navigation, or JavaScript behavior.

## Verification

- Confirm no active `Lato` declarations or unintended fixed 14px typography rules remain.
- Confirm all requested Source Sans Pro weights and italics are loaded.
- Inspect desktop and 700px-or-narrower rendering for unexpected wrapping, clipping, or horizontal overflow.
- Verify the existing news toggle and responsive research cards still behave as before.

