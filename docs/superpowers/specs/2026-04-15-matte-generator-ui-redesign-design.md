# Matte Generator UI Redesign

Date: 2026-04-15
Status: Approved for planning

## Goal

Improve the Matte Generator so it gives clearer guidance to non-designers and presents a more polished, intentional interface without turning into a heavy editor.

## Problem Summary

The current tool is functionally correct but presents itself as a raw parameter form:

- users upload first, then face a generic control stack
- export formats are hidden in a select without enough context
- styling choices do not explain their effect or intended use
- the preview area does not establish a strong artboard/studio feel
- mobile behavior is usable but not intentionally guided

This makes the tool feel more technical than creative and gives too little support to users who do not already understand output formats or framing choices.

## Outcome

Redesign the tool as a guided, two-step workspace inside the existing `ToolPageLayout` shell:

1. `Format`
2. `Style`

The resulting page should remain lightweight and single-screen, but feel more editorial and self-explanatory.

## Design Principles

- Guidance over raw control density
- Visual hierarchy over generic form stacking
- Strong preview presence so the matte effect is immediately legible
- Fast path for default use, with enough control for refinement
- Mobile layout that preserves clarity and a visible primary action

## Proposed Experience

### Entry State

Before upload, the page keeps the existing header and upload entry point, but the editor area should preview the workflow rather than appearing blank.

The empty state should communicate:

- what the tool creates
- the two-step process
- the kinds of outputs users can generate

This keeps the page instructive before any interaction.

### Step 1: Format

After upload, the control area becomes a workflow panel with a visible stepper:

- `1. Format`
- `2. Style`

Step 1 replaces the plain `<select>` with visual preset cards. Each preset card includes:

- output name
- exact dimensions
- short usage guidance
- small aspect-ratio thumbnail or ratio block

Initial presets:

- Auto
- Instagram Post
- Story
- Twitter Header
- Open Graph

Behavior:

- the current default format is auto-selected after upload
- users can change the format at any time
- format changes regenerate the preview automatically

### Step 2: Style

Step 2 becomes a group of focused styling modules rather than a flat stack of fields.

Required controls:

- padding
- background color
- background pattern

Presentation:

- each control group includes a short explanation
- padding explains visual breathing room
- background color supports both quick-pick swatches and custom input
- pattern uses plain-language names and descriptions

Pattern naming should favor clarity over implementation labels. For example:

- Clean
- Editorial Grid
- Subtle Dots
- Soft Stripes

Exact UI labels can still map to the current internal values.

### Preview Area

The preview should become the centerpiece of the experience.

Layout intent:

- large preview artboard on the left on desktop
- workflow panel on the right
- stacked layout on mobile with preview first

Visual treatment:

- soft studio-like background surface
- deliberate framing around the output
- stronger sense of “artboard” than “image in a card”
- restrained shadows and contrast that make the matte effect readable

Supporting UI near the preview:

- compact summary row
- selected format
- padding value
- color hex
- pattern label

This creates confidence about what will be exported.

### Actions

The primary action becomes a stronger export CTA:

- `Generate & Download`

Secondary action:

- reset or cancel, visually de-emphasized

Action behavior:

- preview updates automatically when settings change
- CTA stays available once a valid preview exists
- mobile should keep the primary action obvious near the end of the control flow

## Interaction Model

### Loading and Updating

Preview generation continues to be automatic, but the interface must acknowledge that work explicitly.

States:

- empty
- generating preview
- ready
- error

The generating state should show lightweight copy such as “Updating preview…” rather than leaving the preview ambiguous.

### Error Handling

Failures should appear inline in the editor rather than silently or only through generic text.

Desired behavior:

- upload validation remains near the upload area
- generation failures appear in a visible status card within the workspace
- reset path remains obvious

### Mobile Behavior

On mobile:

- preview appears before controls
- format cards remain tappable and legible
- the workflow panel remains sequential and readable
- the primary CTA is easy to find after styling selections

No separate mobile flow is needed; this is a layout adaptation, not a product split.

## Visual Direction

The redesign should feel like a lightweight creative studio, not a dashboard and not a generic settings form.

Desired traits:

- polished
- calm
- editorial
- intentionally composed

Avoid:

- over-animated behavior
- flashy “builder” visuals
- dense enterprise form styling
- a visual language disconnected from the existing site shell

## Implementation Scope

In scope:

- restructure `MatteGeneratorView.vue`
- add a visible two-step workflow panel
- replace format select with preset cards
- improve preview presentation and state handling
- improve action hierarchy
- add supporting copy and labels in i18n
- ensure responsive behavior is intentionally designed

Likely optional:

- adding a small reusable preset-card pattern if the implementation benefits from extraction

Out of scope:

- changing the matte generation algorithm
- adding drag-and-drop repositioning or canvas editing
- adding new export targets beyond the current set
- introducing a separate route or wizard page

## Testing Strategy

Implementation should include:

- unit coverage updates for any extracted selection or view-state logic
- component-level checks for the new step flow where practical
- responsive/manual verification for desktop and mobile layouts
- validation that preview regeneration still works when format and style inputs change

## Open Decisions Resolved

- The redesign should prioritize clearer guidance and stronger visual polish.
- A more structured two-step flow is acceptable.
- The experience should remain within a single page rather than becoming a full editor.

## Recommended Next Step

Write an implementation plan for the redesigned view, including:

- component structure
- state model
- i18n changes
- responsive behavior
- verification steps
