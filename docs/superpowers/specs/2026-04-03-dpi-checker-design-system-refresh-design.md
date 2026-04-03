# DPI Checker Design-System Refresh

Date: 2026-04-03

## Goal

Improve the UI quality of the DPI checker page so it feels polished and premium while keeping the site aligned as a directory of tools. The redesign must be driven primarily through shared components and shared design tokens so other tools that use the same surfaces also benefit.

The DPI checker is the proving ground, not a visual exception.

## Constraints

- Stay close to the existing getinside visual identity.
- Keep the mint brand accent as the primary accent.
- Avoid a one-off page redesign that only works for the DPI checker.
- Shared component changes are expected to propagate to other tools.
- Include button improvements that also fix readability and affordance issues on the barcode tool.

## Chosen Direction

Selected visual direction: `Editorial Mint`

This direction keeps the existing light, brand-forward UI but makes it feel more premium and deliberate through:

- stronger visual hierarchy
- better spacing rhythm
- softer layered surfaces
- clearer emphasis between primary and secondary content
- more readable and tactile controls

It should feel closer to a refined print studio interface than a generic utility app or dense dashboard.

## Problem Summary

The current DPI checker page works functionally but feels visually flat:

- the header is understated and does not establish a strong first impression
- repeated cards have similar visual weight, so the page lacks hierarchy
- upload and analysis sections do not feel connected
- controls and result blocks read as generic utility components instead of an intentional system

The barcode page confirms a shared-system issue:

- grouped ghost buttons are difficult to read
- option buttons lack strong active and hover states
- button styling is too weak for dense control clusters

These are design-system problems, not isolated view problems.

## Scope

### In Scope

- refresh shared page header treatment
- refresh shared result card treatment
- refresh shared button styles, especially ghost and grouped usage
- improve the shared image upload surface
- reorganize the DPI checker view inside the improved system
- verify improvements on the barcode page because it is a strong test case for shared buttons

### Out of Scope

- rebranding the site
- changing core information architecture across every tool
- rewriting unrelated tool logic
- adding new business features unrelated to presentation and usability

## Shared Component Design

### Tool Page Layout

`ToolPageLayout.vue` should evolve from a plain header card into a stronger editorial hero.

Design intent:

- preserve the back link, icon, title, description, and category badge
- add a more premium hero feeling with subtle layered background treatment
- increase spacing and improve vertical rhythm
- make the title block feel more intentional and less compressed
- keep the component generic enough for all tools

Expected outcome:

- every tool page gets a more polished opening section
- the site feels more cohesive without each view needing custom hero code

### Result Cards

`GiResultCard.vue` should become a calmer, more polished panel component.

Design intent:

- improve padding, header spacing, and surface depth
- use softer borders and subtle elevation instead of flat boxes
- support stronger visual hierarchy through card variants without becoming noisy
- maintain compatibility with current usage patterns and slots

Expected outcome:

- dense tools become easier to scan
- primary and secondary information blocks can be distinguished more clearly

### Buttons

Button styles in `global.css` should be refreshed across the shared system.

Design intent:

- keep primary buttons mint-forward and brand-aligned
- make ghost buttons more readable and more obviously interactive
- improve grouped button readability for selector-style controls
- give active states stronger fill or emphasis so selected options are unambiguous
- ensure hover, active, and focus states remain accessible

Barcode-specific implication:

- export format buttons and size preset buttons on the barcode page should feel like intentional control chips or segmented controls, not thin outline placeholders

Expected outcome:

- controls become easier to read and use across the directory
- barcode directly benefits without custom one-off button styling

### Image Upload

`GiImageUpload.vue` should be redesigned as a more intentional intake surface.

Design intent:

- visually connect paste and upload interactions
- increase perceived quality with refined spacing, background layering, and clearer affordance
- preserve current functionality and event API
- remain reusable for image-based tools beyond the DPI checker

Expected outcome:

- upload-driven tools feel more premium from the first interaction

## DPI Checker View Design

The DPI checker should use the improved shared system while keeping its current core workflow.

### Structure

The top section becomes a focused analysis stage:

- improved hero from `ToolPageLayout`
- upgraded upload surface from `GiImageUpload`
- manual size inputs
- compact summary snapshot that immediately communicates print quality

Below that, the current content remains but with stronger hierarchy:

- print dimensions result block gets strongest emphasis
- format compatibility follows as supporting decision information
- recommended uses becomes clearer and more editorial
- visual comparison stays, but should feel integrated rather than tacked on
- educational content remains collapsible and more visually secondary

### Hierarchy Rules

- first insight should be immediately visible after input
- not every card should compete equally for attention
- educational/help content should not visually overpower operational content
- status color use should stay disciplined: mint or green for success, warm tones for caution, red only for genuine failure

### Visual Tone

The DPI checker should feel:

- premium
- calm
- print-oriented
- brand-consistent

It should not feel:

- dark dashboard-like
- playful or overly warm
- disconnected from the rest of the tool directory

## Barcode Validation Target

The barcode tool is a required validation surface for this refresh.

Why:

- it uses several grouped buttons and control clusters
- current ghost buttons have weak readability and weak state distinction
- if the refreshed button system works there, it is likely robust enough for the broader directory

Expected improvements on barcode:

- clearer grouped controls
- stronger selected state
- better contrast and legibility
- more premium control feel without view-specific redesign

## Data Flow And Behavior

No business logic changes are required for the design refresh.

Behavioral expectations:

- existing props, slots, and emits of shared components should remain compatible where possible
- any API changes to shared components should be minimal and deliberate
- tool behavior should remain intact; changes should primarily affect presentation, hierarchy, and usability

## Testing Strategy

### Unit Tests

- update component tests only where shared component behavior or structure changes require it
- avoid unnecessary churn in unrelated tests

### Browser Verification

Manual verification is required for:

- DPI checker page
- barcode page

Verification focus:

- button readability and active states
- responsive layout on desktop and mobile
- hierarchy and spacing
- upload surface appearance
- no obvious regressions in interactive behavior

## Implementation Notes

- start from shared components and shared styles before tuning the DPI checker view
- avoid introducing a DPI-checker-only aesthetic layer unless a small local adjustment is truly necessary
- if view-specific styling is added, it should serve layout composition rather than compensate for weak shared primitives

## Success Criteria

The refresh is successful if:

- the DPI checker looks materially more polished and premium
- the updated UI still feels unmistakably part of getinside Tools
- shared component updates improve other tools automatically
- barcode buttons become easier to read and nicer to use
- the redesign improves hierarchy without disrupting workflows
