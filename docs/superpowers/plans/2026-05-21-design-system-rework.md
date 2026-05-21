# Design System Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing teal-branded design with the getinside internal design system — black/yellow palette, Inter-only typography, metric units throughout.

**Architecture:** All changes are CSS/template-only across 5 files. Global tokens cascade to all 30 tool views automatically. No new files, no composable changes, no routing changes. Dark mode is preserved but cleaned of teal references.

**Tech Stack:** Vue 3, Vite 5, scoped `<style>` blocks, CSS custom properties in `global.css`

---

## Reference: Design Tokens (new values)

| Token / property | Old value | New value |
|---|---|---|
| Body bg | `#faf9f7` | `#F7F6F3` |
| Surface (cards, header, footer) | `#ffffff` | `#FFFFFF` (unchanged) |
| Primary text | `#1a1a1a` | `#0D0D0C` |
| Muted text | `#6b7280` | `#5E5D55` |
| Border default | `#e8e6e1` | `#DBDAD7` |
| Border hover | `#d4d2cd` | `#5E5D55` |
| Brand/interactive | `#0aaa8e` (teal) | `#0D0D0C` (black) |
| Accent highlight | `#6AE7C8` (mint) | `#FCF758` (yellow) |
| Hero bg | `linear-gradient(teal-fade → transparent)` | `#F7F6F3` plain |
| Primary button bg | teal | `#0D0D0C` |
| Primary button text | white | `#F8F8F7` |
| Card icon default bg | `brand-fade` (teal-tinted) | `#F7F6F3` with `#DBDAD7` border |
| Card icon default color | teal | `#5E5D55` |
| Card icon hover bg | — | `#FCF758` |
| Card icon hover color | — | `#0D0D0C` |
| Tool page icon box | `brand-fade` / teal | white `#FFFFFF` with `#DBDAD7` border |
| About panel accent bar | teal | `#FCF758` |
| Logo badge bg | `#6AE7C8` mint | `#FCF758` yellow |
| Tab active indicator | pill with teal bg | bottom-border `#0D0D0C` |
| Search focus border | teal | `#0D0D0C` |
| Heading font | `'Garnett', 'Inter'` | `'Inter'` only |

---

## File Map

| File | Change type |
|---|---|
| `src/assets/styles/global.css` | Token values, `.gi-btn`, `.gi-result`, `.gi-btn-ghost` utility classes |
| `src/components/AppHeader.vue` | Logo badge color, search focus, toggle hover |
| `src/components/AppFooter.vue` | Remove quick-access links section; simplify footer to logo+contacts/copyright layout |
| `src/components/ToolPageLayout.vue` | Icon box, category badges, title font, about panel accent bar + uniform white bg |
| `src/views/HomeView.vue` | Hero bg/gradient/font, icon boxes, tab bar active style, card hover |

---

## Task 1: Update CSS Design Tokens in `global.css`

**Files:**
- Modify: `src/assets/styles/global.css`

This is the foundation — all scoped styles in components use these vars, so getting the tokens right first means the component tasks are surgical.

- [ ] **Step 1.1: Update `:root` colour tokens**

In `src/assets/styles/global.css`, replace the entire `:root { … }` brand/colour block (lines ~22–160). The spacing, radius, transition, and layout vars stay unchanged. Only these vars change:

```css
/* In :root { } */

/* Remove entirely — no replacement: */
/* --gi-brand, --gi-brand-dark, --gi-brand-light, --gi-brand-fade */
/* --gi-mint */
/* --gi-shadow-glow */

/* Add/replace: */
--gi-accent: #FCF758;        /* yellow — used for highlights, badges, about bar */
--gi-black: #0D0D0C;         /* primary interactive + heading colour */

--gi-bg: #F7F6F3;            /* was #faf9f7 */
--gi-bg-soft: #F8F8F7;       /* was #f5f4f2 */
--gi-surface: #FFFFFF;       /* unchanged */

--gi-border: #DBDAD7;        /* was #e8e6e1 */
--gi-border-hover: #5E5D55;  /* was #d4d2cd */
--gi-border-strong: #0D0D0C; /* was #c9c6c2 */

--gi-text: #0D0D0C;          /* was #1a1a1a */
--gi-text-muted: #5E5D55;    /* was #6b7280 */
--gi-text-inverse: #F8F8F7;  /* was #FFFFFF — now warm white */

/* Tint tokens that referenced brand: replace green tint to neutral */
--gi-tint-green-bg: #D8EEE0;      /* DS green-light, used for print category */
--gi-tint-green-text: #154D2F;    /* DS green-dark */
--gi-tint-green-border: #B8DEC9;
```

Also remove the `--gi-shadow-glow` line entirely (it referenced teal rgba).

- [ ] **Step 1.2: Update dark mode tokens**

In `[data-theme="dark"] { … }`, remove any rgba values referencing `10, 170, 142` (teal). Specifically:
- Remove `--gi-shadow-glow` line
- In dark mode `.gi-btn-ghost.is-active`, change any teal box-shadow rgba to black-based:

```css
/* Find and replace these in the dark mode block: */

/* REMOVE: */
--gi-shadow-glow: 0 0 24px rgba(10, 170, 142, 0.4);

/* In [data-theme="dark"] .gi-btn-ghost.is-active — replace the box-shadow value: */
/* OLD: box-shadow: 0 0 0 1px var(--gi-brand), 0 2px 4px rgba(10, 170, 142, 0.2); */
/* NEW: */
box-shadow: 0 0 0 1px #0D0D0C, 0 2px 4px rgba(13, 13, 12, 0.15);
```

- [ ] **Step 1.3: Update `.gi-btn` utility class (primary button)**

```css
.gi-btn {
  /* same display, gap, padding, border-radius, font as before */
  background: #0D0D0C;          /* was var(--gi-brand) */
  color: #F8F8F7;               /* was var(--gi-text-inverse) */
  border: 1px solid transparent;
  /* keep rest unchanged */
}

.gi-btn:hover {
  background: #5E5D55;          /* was var(--gi-brand-dark) */
  transform: translateY(-1px);
  box-shadow: var(--gi-shadow);
}

.gi-btn:focus-visible {
  outline: 2px solid #0D0D0C;   /* was var(--gi-brand) */
  outline-offset: 2px;
}
```

- [ ] **Step 1.4: Update `.gi-btn-ghost` active state**

```css
.gi-btn-ghost.is-active {
  background: #FCF758;           /* was var(--gi-brand-fade) */
  color: #0D0D0C;                /* was var(--gi-brand-dark) */
  border-color: #0D0D0C;         /* was var(--gi-brand) */
  box-shadow: 0 0 0 1px #0D0D0C; /* was teal-tinted */
}

.gi-btn-ghost:focus-visible {
  outline: 2px solid #0D0D0C;   /* was var(--gi-brand) */
  outline-offset: 2px;
}
```

- [ ] **Step 1.5: Update `.gi-result` utility class**

```css
.gi-result {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);  /* was var(--gi-mint) — no more mint */
  border-radius: var(--gi-radius-lg);
  padding: 1.25rem 1.5rem;
  margin-top: 1.5rem;
}

.gi-result-label {
  color: var(--gi-text-muted);  /* was var(--gi-brand) */
}
```

- [ ] **Step 1.6: Remove Garnett `@font-face` declarations**

Delete the two `@font-face` blocks at the top of the file (Garnett-Semibold.woff and Garnett-Bold.woff). The Inter import stays. This avoids a 404 network request for fonts that are no longer referenced.

- [ ] **Step 1.7: Run tests and build**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk npm run test -- --run 2>&1 | tail -5
rtk npm run build 2>&1 | tail -10
```

Expected: all Vitest tests pass, build succeeds.

- [ ] **Step 1.8: Commit**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk git add src/assets/styles/global.css
rtk git commit -m "design: replace teal tokens with black/yellow design system

- Remove --gi-brand/mint/brand-fade/shadow-glow (teal references)
- Add --gi-accent (#FCF758) and --gi-black (#0D0D0C)
- Update bg (#F7F6F3), border (#DBDAD7), text (#0D0D0C/#5E5D55) tokens
- .gi-btn now black; .gi-btn-ghost active now yellow
- .gi-result border no longer mint
- Remove unused Garnett @font-face declarations"
```

---

## Task 2: Update `AppHeader.vue`

**Files:**
- Modify: `src/components/AppHeader.vue` (scoped `<style>` block only)

- [ ] **Step 2.1: Fix logo badge background**

In `AppHeader.vue`, find `.gi-logo-badge` and change:

```css
.gi-logo-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: #FCF758;   /* was var(--gi-mint) */
  color: #0D0D0C;        /* was #1a1a1a */
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

- [ ] **Step 2.2: Fix search input focus**

```css
.gi-header-search-input:focus {
  outline: none;
  border-color: #0D0D0C;                        /* was var(--gi-brand) */
  box-shadow: 0 0 0 3px rgba(13, 13, 12, 0.08); /* was var(--gi-brand-fade) */
}
```

- [ ] **Step 2.3: Fix toggle hover state**

```css
.gi-header-toggle:hover,
.gi-lang-toggle:hover {
  border-color: #5E5D55;   /* was var(--gi-brand) */
  color: #0D0D0C;          /* was var(--gi-brand) */
}
```

- [ ] **Step 2.4: Run tests and commit**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk npm run test -- --run 2>&1 | tail -5
rtk git add src/components/AppHeader.vue
rtk git commit -m "design: update AppHeader to black/yellow palette

- Logo badge: mint → yellow (#FCF758)
- Search focus: teal border/glow → black (#0D0D0C)
- Toggle hover: teal → dark (#5E5D55/#0D0D0C)"
```

---

## Task 3: Rework `AppFooter.vue`

**Files:**
- Modify: `src/components/AppFooter.vue`

The current footer has three sections: (1) logo+tagline+toggles inner, (2) quick-access links, (3) bottom bar. The approved mockup simplifies this to: (1) main area with logo+contact info on left, copyright on right — the quick-access links section is removed entirely (it used teal colours).

- [ ] **Step 3.1: Replace the `<template>` block**

Replace the entire `<template>` content with:

```html
<template>
  <footer class="gi-footer">
    <div class="gi-footer-inner">
      <!-- Left: Logo + contacts -->
      <div class="gi-footer-left">
        <a href="https://www.getinside.fr/" class="gi-footer-logo-link">
          <img :src="`${base}logo-getinside.svg`" alt="getinside" class="gi-footer-logo-img" />
          <span class="gi-footer-logo-badge">tools</span>
        </a>
        <div class="gi-footer-contacts">
          <span>
            <strong>Opérations</strong> ·
            <a href="mailto:benoit@getinside.fr">benoit@getinside.fr</a>
          </span>
          <span>
            <strong>Studio</strong> ·
            <a href="mailto:studio@getinside.fr">studio@getinside.fr</a>
          </span>
        </div>
      </div>

      <!-- Right: Copyright + toggles -->
      <div class="gi-footer-right">
        <div class="gi-footer-toggles">
          <button
            class="gi-footer-toggle"
            @click="toggleLocale"
            :aria-label="t('footer.toggleLanguage')"
            :aria-pressed="locale === 'fr'"
          >{{ locale === 'fr' ? 'EN' : 'FR' }}</button>
          <button
            class="gi-footer-toggle"
            @click="toggleTheme"
            :aria-label="t('footer.toggleTheme')"
            :aria-pressed="theme === 'dark'"
          >
            <SunIcon v-if="theme === 'light'" :size="16" />
            <MoonIcon v-else :size="16" />
          </button>
        </div>
        <p class="gi-footer-copyright">{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>
```

- [ ] **Step 3.2: Simplify the `<script setup>` — remove unused imports**

Remove the `Scale, Link2, Printer, FileText` icon imports (they were only used by the quick-access links). Keep `Sun as SunIcon, Moon as MoonIcon`.

```ts
import { Sun as SunIcon, Moon as MoonIcon } from 'lucide-vue-next'
```

- [ ] **Step 3.3: Replace the `<style scoped>` block**

```css
<style scoped>
.gi-footer {
  background: #FFFFFF;
  border-top: 1px solid #DBDAD7;
  margin-top: 4rem;
  padding: 2.5rem 2rem;
}

.gi-footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 2rem;
}

/* Left */
.gi-footer-left {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.gi-footer-logo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #0D0D0C;
}

.gi-footer-logo-img {
  height: 24px;
  width: auto;
  display: block;
}

.gi-footer-logo-badge {
  font-size: 0.7rem;
  font-weight: 700;
  background: #FCF758;
  color: #0D0D0C;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.gi-footer-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  font-size: 0.875rem;
  color: #5E5D55;
  line-height: 1.6;
}

.gi-footer-contacts strong {
  color: #0D0D0C;
  font-weight: 600;
}

.gi-footer-contacts a {
  color: #0D0D0C;
  text-decoration: underline;
  text-decoration-color: #DBDAD7;
  text-underline-offset: 3px;
  font-weight: 500;
  transition: text-decoration-color 0.15s;
}

.gi-footer-contacts a:hover {
  text-decoration-color: #0D0D0C;
}

/* Right */
.gi-footer-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.gi-footer-toggles {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gi-footer-toggle {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid #DBDAD7;
  border-radius: 8px;
  background: transparent;
  color: #5E5D55;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}

.gi-footer-toggle:hover {
  border-color: #5E5D55;
  color: #0D0D0C;
}

.gi-footer-copyright {
  font-size: 0.75rem;
  color: #5E5D55;
  line-height: 1.6;
  text-align: right;
}

@media (max-width: 720px) {
  .gi-footer-inner {
    grid-template-columns: 1fr;
  }
  .gi-footer-right {
    align-items: flex-start;
  }
  .gi-footer-copyright {
    text-align: left;
  }
}
</style>
```

- [ ] **Step 3.4: Run tests and commit**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk npm run test -- --run 2>&1 | tail -5
rtk git add src/components/AppFooter.vue
rtk git commit -m "design: simplify AppFooter to logo+contacts layout

- Remove quick-access links section (teal-based)
- Footer: logo+contacts left, toggles+copyright right
- Yellow badge, black text, #DBDAD7 border palette
- Remove unused icon imports (Scale, Link2, Printer, FileText)"
```

---

## Task 4: Update `ToolPageLayout.vue`

**Files:**
- Modify: `src/components/ToolPageLayout.vue` (scoped `<style>` block only)

- [ ] **Step 4.1: Fix tool icon box**

```css
.tool-icon {
  width: 48px;
  height: 48px;
  background: #FFFFFF;          /* was var(--gi-brand-fade) */
  color: #0D0D0C;               /* was var(--gi-brand) */
  border: 1px solid #DBDAD7;    /* ADD border */
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

- [ ] **Step 4.2: Fix default category badge and per-category colours**

```css
/* Default (print) */
.tool-category-badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.15em 0.55em;
  border-radius: var(--gi-radius-pill);
  background: #D8EEE0;          /* DS green-light */
  color: #154D2F;               /* DS green-dark */
  margin-bottom: 0.4rem;
}

/* marketing — indigo tint */
.tool-category-badge--marketing {
  background: #DDE3F5;
  color: #1A2F7A;
}

/* images — orange tint */
.tool-category-badge--images {
  background: #FDE8CD;
  color: #7E4A0D;
}

/* couleurs — purple tint */
.tool-category-badge--couleurs {
  background: #F3E7FF;
  color: #430658;
}

/* contenu — slate tint */
.tool-category-badge--contenu {
  background: #E5E7EB;
  color: #374151;
}

/* design — keep existing purple */
.tool-category-badge--digital {
  background: #E5E7EB;
  color: #374151;
}

.tool-category-badge--design {
  background: #F3E7FF;
  color: #430658;
}
```

- [ ] **Step 4.3: Fix title font (remove Garnett)**

```css
.tool-title {
  font-family: 'Inter', system-ui, sans-serif;  /* was 'Garnett', 'Inter', … */
  font-size: var(--gi-font-size-2xl);
  font-weight: 700;
  line-height: 1.15;
  color: var(--gi-text);
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
}
```

- [ ] **Step 4.4: Fix back link hover**

```css
.tool-back-link:hover {
  color: #0D0D0C;   /* was var(--gi-brand) */
}

.tool-back-link:focus-visible {
  outline: 2px solid #0D0D0C;  /* was var(--gi-brand) */
  outline-offset: 2px;
  border-radius: 2px;
}
```

- [ ] **Step 4.5: Fix about panel — remove tinted category variants, add yellow accent bar**

Remove the `.tool-about--print`, `.tool-about--digital`, `.tool-about--design` rules. Replace with:

```css
/* About Panel — uniform white, yellow accent bar */
.tool-about {
  border: 1px solid #DBDAD7;   /* was var(--gi-border) */
  border-radius: var(--gi-radius-lg);
  padding: 1.5rem 1.75rem;
  margin-top: 2rem;
  background: #FFFFFF;          /* always white, no category tints */
}

/* Remove these entirely: */
/* .tool-about--print { } */
/* .tool-about--digital { } */
/* .tool-about--design { } */

.tool-about-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-about-label::before {
  content: '';
  display: block;
  width: 4px;
  height: 14px;
  background: #FCF758;  /* was var(--gi-brand) — now yellow */
  border-radius: 2px;
  flex-shrink: 0;
}

.tool-about-label span {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #5E5D55;   /* was var(--gi-text) */
}
```

- [ ] **Step 4.6: Run tests and commit**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk npm run test -- --run 2>&1 | tail -5
rtk git add src/components/ToolPageLayout.vue
rtk git commit -m "design: update ToolPageLayout to black/yellow design system

- Tool icon box: brand-fade bg → white with #DBDAD7 border
- Category badges: DS category colours (green/indigo/orange/purple/slate)
- Title font: Garnett removed, Inter only
- Back link hover: teal → black
- About panel: uniform white bg, yellow (#FCF758) accent bar, no category tints"
```

---

## Task 5: Update `HomeView.vue`

**Files:**
- Modify: `src/views/HomeView.vue` (scoped `<style>` block only — no template/script changes)

- [ ] **Step 5.1: Fix hero section**

```css
/* Hero background: remove teal gradient */
.home-hero {
  width: 100%;
  padding: 5rem 1.5rem 4.5rem;
  text-align: center;
  border-bottom: 1px solid #DBDAD7;  /* was var(--gi-border) */
  background: #F7F6F3;               /* was linear-gradient(teal-fade → transparent) */
}

/* Hero title: remove Garnett */
.home-hero-title {
  font-family: 'Inter', system-ui, sans-serif;  /* was 'Garnett', 'Inter', … */
  font-size: clamp(2.25rem, 4vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #0D0D0C;  /* was var(--gi-text) */
  margin: 0 0 1rem;
  line-height: 1.05;
}
```

- [ ] **Step 5.2: Fix hero CTA buttons**

The `.home-hero-cta` class currently relies on `.gi-btn` (teal). That global class is now black (from Task 1), so the hero primary button is already correct. Only the ghost/link secondary button needs a fix:

```css
/* Hero secondary link — currently .home-hero-link */
.home-hero-link {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #5E5D55;        /* was var(--gi-text-muted) — keep muted */
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 0.15s;
}

.home-hero-link:hover {
  color: #0D0D0C;        /* was var(--gi-brand) */
}
```

- [ ] **Step 5.3: Fix card icon boxes**

```css
/* Icon box default: neutral bg with border */
.home-icon-box {
  width: 36px;
  height: 36px;
  background: #F7F6F3;       /* was var(--gi-brand-fade) */
  border: 1px solid #DBDAD7; /* ADD */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5E5D55;             /* was var(--gi-brand) */
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  flex-shrink: 0;
}

/* Icon box on hover: yellow */
.home-card:hover .home-icon-box {
  background: #FCF758;
  border-color: #FCF758;
  color: #0D0D0C;
}
```

- [ ] **Step 5.4: Fix card hover border and "try now" cta**

```css
/* Card hover: border to #5E5D55, not black */
.home-card {
  background: #FFFFFF;
  border: 1px solid #DBDAD7;
  border-radius: 12px;
  /* keep rest as-is */
}

.home-card:hover {
  border-color: #5E5D55;     /* was var(--gi-brand) or black */
  transform: translateY(-2px);
  box-shadow: 0 4px 4px -1px rgba(12, 12, 13, 0.1);
}

/* "Try now" / card-cta */
.home-card-cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: #5E5D55;           /* was var(--gi-brand) */
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 0.25rem;
  transition: color 0.15s;
}

.home-card:hover .home-card-cta {
  color: #0D0D0C;
}
```

- [ ] **Step 5.5: Fix top-tools section cards**

The top-tools strip uses a cream-bg card variant. Update:

```css
.home-card--top {
  background: #F7F6F3;    /* cream, not white */
  border-color: transparent;
}

.home-card--top:hover {
  background: #FFFFFF;
  border-color: #5E5D55;
}
```

- [ ] **Step 5.6: Fix tab bar active state**

The current tabs use `.gi-btn-ghost` pill buttons. The mockup uses an underline-style tab bar. Change the active tab style:

```css
/* Tab bar — underline style */
.home-tab-bar {
  display: flex;
  border-bottom: 1px solid #DBDAD7;
  background: #F7F6F3;
  position: sticky;
  top: 56px;
  z-index: 40;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 0;
}

.home-tab {
  padding: 10px 18px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: none;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: #5E5D55;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 0;
  transition: color 0.15s, border-color 0.15s;
}

.home-tab:hover {
  color: #0D0D0C;
}

.home-tab.active,
.home-tab[aria-selected="true"] {
  color: #0D0D0C;
  font-weight: 700;
  border-bottom-color: #0D0D0C;
  background: none;      /* override any gi-btn-ghost active bg */
  box-shadow: none;      /* override gi-btn-ghost active shadow */
}
```

- [ ] **Step 5.7: Fix category headers and browse section**

```css
/* Section heading font */
.home-hero h1,
.home-browse h2 {
  font-family: 'Inter', system-ui, sans-serif;
}

/* Category headers in browse grid */
.home-cat-header {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #5E5D55;
  margin: 2.5rem 0 1rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #DBDAD7;
}
```

- [ ] **Step 5.8: Run tests and build**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk npm run test -- --run 2>&1 | tail -5
rtk npm run build 2>&1 | tail -10
```

Expected: all tests pass, build succeeds with no errors.

- [ ] **Step 5.9: Commit**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk git add src/views/HomeView.vue
rtk git commit -m "design: update HomeView to black/yellow design system

- Hero: remove teal gradient, plain #F7F6F3 bg, Inter font only
- Card icon boxes: teal-fade → cream with border; yellow on hover
- Card hover border: teal → #5E5D55
- Card CTA 'try now': teal → #5E5D55, black on hover
- Tab bar: pill buttons → underline style, active = black bottom-border
- Category headers: DS typography"
```

---

## Task 6: Final verification + push

- [ ] **Step 6.1: Start dev server and do visual review**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk npm run dev
```

Open http://localhost:5173/tools/ and verify:
- [ ] No teal (`#0aaa8e`) anywhere (search in DevTools)
- [ ] Hero: cream bg, black text, yellow eyebrow pill, black primary button
- [ ] Cards: white, border hover #5E5D55, icon box turns yellow on hover
- [ ] Tab bar: underline style, active = bold + black bottom border
- [ ] Header: yellow badge, search focuses with black border
- [ ] Footer: logo + contacts left, toggles + copyright right — no teal links
- [ ] Tool page (e.g. /tools/#/paper-weight): white icon box, yellow about bar, category pill badges
- [ ] Dark mode: toggle works, no teal visible

- [ ] **Step 6.2: Push**

```bash
cd "/Users/benoitprentout/github repos/tools"
rtk git push
```

GitHub Actions will build and deploy to https://getinside-ops.github.io/tools/
