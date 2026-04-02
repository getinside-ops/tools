# Tool Pages UI/UX Unification — Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Scope:** 29 tool views (HomeView excluded; PdfXView is hidden but still updated for consistency)

---

## Goal

Unify all 30 tool pages with a consistent structure inspired by delphi.tools, while keeping the existing `--gi-*` color scheme. Each page will have a clear header card with a category badge and a standard "About this tool" panel at the bottom.

---

## Visual Reference

Reference: https://delphi.tools/tools/palette-genny
Adopted: tool page structure (header card, clean content area, about panel)
Not adopted: sidebar navigation, color scheme

---

## Design Decisions

| Decision | Choice |
|----------|--------|
| Implementation approach | Enhance ToolPageLayout (Approach A) |
| Header | In a bordered card with category badge |
| About panel | Always present, consistent accent-bar style |
| About text | Claude-generated (2–3 sentences per tool) |
| Inline style cleanup | Yes — MatteGeneratorView, ImageResizerView, ContrastCheckerView, PxToRemView |
| PxToRemView | Migrate to ToolPageLayout |

---

## ToolPageLayout.vue Changes

### New prop

```ts
category?: 'print' | 'digital' | 'design'
```

### Template structure (new)

```
[Back link]
[Header card]         ← icon + title + category badge + description, in border card
[Tool content]        ← default slot, unchanged
[About panel]         ← #about slot, always styled with accent bar + label
```

### Slot rename

`#pedagogic` → `#about`
(2 views currently use `#pedagogic`: QrDecoderView, UrlParserView — migrate their content to `#about`)

### Category badge colours

| Category | Background | Text colour |
|----------|-----------|-------------|
| `print` | `rgba(10,170,142,0.1)` | `var(--gi-brand)` (#0aaa8e) |
| `digital` | `rgba(37,99,235,0.1)` | `var(--gi-tint-blue-text)` (#2563eb) |
| `design` | `rgba(124,58,237,0.1)` | `var(--gi-tint-purple-text)` (#7c3aed) |

### Header card CSS (scoped)

```css
.tool-header-card {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.125rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}
.tool-category-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: var(--gi-radius-pill);
  padding: 2px 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
```

### About panel CSS (scoped)

```css
.tool-about {
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-lg);
  padding: 1.25rem;
  margin-top: 2rem;
}
.tool-about-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.tool-about-label::before {
  content: '';
  display: block;
  width: 3px;
  height: 1rem;
  background: var(--gi-brand);
  border-radius: 2px;
  flex-shrink: 0;
}
.tool-about-label span {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--gi-text);
}
```

### Divider removal

`.tool-divider` is removed. The gap between the header card and tool content replaces it visually.

---

## Per-View Changes

### All 30 views: add `category` prop + `#about` slot

Each view gets:
```vue
<ToolPageLayout category="print|digital|design" ...>
  ...
  <template #about>
    <p>{{ about text }}</p>
  </template>
</ToolPageLayout>
```

### Views requiring inline style cleanup

| View | Issues to fix |
|------|--------------|
| `PxToRemView.vue` | Migrate to ToolPageLayout + move inline styles to scoped CSS |
| `MatteGeneratorView.vue` | Move inline grid/flexbox to scoped CSS |
| `ImageResizerView.vue` | Move inline grid/layout to scoped CSS |
| `ContrastCheckerView.vue` | Move inline styles (swap button, preview area) to scoped CSS |

### Views using `#pedagogic` slot (rename to `#about`)

- `QrDecoderView.vue`
- `UrlParserView.vue`

---

## About Texts (English, generated)

These go in each view's `#about` slot. French translations follow the same structure and are added to `src/i18n/fr.ts`.

| View | Category | About text |
|------|----------|-----------|
| PaperWeightView | print | Paper weight affects both postage costs and the physical feel of your printed piece. This tool calculates the total weight of a flyer run based on format, grammage, and quantity — useful when estimating postal rates or comparing paper stocks. |
| DpiCheckerView | print | DPI (dots per inch) determines how sharp an image looks when printed. At 300 DPI, details are crisp; below 150 DPI, pixelation becomes visible. This tool analyses your image's resolution and tells you whether it's ready for professional printing at your target size. |
| BarcodeView | print | EAN-13 is the international standard barcode used on retail products worldwide. This tool generates a valid EAN-13 barcode from any 12-digit base number, with country-of-origin detection and full customisation of colours and size. |
| SafetyMarginView | print | Bleed and safety margins are the invisible zones that protect your design from trimming errors. This tool overlays your image with standard print guides — showing the bleed area, trim line, and safe zone — so you can check your layout before sending it to print. |
| UtmBuilderView | digital | UTM parameters are tags appended to a URL that analytics platforms use to attribute traffic to specific campaigns. This tool builds clean, correctly formatted UTM URLs so you never manually type parameters — and never mix up source, medium, and campaign. |
| RedirectCheckerView | digital | A chain of redirects adds latency and can break tracking. This tool follows every hop from your starting URL to the final destination, revealing each intermediate step, HTTP status code, and the resolved URL — useful for diagnosing SEO redirect issues or verifying campaign links. |
| PromoCodeView | digital | A good promo code is short, memorable, and unambiguous. This tool scores your code against common pitfalls — confusing characters (0/O, 1/I), excessive length, and readability — so you can catch problems before you publish. |
| WordCounterView | digital | Word count and reading time are practical metrics for content planning — whether you're writing an email, a landing page, or a press release. This tool gives you live counts for words, characters, sentences, and paragraphs, plus an estimated reading time. |
| UrlParserView | digital | A URL is made of distinct components — protocol, host, pathname, query string, fragment — each with a specific role. This tool deconstructs any URL into its parts, making it easy to debug broken links, understand redirect targets, or audit campaign parameters. |
| FaviconView | digital | A favicon is the small icon that identifies your site in browser tabs, bookmarks, and app launchers. This tool generates all standard sizes (16×16, 32×32, 180×180, and more) from any image, so you can ship a complete favicon set without a separate design tool. |
| MetadataView | digital | Image files carry hidden metadata — dimensions, colour profile, file size, EXIF data — that affect how they're processed and displayed. This tool reads and surfaces that information directly in the browser, with no upload to any server. |
| QrDecoderView | digital | QR codes are widely used for links, contact cards, and product labels, but their content isn't visible at a glance. This tool decodes any QR code image and shows you the embedded data instantly — useful for verification, testing, or quick inspection. |
| ColorPaletteView | design | Colour harmony is the foundation of any cohesive visual identity. This tool generates balanced palettes using established colour theory models, and lets you lock individual colours while regenerating the rest — making it easy to explore variations around a fixed brand colour. |
| MockupGeneratorView | design | A device mockup puts your screenshot or design into context, making it instantly more presentable for clients, presentations, or social media. This tool composites your image into an iPhone 15 frame directly in the browser — no Photoshop required. |
| PxToRemView | design | Rem units scale with the user's browser font size, making them essential for accessible, responsive design. This tool converts between px and rem values in bulk, so you can migrate a list of fixed pixel values from a design file to scalable CSS in seconds. |
| TypeScaleView | design | A type scale creates visual hierarchy by spacing font sizes at a consistent ratio. This tool generates a complete scale from your base size and ratio, giving you a set of sizes you can copy directly into your CSS custom properties. |
| ContrastCheckerView | design | Sufficient colour contrast is required by WCAG accessibility standards and improves readability for all users. This tool checks your foreground/background colour pair against WCAG AA and AAA thresholds, and shows you a live preview of the combination. |
| ColorConverterView | design | Colour values look different in different contexts — hex in CSS, RGB in design tools, CMYK for print. This tool converts any colour between HEX, RGB, HSL, and CMYK formats instantly, so you always have the right notation for the right context. |
| ImageCompressorView | design | Oversized images slow down page loads and waste bandwidth. This tool compresses your images in the browser using lossy or lossless algorithms, showing you the before/after file size and a visual preview before you download. |
| ImageCropperView | design | Cropping to a fixed ratio is a common task when preparing images for social media, e-commerce, or print. This tool lets you crop to standard presets or a custom ratio, with a live preview — entirely in your browser. |
| ImageResizerView | design | Resizing images to exact dimensions or percentages is a frequent step before uploading to websites or sending to clients. This tool resizes any image in the browser, with optional aspect ratio lock and a preview before download. |
| ImageFiltersView | design | Visual filters can create a consistent mood across a set of images without opening an image editor. This tool applies CSS-based filters — greyscale, sepia, blur, brightness, and more — with a live preview and instant download. |
| PlaceholderView | design | Placeholder images fill space in wireframes and mockups while real content is being prepared. This tool generates placeholder images at any size and colour, ready to use as an `<img src>` URL or download. |
| MatteGeneratorView | design | A colour matte (or border) frames an image and gives it visual breathing room — common in art direction, e-commerce, and social media content. This tool adds a solid-colour border around your image with precise control over size and colour. |
| LoremIpsumView | design | Lorem Ipsum is the standard placeholder text for wireframes and layouts. This tool generates paragraphs or word counts on demand, with an option to start with the classic opening line for authenticity. |
| ImageConverterView | design | Different platforms require different image formats — WebP for the web, PNG for transparency, SVG for vectors. This tool converts between SVG, PNG, JPG, and WebP directly in the browser, without any server upload. |
| ColorblindView | design | About 8% of men and 0.5% of women have some form of colour vision deficiency. This tool simulates how your image or design appears under the most common types — protanopia, deuteranopia, and tritanopia — so you can check accessibility before publishing. |
| PaletteView | design | Extracting colours from an existing image helps you match a brand palette, analyse a competitor's visual identity, or create a complementary colour scheme. This tool identifies the dominant colours in any image and gives you their hex values. |

---

## i18n

About texts are added as a new `about` key in each tool's section of `fr.ts` and `en.ts`:

```ts
// en.ts example
dpiChecker: {
  // ...existing keys...
  about: 'DPI (dots per inch) determines how sharp an image looks when printed...'
}
```

Each view reads `t('toolName.about')` in its `#about` slot.

---

## Dark Mode

All new elements use existing `--gi-*` tokens and inherit dark mode automatically via `[data-theme="dark"]` overrides already in `global.css`. No additional dark mode rules are needed.

---

## File Change Summary

| File | Change type |
|------|------------|
| `src/components/ToolPageLayout.vue` | Enhance: header card, category badge, about panel, remove divider |
| `src/views/PxToRemView.vue` | Migrate to ToolPageLayout + inline style cleanup |
| `src/views/MatteGeneratorView.vue` | Add category/about + inline style cleanup |
| `src/views/ImageResizerView.vue` | Add category/about + inline style cleanup |
| `src/views/ContrastCheckerView.vue` | Add category/about + inline style cleanup |
| `src/views/QrDecoderView.vue` | Rename #pedagogic → #about |
| `src/views/UrlParserView.vue` | Rename #pedagogic → #about |
| 24 remaining views | Add category + #about slot only |
| `src/i18n/fr.ts` | Add `about` key to all 30 tool sections |
| `src/i18n/en.ts` | Add `about` key to all 30 tool sections |

**Total files changed: ~38**

---

## Notes

- About texts in this spec are in English. French (`fr.ts`) translations must be written in parallel using the same structure — same length, same meaning.
- PdfXView is currently hidden (route commented out). It still gets the category/about treatment so it's ready when re-enabled.
- The `#pedagogic` slot in QrDecoderView and UrlParserView contains existing educational content. When renaming to `#about`, review whether that content matches the "About the tool" intent or needs to be rewritten.
