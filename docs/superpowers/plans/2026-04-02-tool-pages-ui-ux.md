# Tool Pages UI/UX Unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify all 29 tool pages with a consistent header card + category badge + "About this tool" panel, inspired by delphi.tools structure, using the existing `--gi-*` token system.

**Architecture:** Enhance the shared `ToolPageLayout.vue` with a bordered header card, a `category` prop driving a colour-coded pill badge, and a styled `#about` slot. All 29 views get a `category` prop and `#about` slot; 4 views also get inline-style cleanup; 1 view (PxToRemView) gets migrated from a bare `<div>` wrapper to ToolPageLayout.

**Tech Stack:** Vue 3, vue-i18n v9, Vite 5, Vitest — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-02-tool-pages-ui-ux-design.md`

---

## File Map

| File | Change |
|------|--------|
| `src/components/ToolPageLayout.vue` | Enhance: header card, category badge, about panel, remove divider |
| `src/i18n/fr.ts` | Add `nav.about` + `<tool>.about` for all 29 tools |
| `src/i18n/en.ts` | Add `nav.about` + `<tool>.about` for all 29 tools |
| `src/views/PxToRemView.vue` | Full migration to ToolPageLayout + inline → scoped CSS |
| `src/views/MatteGeneratorView.vue` | Add category/about + inline → scoped CSS |
| `src/views/ImageResizerView.vue` | Add category/about + inline → scoped CSS |
| `src/views/ContrastCheckerView.vue` | Add category/about + inline → scoped CSS |
| `src/views/QrDecoderView.vue` | Rename `#pedagogic` → `#about`, replace GiPedagogic with about text |
| `src/views/UrlParserView.vue` | Rename `#pedagogic` → `#about`, prepend about text |
| 20 remaining views | Add `category` prop + `#about` slot only |

---

## Task 1: Enhance ToolPageLayout.vue

**Files:**
- Modify: `src/components/ToolPageLayout.vue`

- [ ] **Step 1: Replace the file with the new implementation**

```vue
<template>
  <div class="tool-page">
    <!-- Back Link -->
    <router-link to="/" class="tool-back-link">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      {{ t('nav.back') }}
    </router-link>

    <!-- Tool Header Card -->
    <div class="tool-header-card">
      <div class="tool-icon" v-if="$slots.icon">
        <slot name="icon"></slot>
      </div>
      <div class="tool-title-section">
        <div class="tool-title-row">
          <h1 class="tool-title">
            <slot name="title">{{ title }}</slot>
          </h1>
          <span v-if="category" class="tool-category-badge" :class="`tool-category-badge--${category}`">
            {{ t(`home.categories.${category}`) }}
          </span>
        </div>
        <p v-if="subtitle" class="tool-subtitle">{{ subtitle }}</p>
        <p class="tool-description">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </div>

    <!-- Tool Content -->
    <div class="tool-content">
      <slot></slot>
    </div>

    <!-- About Panel -->
    <div v-if="$slots.about" class="tool-about">
      <div class="tool-about-label">
        <span>{{ t('nav.about') }}</span>
      </div>
      <slot name="about"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  title?: string
  subtitle?: string
  description?: string
  category?: 'print' | 'digital' | 'design'
}>()

const { t } = useI18n()
</script>

<style scoped>
.tool-page {
  max-width: var(--gi-container-tool);
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* Back Link */
.tool-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  text-decoration: none;
  transition: all var(--gi-transition-fast) var(--gi-ease-out);
  background: var(--gi-surface);
}

.tool-back-link:hover {
  border-color: var(--gi-brand);
  color: var(--gi-brand);
  background: var(--gi-brand-fade);
  transform: translateX(-2px);
}

.tool-back-link:focus-visible {
  outline: 2px solid var(--gi-brand);
  outline-offset: 2px;
}

[data-theme="dark"] .tool-back-link:hover {
  background: rgba(10, 170, 142, 0.15);
}

/* Header Card */
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

.tool-icon {
  width: 40px;
  height: 40px;
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
  border-radius: var(--gi-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--gi-transition-base) var(--gi-ease-bounce);
}

.tool-header-card:hover .tool-icon {
  transform: scale(1.05);
  background: var(--gi-brand);
  color: white;
}

.tool-title-section {
  flex: 1;
  min-width: 0;
}

.tool-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.tool-title {
  font-family: 'Garnett', 'Inter', system-ui, sans-serif;
  font-size: var(--gi-font-size-xl);
  font-weight: 700;
  color: var(--gi-text);
  margin: 0;
}

.tool-category-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: var(--gi-radius-pill);
  padding: 2px 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
  white-space: nowrap;
}

.tool-category-badge--print {
  background: var(--gi-brand-fade);
  color: var(--gi-brand);
}

.tool-category-badge--digital {
  background: var(--gi-tint-blue-bg);
  color: var(--gi-tint-blue-text);
}

.tool-category-badge--design {
  background: var(--gi-tint-purple-bg);
  color: var(--gi-tint-purple-text);
}

.tool-subtitle {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  margin: 0 0 0.25rem;
}

.tool-description {
  font-size: var(--gi-font-size-base);
  color: var(--gi-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Content */
.tool-content {
  margin-bottom: 1.5rem;
}

/* About Panel */
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

.tool-about :deep(p) {
  font-size: var(--gi-font-size-sm);
  color: var(--gi-text-muted);
  line-height: 1.7;
  margin: 0;
}
</style>
```

- [ ] **Step 2: Run dev server and visually verify any existing page still renders**

```bash
rtk npm run dev
```
Open http://localhost:5173/tools/#/utm-builder — confirm the header card shows the icon, title, and description. No category badge yet (added in a later task). No regression on back link or content.

- [ ] **Step 3: Run tests**

```bash
rtk npm test
```
Expected: all 227 tests pass. ToolPageLayout has no unit tests so nothing new to write here.

- [ ] **Step 4: Commit**

```bash
rtk git add src/components/ToolPageLayout.vue
rtk git commit -m "feat: enhance ToolPageLayout with header card, category badge, and about panel"
```

---

## Task 2: Add i18n keys — nav.about + all tool about texts

**Files:**
- Modify: `src/i18n/fr.ts`
- Modify: `src/i18n/en.ts`

These are pure content additions. No logic changes.

- [ ] **Step 1: Add `nav.about` to fr.ts**

In `src/i18n/fr.ts`, find the `nav` block and add `about` after `copy`:

```ts
  nav: {
    // ...existing keys...
    copy: 'Copier',
    about: 'À propos de cet outil',
  },
```

- [ ] **Step 2: Add `about` text to every tool section in fr.ts**

For each tool section in `fr.ts`, add an `about` key. Add the following entries (each goes inside the matching tool object):

**paperWeight:**
```ts
about: "Le grammage du papier influence le coût d'affranchissement et la qualité perçue de votre imprimé. Cet outil calcule le poids total d'un tirage de flyers en fonction du format, du grammage et de la quantité — utile pour estimer les frais postaux ou comparer les papiers.",
```

**dpiChecker:**
```ts
about: "Le DPI (points par pouce) détermine la netteté d'une image à l'impression. À 300 DPI, les détails sont nets ; en dessous de 150 DPI, la pixelisation devient visible. Cet outil analyse la résolution de votre image et vous indique si elle est prête pour une impression professionnelle à la taille souhaitée.",
```

**barcode:**
```ts
about: "L'EAN-13 est le code-barres international utilisé sur les produits de grande distribution. Cet outil génère un code-barres EAN-13 valide à partir de n'importe quel numéro de base à 12 chiffres, avec détection du pays d'origine et personnalisation complète des couleurs et de la taille.",
```

**safetyMargin:**
```ts
about: "Le fond perdu et les marges de sécurité sont les zones invisibles qui protègent votre design des erreurs de découpe. Cet outil superpose votre image avec les repères d'impression standard — zone de débordement, trait de coupe et zone de sécurité — pour vérifier votre mise en page avant envoi à l'imprimeur.",
```

**utmBuilder:**
```ts
about: "Les paramètres UTM sont des balises ajoutées à une URL que les outils d'analytics utilisent pour attribuer le trafic à des campagnes spécifiques. Cet outil construit des URLs UTM propres et correctement formatées pour ne jamais taper les paramètres à la main — ni confondre source, medium et campagne.",
```

**redirectChecker:**
```ts
about: "Une chaîne de redirections ajoute de la latence et peut casser le tracking. Cet outil suit chaque étape depuis votre URL de départ jusqu'à la destination finale, en révélant chaque intermédiaire, le code HTTP correspondant et l'URL résolue — utile pour diagnostiquer des problèmes de référencement ou vérifier des liens de campagne.",
```

**promoCode:**
```ts
about: "Un bon code promo est court, mémorisable et sans ambiguïté. Cet outil évalue votre code selon les erreurs classiques — caractères confus (0/O, 1/I), longueur excessive, lisibilité — pour détecter les problèmes avant la diffusion.",
```

**wordCounter:**
```ts
about: "Le nombre de mots et le temps de lecture sont des métriques pratiques pour la planification éditoriale, qu'il s'agisse d'un email, d'une landing page ou d'un communiqué de presse. Cet outil vous donne en temps réel le compte de mots, caractères, phrases et paragraphes, avec une estimation du temps de lecture.",
```

**urlParser:**
```ts
about: "Une URL est composée d'éléments distincts — protocole, hôte, chemin, chaîne de requête, fragment — chacun avec un rôle précis. Cet outil décortique n'importe quelle URL en ses composantes, pour déboguer des liens cassés, comprendre des cibles de redirection ou auditer des paramètres de campagne.",
```

**favicon:**
```ts
about: "Un favicon est la petite icône qui identifie votre site dans les onglets du navigateur, les favoris et les lanceurs d'applications. Cet outil génère toutes les tailles standard (16×16, 32×32, 180×180, etc.) depuis n'importe quelle image, pour un jeu de favicons complet sans outil de design dédié.",
```

**metadata:**
```ts
about: "Les fichiers image contiennent des métadonnées cachées — dimensions, profil colorimétrique, taille de fichier, données EXIF — qui influencent leur traitement et affichage. Cet outil lit et affiche ces informations directement dans le navigateur, sans envoi sur un serveur.",
```

**qrDecoder:**
```ts
about: "Les QR codes sont largement utilisés pour des liens, des cartes de contact ou des étiquettes produit, mais leur contenu n'est pas visible à l'œil nu. Cet outil décode n'importe quelle image de QR code et affiche les données intégrées instantanément — utile pour la vérification, les tests ou l'inspection rapide.",
```

**colorPalette:**
```ts
about: "L'harmonie des couleurs est le fondement de toute identité visuelle cohérente. Cet outil génère des palettes équilibrées selon des modèles de théorie des couleurs établis, et vous permet de verrouiller des couleurs individuelles tout en régénérant le reste — idéal pour explorer des variations autour d'une couleur de marque fixe.",
```

**mockupGenerator:**
```ts
about: "Un mockup de device met votre capture ou design en contexte, le rendant immédiatement plus présentable pour des clients, présentations ou réseaux sociaux. Cet outil intègre votre image dans un cadre iPhone 15 directement dans le navigateur — sans Photoshop.",
```

**pxToRem:**
```ts
about: "Les unités rem s'adaptent à la taille de police du navigateur, ce qui les rend essentielles pour un design accessible et responsive. Cet outil convertit des valeurs px en rem (et vice versa) en masse, pour migrer une liste de valeurs pixel d'un fichier de design vers du CSS scalable en quelques secondes.",
```

**typeScale:**
```ts
about: "Une échelle typographique crée une hiérarchie visuelle en espaçant les tailles de police selon un ratio constant. Cet outil génère une échelle complète depuis votre taille de base et votre ratio, et vous donne un ensemble de valeurs à copier directement dans vos propriétés CSS.",
```

**contrastChecker:**
```ts
about: "Un contraste suffisant est requis par les normes d'accessibilité WCAG et améliore la lisibilité pour tous les utilisateurs. Cet outil vérifie votre combinaison couleur de premier plan / arrière-plan selon les seuils WCAG AA et AAA, avec un aperçu en temps réel de la combinaison.",
```

**colorConverter:**
```ts
about: "Les valeurs de couleur se présentent différemment selon les contextes — hex en CSS, RGB dans les outils de design, CMJN pour l'impression. Cet outil convertit instantanément n'importe quelle couleur entre les formats HEX, RGB, HSL et CMJN, pour toujours avoir la bonne notation selon le contexte.",
```

**imageCompressor:**
```ts
about: "Les images surdimensionnées ralentissent le chargement des pages et consomment de la bande passante. Cet outil compresse vos images dans le navigateur avec des algorithmes avec ou sans perte, en affichant les tailles avant/après et un aperçu visuel avant téléchargement.",
```

**imageCropper:**
```ts
about: "Le recadrage selon un ratio fixe est une tâche courante lors de la préparation d'images pour les réseaux sociaux, l'e-commerce ou l'impression. Cet outil permet de recadrer selon des presets standard ou un ratio personnalisé, avec un aperçu en temps réel — entièrement dans le navigateur.",
```

**imageResizer:**
```ts
about: "Redimensionner des images à des dimensions précises ou en pourcentage est une étape fréquente avant de les télécharger sur un site ou les envoyer à des clients. Cet outil redimensionne n'importe quelle image dans le navigateur, avec un verrouillage optionnel du ratio et un aperçu avant téléchargement.",
```

**imageFilters:**
```ts
about: "Les filtres visuels permettent de créer une ambiance cohérente sur un ensemble d'images sans ouvrir un éditeur dédié. Cet outil applique des filtres CSS — niveaux de gris, sépia, flou, luminosité, etc. — avec un aperçu en temps réel et un téléchargement immédiat.",
```

**placeholder:**
```ts
about: "Les images placeholder remplissent l'espace dans les wireframes et maquettes pendant que le contenu réel est en préparation. Cet outil génère des images placeholder à n'importe quelle dimension et couleur, prêtes à utiliser comme URL dans une balise img ou à télécharger.",
```

**matteGenerator:**
```ts
about: "Un matte coloré encadre une image et lui donne de l'espace visuel — courant en direction artistique, e-commerce et contenu pour les réseaux sociaux. Cet outil ajoute une bordure de couleur unie autour de votre image avec un contrôle précis de la taille et de la couleur.",
```

**lorem:**
```ts
about: "Le Lorem Ipsum est le texte de remplissage standard pour les wireframes et mises en page. Cet outil génère des paragraphes ou un nombre de mots à la demande, avec une option pour commencer par la phrase d'ouverture classique pour plus d'authenticité.",
```

**imageConverter:**
```ts
about: "Différentes plateformes requièrent différents formats d'image — WebP pour le web, PNG pour la transparence, SVG pour les vecteurs. Cet outil convertit entre SVG, PNG, JPG et WebP directement dans le navigateur, sans envoi sur un serveur.",
```

**colorblind:**
```ts
about: "Environ 8 % des hommes et 0,5 % des femmes présentent une forme de déficience de la vision des couleurs. Cet outil simule l'apparence de votre image pour les types les plus courants — protanopie, deutéranopie et tritanopie — pour vérifier l'accessibilité avant publication.",
```

**palette:**
```ts
about: "Extraire les couleurs d'une image existante aide à correspondre à une palette de marque, analyser l'identité visuelle d'un concurrent ou créer un schéma de couleurs complémentaire. Cet outil identifie les couleurs dominantes de n'importe quelle image et vous donne leurs valeurs hexadécimales.",
```

**pdfX** (hidden tool, still update):
```ts
about: "Le PDF/X est une norme ISO garantissant que les fichiers PDF sont conformes aux exigences de l'impression professionnelle. Cet outil convertit votre PDF en PDF/X-1a, en intégrant les polices, aplatissant la transparence et convertissant les couleurs en CMJN.",
```

- [ ] **Step 3: Add `nav.about` to en.ts**

In `src/i18n/en.ts`, find the `nav` block and add after `copy`:

```ts
    copy: 'Copy',
    about: 'About this tool',
```

- [ ] **Step 4: Add `about` text to every tool section in en.ts**

Apply the same structure as fr.ts. For each tool section, add:

**paperWeight:**
```ts
about: "Paper weight affects both postage costs and the physical feel of your printed piece. This tool calculates the total weight of a flyer run based on format, grammage, and quantity — useful when estimating postal rates or comparing paper stocks.",
```

**dpiChecker:**
```ts
about: "DPI (dots per inch) determines how sharp an image looks when printed. At 300 DPI, details are crisp; below 150 DPI, pixelation becomes visible. This tool analyses your image's resolution and tells you whether it's ready for professional printing at your target size.",
```

**barcode:**
```ts
about: "EAN-13 is the international standard barcode used on retail products worldwide. This tool generates a valid EAN-13 barcode from any 12-digit base number, with country-of-origin detection and full customisation of colours and size.",
```

**safetyMargin:**
```ts
about: "Bleed and safety margins are the invisible zones that protect your design from trimming errors. This tool overlays your image with standard print guides — showing the bleed area, trim line, and safe zone — so you can check your layout before sending it to print.",
```

**utmBuilder:**
```ts
about: "UTM parameters are tags appended to a URL that analytics platforms use to attribute traffic to specific campaigns. This tool builds clean, correctly formatted UTM URLs so you never manually type parameters — and never mix up source, medium, and campaign.",
```

**redirectChecker:**
```ts
about: "A chain of redirects adds latency and can break tracking. This tool follows every hop from your starting URL to the final destination, revealing each intermediate step, HTTP status code, and the resolved URL — useful for diagnosing SEO redirect issues or verifying campaign links.",
```

**promoCode:**
```ts
about: "A good promo code is short, memorable, and unambiguous. This tool scores your code against common pitfalls — confusing characters (0/O, 1/I), excessive length, and readability — so you can catch problems before you publish.",
```

**wordCounter:**
```ts
about: "Word count and reading time are practical metrics for content planning — whether you're writing an email, a landing page, or a press release. This tool gives you live counts for words, characters, sentences, and paragraphs, plus an estimated reading time.",
```

**urlParser:**
```ts
about: "A URL is made of distinct components — protocol, host, pathname, query string, fragment — each with a specific role. This tool deconstructs any URL into its parts, making it easy to debug broken links, understand redirect targets, or audit campaign parameters.",
```

**favicon:**
```ts
about: "A favicon is the small icon that identifies your site in browser tabs, bookmarks, and app launchers. This tool generates all standard sizes (16×16, 32×32, 180×180, and more) from any image, so you can ship a complete favicon set without a separate design tool.",
```

**metadata:**
```ts
about: "Image files carry hidden metadata — dimensions, colour profile, file size, EXIF data — that affect how they're processed and displayed. This tool reads and surfaces that information directly in the browser, with no upload to any server.",
```

**qrDecoder:**
```ts
about: "QR codes are widely used for links, contact cards, and product labels, but their content isn't visible at a glance. This tool decodes any QR code image and shows you the embedded data instantly — useful for verification, testing, or quick inspection.",
```

**colorPalette:**
```ts
about: "Colour harmony is the foundation of any cohesive visual identity. This tool generates balanced palettes using established colour theory models, and lets you lock individual colours while regenerating the rest — making it easy to explore variations around a fixed brand colour.",
```

**mockupGenerator:**
```ts
about: "A device mockup puts your screenshot or design into context, making it instantly more presentable for clients, presentations, or social media. This tool composites your image into an iPhone 15 frame directly in the browser — no Photoshop required.",
```

**pxToRem:**
```ts
about: "Rem units scale with the user's browser font size, making them essential for accessible, responsive design. This tool converts between px and rem values in bulk, so you can migrate a list of fixed pixel values from a design file to scalable CSS in seconds.",
```

**typeScale:**
```ts
about: "A type scale creates visual hierarchy by spacing font sizes at a consistent ratio. This tool generates a complete scale from your base size and ratio, giving you a set of sizes you can copy directly into your CSS custom properties.",
```

**contrastChecker:**
```ts
about: "Sufficient colour contrast is required by WCAG accessibility standards and improves readability for all users. This tool checks your foreground/background colour pair against WCAG AA and AAA thresholds, and shows you a live preview of the combination.",
```

**colorConverter:**
```ts
about: "Colour values look different in different contexts — hex in CSS, RGB in design tools, CMYK for print. This tool converts any colour between HEX, RGB, HSL, and CMYK formats instantly, so you always have the right notation for the right context.",
```

**imageCompressor:**
```ts
about: "Oversized images slow down page loads and waste bandwidth. This tool compresses your images in the browser using lossy or lossless algorithms, showing you the before/after file size and a visual preview before you download.",
```

**imageCropper:**
```ts
about: "Cropping to a fixed ratio is a common task when preparing images for social media, e-commerce, or print. This tool lets you crop to standard presets or a custom ratio, with a live preview — entirely in your browser.",
```

**imageResizer:**
```ts
about: "Resizing images to exact dimensions or percentages is a frequent step before uploading to websites or sending to clients. This tool resizes any image in the browser, with optional aspect ratio lock and a preview before download.",
```

**imageFilters:**
```ts
about: "Visual filters can create a consistent mood across a set of images without opening an image editor. This tool applies CSS-based filters — greyscale, sepia, blur, brightness, and more — with a live preview and instant download.",
```

**placeholder:**
```ts
about: "Placeholder images fill space in wireframes and mockups while real content is being prepared. This tool generates placeholder images at any size and colour, ready to use as an img src URL or download.",
```

**matteGenerator:**
```ts
about: "A colour matte frames an image and gives it visual breathing room — common in art direction, e-commerce, and social media content. This tool adds a solid-colour border around your image with precise control over size and colour.",
```

**lorem:**
```ts
about: "Lorem Ipsum is the standard placeholder text for wireframes and layouts. This tool generates paragraphs or word counts on demand, with an option to start with the classic opening line for authenticity.",
```

**imageConverter:**
```ts
about: "Different platforms require different image formats — WebP for the web, PNG for transparency, SVG for vectors. This tool converts between SVG, PNG, JPG, and WebP directly in the browser, without any server upload.",
```

**colorblind:**
```ts
about: "About 8% of men and 0.5% of women have some form of colour vision deficiency. This tool simulates how your image appears under the most common types — protanopia, deuteranopia, and tritanopia — so you can check accessibility before publishing.",
```

**palette:**
```ts
about: "Extracting colours from an existing image helps you match a brand palette, analyse a competitor's visual identity, or create a complementary colour scheme. This tool identifies the dominant colours in any image and gives you their hex values.",
```

**pdfX:**
```ts
about: "PDF/X is an ISO standard ensuring PDF files conform to professional printing requirements. This tool converts your PDF to PDF/X-1a, embedding fonts, flattening transparency, and converting colours to CMYK.",
```

- [ ] **Step 5: Verify TypeScript compiles (en.ts imports type from fr.ts)**

```bash
rtk npm run build 2>&1 | head -20
```
Expected: no type errors. If there are errors about missing keys, check that the `about` key was added inside the correct tool object and not at the root level.

- [ ] **Step 6: Commit**

```bash
rtk git add src/i18n/fr.ts src/i18n/en.ts
rtk git commit -m "feat: add about text i18n keys for all 29 tool pages"
```

---

## Task 3: Migrate PxToRemView to ToolPageLayout

**Files:**
- Modify: `src/views/PxToRemView.vue`

PxToRemView is the only tool not using ToolPageLayout. It uses a bare `<div>` wrapper with heavy inline styles.

- [ ] **Step 1: Replace the full file**

```vue
<template>
  <ToolPageLayout
    :title="t('pxToRem.title')"
    :description="t('pxToRem.desc')"
    category="design"
  >
    <template #icon>
      <Ruler :size="22" />
    </template>

    <!-- Base Size Setting -->
    <div class="px-base-row">
      <span class="px-base-label">{{ t('pxToRem.baseSize') }}</span>
      <div class="px-base-input">
        <input v-model.number="base" type="number" class="gi-input" min="1" />
        <span class="px-base-unit">px</span>
      </div>
    </div>

    <!-- Conversion Grid Header -->
    <div class="px-grid-header">
      <div>Pixel (px)</div>
      <div>Rem</div>
      <div></div>
    </div>

    <!-- Dynamic Rows -->
    <div class="px-rows">
      <div
        v-for="(row, index) in rows"
        :key="row.id"
        class="gi-card px-row"
      >
        <input
          v-model.number="row.px"
          type="number"
          class="gi-input px-value-input"
          step="1"
          @input="onPxInput(index)"
        />
        <input
          v-model.number="row.rem"
          type="number"
          class="gi-input px-value-input px-value-input--rem"
          step="0.125"
          @input="onRemInput(index)"
        />
        <button
          v-if="rows.length > 1"
          @click="removeRow(index)"
          class="gi-btn-ghost px-remove-btn"
          title="Remove row"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
        <div v-else></div>
      </div>
    </div>

    <button @click="addRow" class="gi-btn-ghost px-add-btn">
      + {{ t('pxToRem.addRow') }}
    </button>

    <template #about>{{ t('pxToRem.about') }}</template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ruler } from 'lucide-vue-next'
import ToolPageLayout from '../components/ToolPageLayout.vue'
import { pxToRem, remToPx } from '../composables/usePxToRem'

const { t } = useI18n()

interface RowData {
  id: string
  px: number | ''
  rem: number | ''
}

const base = ref(16)
const rows = ref<RowData[]>([
  { id: crypto.randomUUID(), px: 16, rem: 1 },
  { id: crypto.randomUUID(), px: 24, rem: 1.5 },
  { id: crypto.randomUUID(), px: 32, rem: 2 },
])

watch(base, () => {
  rows.value.forEach((_, i) => onPxInput(i))
})

function onPxInput(index: number) {
  const row = rows.value[index]
  if (row.px === '') { row.rem = ''; return }
  row.rem = Number(pxToRem(Number(row.px), base.value).toFixed(4))
}

function onRemInput(index: number) {
  const row = rows.value[index]
  if (row.rem === '') { row.px = ''; return }
  row.px = Number(remToPx(Number(row.rem), base.value).toFixed(2))
}

function addRow() {
  rows.value.push({ id: crypto.randomUUID(), px: '', rem: '' })
}

function removeRow(index: number) {
  rows.value.splice(index, 1)
}
</script>

<style scoped>
.px-base-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  background: var(--gi-surface);
  border: 1px solid var(--gi-border);
  border-radius: var(--gi-radius-md);
}

.px-base-label {
  font-weight: 500;
  color: var(--gi-text);
}

.px-base-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.px-base-input .gi-input {
  width: 80px;
  text-align: center;
}

.px-base-unit {
  color: var(--gi-text-muted);
}

.px-grid-header {
  display: grid;
  grid-template-columns: 1fr 1fr 50px;
  gap: 1rem;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
  color: var(--gi-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.px-rows {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.px-row {
  padding: 0.75rem 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr 50px;
  gap: 1rem;
  align-items: center;
}

.px-value-input {
  background: transparent;
  border-color: transparent;
  font-size: 1.25rem;
}

.px-value-input--rem {
  color: var(--gi-brand);
}

.px-value-input:focus {
  background: var(--gi-bg-soft) !important;
  border-color: var(--gi-brand) !important;
}

.px-remove-btn {
  padding: 0.4rem;
  border: none;
  color: var(--gi-tint-red-text);
}

.px-add-btn {
  width: 100%;
  justify-content: center;
  border-style: dashed;
}
</style>
```

- [ ] **Step 2: Verify in browser**

Navigate to http://localhost:5173/tools/#/px-to-rem — confirm: header card with Ruler icon, category badge "Design", conversion rows work correctly, "About" panel shows at bottom.

- [ ] **Step 3: Commit**

```bash
rtk git add src/views/PxToRemView.vue
rtk git commit -m "feat: migrate PxToRemView to ToolPageLayout with category badge and about panel"
```

---

## Task 4: Cleanup MatteGeneratorView

**Files:**
- Modify: `src/views/MatteGeneratorView.vue`

Move inline grid/flex styles to scoped CSS, add category and about.

- [ ] **Step 1: Replace the template's inline styles with CSS classes and add category/about**

In `src/views/MatteGeneratorView.vue`:

Change the opening ToolPageLayout tag from:
```vue
  <ToolPageLayout
    :title="t('matteGenerator.title')"
    :subtitle="t('matteGenerator.desc')"
  >
```
to:
```vue
  <ToolPageLayout
    :title="t('matteGenerator.title')"
    :description="t('matteGenerator.desc')"
    category="design"
  >
```
(Note: `subtitle` → `description` so it shows below the title row as muted text, matching all other views.)

Change the editor grid wrapper from:
```vue
    <div v-if="image" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; align-items: start;">
```
to:
```vue
    <div v-if="image" class="matte-editor">
```

Change the controls wrapper from:
```vue
      <div class="gi-grid" style="grid-template-columns: 1fr; gap: 1.25rem;">
```
to:
```vue
      <div class="matte-controls">
```

Change the download button from:
```vue
        <button @click="download" class="gi-btn" style="width: 100%; justify-content: center; margin-top: 1rem;">
```
to:
```vue
        <button @click="download" class="gi-btn matte-btn-full">
```

Change the cancel button from:
```vue
        <button @click="image = null" class="gi-btn-ghost" style="width: 100%; justify-content: center;">
```
to:
```vue
        <button @click="image = null" class="gi-btn-ghost matte-btn-full">
```

Change the preview pane from:
```vue
      <div class="gi-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--gi-bg-soft); padding: 2rem;">
```
to:
```vue
      <div class="gi-card matte-preview-card">
```

Add the about slot before `</ToolPageLayout>`:
```vue
    <template #about>{{ t('matteGenerator.about') }}</template>
```

- [ ] **Step 2: Replace the `<style scoped>` block**

```vue
<style scoped>
.matte-editor {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

.matte-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--gi-bg-soft);
  padding: 2rem;
}

.matte-preview-card img {
  max-width: 100%;
  max-height: 500px;
  box-shadow: var(--gi-shadow-lg);
  border-radius: 4px;
}

.matte-preview-card p {
  color: var(--gi-text-muted);
}

.matte-controls {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.matte-btn-full {
  width: 100%;
  justify-content: center;
}

@media (max-width: 640px) {
  .matte-editor {
    grid-template-columns: 1fr;
  }
}
</style>
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:5173/tools/#/matte-generator — upload an image, confirm 2-col layout, controls, preview, and about panel all work correctly.

- [ ] **Step 4: Commit**

```bash
rtk git add src/views/MatteGeneratorView.vue
rtk git commit -m "feat: add category/about to MatteGeneratorView, move inline styles to CSS"
```

---

## Task 5: Cleanup ImageResizerView

**Files:**
- Modify: `src/views/ImageResizerView.vue`

- [ ] **Step 1: Add category prop and replace inline styles with CSS classes**

Change the opening ToolPageLayout tag to add `category="design"`.

Change the controls section: replace inline styles with CSS classes:

```vue
    <div v-else class="gi-grid">
      <!-- Controls -->
      <div class="gi-field">
        <label class="gi-label">{{ t('imageResizer.preserveRatio') }}</label>
        <div class="resizer-ratio-toggle">
          <input id="ratio-toggle" v-model="preserveAspectRatio" type="checkbox" />
          <label for="ratio-toggle" style="cursor: pointer">Auto</label>
        </div>

        <div class="resizer-dimensions">
          <GiFormField
            :label="t('imageResizer.width')"
            type="number"
            :model-value="width"
            @update:model-value="width = Number($event); onWidthInput()"
          />
          <GiFormField
            :label="t('imageResizer.height')"
            type="number"
            :model-value="height"
            @update:model-value="height = Number($event); onHeightInput()"
          />
        </div>

        <div class="gi-field">
          <label class="gi-label">{{ t('imageResizer.percentage') }}: {{ percentage }}%</label>
          <input v-model.number="percentage" type="range" min="1" max="200" class="gi-input" @input="onPercentageInput" />
        </div>

        <button class="gi-btn-primary resizer-btn-full" @click="handleResize">{{ t('imageResizer.resize') }}</button>
      </div>

      <!-- Preview -->
      <GiResultCard title="Preview">
        <div class="resizer-preview-area">
          <img :src="originalUrl" class="resizer-preview-img" />
          <div class="resizer-preview-dims">
            {{ originalWidth }} x {{ originalHeight }}
          </div>
        </div>
      </GiResultCard>
    </div>

    <!-- Result -->
    <GiResultCard v-if="resizedUrl" :title="`Result (${width} x ${height})`">
      <img :src="resizedUrl" class="resizer-result-img" />
      <template #actions>
        <button class="gi-btn-primary" @click="downloadResized">⬇️ {{ t('imageResizer.download') }}</button>
      </template>
    </GiResultCard>
```

Add the about slot before `</ToolPageLayout>`:
```vue
    <template #about>{{ t('imageResizer.about') }}</template>
```

- [ ] **Step 2: Replace `<style scoped>` block**

```vue
<style scoped>
.resizer-ratio-toggle {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.resizer-dimensions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.resizer-btn-full {
  width: 100%;
  margin-top: 1rem;
}

.resizer-preview-area {
  background: var(--gi-bg);
  border-radius: var(--gi-radius-md);
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  position: relative;
}

.resizer-preview-img {
  max-width: 100%;
  opacity: 0.5;
}

.resizer-preview-dims {
  position: absolute;
  color: var(--gi-text-inverse);
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem;
  border-radius: 4px;
  pointer-events: none;
  font-size: 0.875rem;
}

.resizer-result-img {
  max-width: 100%;
  border-radius: var(--gi-radius-md);
  margin-bottom: 1rem;
}
</style>
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:5173/tools/#/image-resizer — upload an image, confirm 2-col layout with controls + preview, resize works, about panel shows.

- [ ] **Step 4: Commit**

```bash
rtk git add src/views/ImageResizerView.vue
rtk git commit -m "feat: add category/about to ImageResizerView, move inline styles to CSS"
```

---

## Task 6: Cleanup ContrastCheckerView

**Files:**
- Modify: `src/views/ContrastCheckerView.vue`

- [ ] **Step 1: Add category prop and replace inline styles with CSS classes**

Change the opening ToolPageLayout tag to add `category="design"`.

Replace the preview+controls card section:

```vue
    <div class="contrast-card gi-card">
      <!-- Interactive Preview -->
      <div
        class="contrast-preview"
        :style="{ backgroundColor: bgHex, color: textHex }"
      >
        <div class="contrast-preview-large">
          {{ t('contrastChecker.preview') }} (Large)
        </div>
        <div class="contrast-preview-body">
          {{ t('contrastChecker.sampleText') }}
        </div>
      </div>

      <!-- Controls -->
      <div class="contrast-controls">
        <GiFormField :label="t('contrastChecker.textColor')" class="contrast-field">
          <template #input>
            <div class="contrast-color-input">
              <input v-model="textHex" type="color" class="gi-input contrast-color-swatch" />
              <input v-model="textHex" type="text" class="gi-input" placeholder="#000000" />
            </div>
          </template>
        </GiFormField>

        <button @click="swapColors" class="gi-btn-ghost contrast-swap-btn" title="Swap Colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
        </button>

        <GiFormField :label="t('contrastChecker.bgColor')" class="contrast-field">
          <template #input>
            <div class="contrast-color-input">
              <input v-model="bgHex" type="color" class="gi-input contrast-color-swatch" />
              <input v-model="bgHex" type="text" class="gi-input" placeholder="#FFFFFF" />
            </div>
          </template>
        </GiFormField>
      </div>
    </div>
```

Replace the WCAG result card's inline styles:
```vue
        <div class="contrast-checks">
          <div v-for="(level, key) in wcagChecks" :key="key" class="contrast-check-row">
            <span class="contrast-check-label">{{ level.label }}</span>
            <GiStatusBadge :variant="level.pass ? 'ok' : 'error'" showIcon>
              {{ level.pass ? t('contrastChecker.pass') : t('contrastChecker.fail') }}
            </GiStatusBadge>
          </div>
        </div>
```

Replace the APCA result card's inline styles:
```vue
        <p class="contrast-apca-note">Advanced Perceptual Contrast Algorithm</p>
        <div class="contrast-apca-table">
          <div class="contrast-apca-row"><span>Lc 90+</span> <span>Preferred for body text</span></div>
          <div class="contrast-apca-row"><span>Lc 75+</span> <span>Minimum for body text</span></div>
          <div class="contrast-apca-row"><span>Lc 60+</span> <span>Minimum for large text</span></div>
          <div class="contrast-apca-row"><span>Lc 45+</span> <span>Minimum for UI components</span></div>
        </div>
```

For the APCA ratio display, replace the `:style` binding:
```vue
            <span class="gi-data-value contrast-ratio-display" :class="{ 'contrast-ratio-pass': Math.abs(apcaScore) > 60 }">
              Lc {{ Math.round(apcaScore) }}
            </span>
```

Add the about slot before `</ToolPageLayout>`:
```vue
    <template #about>{{ t('contrastChecker.about') }}</template>
```

- [ ] **Step 2: Replace `<style scoped>` block**

```vue
<style scoped>
.contrast-card {
  margin-bottom: 2rem;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.contrast-preview {
  padding: 3rem 2rem;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: background 0.2s, color 0.2s;
}

.contrast-preview-large {
  font-weight: 700;
  font-size: 2.5rem;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
  text-align: center;
}

.contrast-preview-body {
  font-size: 1.125rem;
  max-width: 500px;
  text-align: center;
  font-weight: 400;
  opacity: 0.9;
}

.contrast-controls {
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  background: var(--gi-surface);
}

.contrast-field {
  flex: 1;
  min-width: 150px;
  margin-bottom: 0;
}

.contrast-color-input {
  display: flex;
  gap: 0.5rem;
}

.contrast-color-swatch {
  width: 50px;
  padding: 2px;
  flex-shrink: 0;
}

.contrast-swap-btn {
  padding: 0.5rem;
  border-radius: 50%;
  margin-top: var(--gi-space-md);
}

.contrast-checks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contrast-check-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--gi-border);
}

.contrast-check-label {
  font-size: 0.95rem;
}

.contrast-apca-note {
  font-size: 0.8rem;
  color: var(--gi-text-muted);
  margin-bottom: 1rem;
}

.contrast-apca-table {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--gi-text-muted);
}

.contrast-apca-row {
  display: flex;
  justify-content: space-between;
}

.contrast-apca-row span:last-child {
  font-weight: 500;
}

.contrast-ratio-display {
  font-size: 1.5rem;
  font-weight: 700;
  margin-left: 0.5rem;
}

.contrast-ratio-pass {
  color: var(--gi-tint-green-text);
}
</style>
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:5173/tools/#/contrast-checker — confirm preview area, swap button, WCAG checks, APCA table, and about panel all render correctly.

- [ ] **Step 4: Commit**

```bash
rtk git add src/views/ContrastCheckerView.vue
rtk git commit -m "feat: add category/about to ContrastCheckerView, move inline styles to CSS"
```

---

## Task 7: Fix QrDecoderView and UrlParserView (#pedagogic → #about)

**Files:**
- Modify: `src/views/QrDecoderView.vue`
- Modify: `src/views/UrlParserView.vue`

- [ ] **Step 1: Update QrDecoderView**

In `src/views/QrDecoderView.vue`, add `category="digital"` to the `<ToolPageLayout>` opening tag.

Replace the `#pedagogic` slot:
```vue
    <!-- Before: -->
    <template #pedagogic>
      <GiPedagogic
        :title="t('qrDecoder.pedagogic.title')"
        :description="t('qrDecoder.pedagogic.description')"
        :tips="[
          t('qrDecoder.pedagogic.tip1'),
          t('qrDecoder.pedagogic.tip2'),
          t('qrDecoder.pedagogic.tip3'),
        ]"
      />
    </template>

    <!-- After: -->
    <template #about>{{ t('qrDecoder.about') }}</template>
```

Remove the `GiPedagogic` import from the `<script setup>` block.

- [ ] **Step 2: Update UrlParserView**

In `src/views/UrlParserView.vue`, add `category="digital"` to the `<ToolPageLayout>` opening tag.

Find `<template #pedagogic>` and rename to `<template #about>`. The existing content (collapsible URL guide) is kept as-is but prepend the about text paragraph at the top:

```vue
    <template #about>
      <p>{{ t('urlParser.about') }}</p>
      <!-- existing collapsible guide content stays below -->
      <div class="gi-guide-section">
        ...
      </div>
    </template>
```

- [ ] **Step 3: Verify both in browser**

- Navigate to http://localhost:5173/tools/#/qr-decoder — about panel shows at bottom, GiPedagogic component gone.
- Navigate to http://localhost:5173/tools/#/url-parser — about panel shows the about paragraph + the collapsible URL anatomy guide.

- [ ] **Step 4: Commit**

```bash
rtk git add src/views/QrDecoderView.vue src/views/UrlParserView.vue
rtk git commit -m "feat: migrate QrDecoder and UrlParser from #pedagogic to #about slot"
```

---

## Task 8: Update print tools

**Files:**
- Modify: `src/views/PaperWeightView.vue`
- Modify: `src/views/DpiCheckerView.vue`
- Modify: `src/views/BarcodeView.vue`
- Modify: `src/views/SafetyMarginView.vue`

For each view, make two changes only:
1. Add `category="print"` to the `<ToolPageLayout>` opening tag
2. Add `<template #about>{{ t('toolKey.about') }}</template>` before `</ToolPageLayout>`

The i18n key mapping:
| View | i18n key |
|------|---------|
| PaperWeightView | `paperWeight.about` |
| DpiCheckerView | `dpiChecker.about` |
| BarcodeView | `barcode.about` |
| SafetyMarginView | `safetyMargin.about` |

- [ ] **Step 1: Update PaperWeightView.vue**

Open `src/views/PaperWeightView.vue`. Find the `<ToolPageLayout` opening tag and add `category="print"`. Before the closing `</ToolPageLayout>`, add:
```vue
    <template #about>{{ t('paperWeight.about') }}</template>
```

- [ ] **Step 2: Update DpiCheckerView.vue**

Open `src/views/DpiCheckerView.vue`. Add `category="print"` to `<ToolPageLayout`. Before `</ToolPageLayout>`, add:
```vue
    <template #about>{{ t('dpiChecker.about') }}</template>
```

- [ ] **Step 3: Update BarcodeView.vue**

Open `src/views/BarcodeView.vue`. Add `category="print"` to `<ToolPageLayout`. Before `</ToolPageLayout>`, add:
```vue
    <template #about>{{ t('barcode.about') }}</template>
```

- [ ] **Step 4: Update SafetyMarginView.vue**

Open `src/views/SafetyMarginView.vue`. Add `category="print"` to `<ToolPageLayout`. Before `</ToolPageLayout>`, add:
```vue
    <template #about>{{ t('safetyMargin.about') }}</template>
```

- [ ] **Step 5: Verify in browser**

Spot-check: navigate to http://localhost:5173/tools/#/dpi-checker — confirm "Print" badge appears in header card and about panel shows at bottom.

- [ ] **Step 6: Commit**

```bash
rtk git add src/views/PaperWeightView.vue src/views/DpiCheckerView.vue src/views/BarcodeView.vue src/views/SafetyMarginView.vue
rtk git commit -m "feat: add category/about to print tool pages"
```

---

## Task 9: Update digital tools

**Files:**
- Modify: `src/views/UtmBuilderView.vue`
- Modify: `src/views/RedirectCheckerView.vue`
- Modify: `src/views/PromoCodeView.vue`
- Modify: `src/views/WordCounterView.vue`
- Modify: `src/views/FaviconView.vue`
- Modify: `src/views/MetadataView.vue`

For each view, add `category="digital"` to `<ToolPageLayout` and add the about slot before `</ToolPageLayout>`.

| View | i18n key |
|------|---------|
| UtmBuilderView | `utmBuilder.about` |
| RedirectCheckerView | `redirectChecker.about` |
| PromoCodeView | `promoCode.about` |
| WordCounterView | `wordCounter.about` |
| FaviconView | `favicon.about` |
| MetadataView | `metadata.about` |

- [ ] **Step 1: Update all 6 views** (apply the same 2-line change to each)

For each: add `category="digital"` prop, add `<template #about>{{ t('toolKey.about') }}</template>` before `</ToolPageLayout>`.

- [ ] **Step 2: Verify in browser**

Spot-check: navigate to http://localhost:5173/tools/#/utm-builder — confirm "Digital" badge (blue) in header card and about panel.

- [ ] **Step 3: Commit**

```bash
rtk git add src/views/UtmBuilderView.vue src/views/RedirectCheckerView.vue src/views/PromoCodeView.vue src/views/WordCounterView.vue src/views/FaviconView.vue src/views/MetadataView.vue
rtk git commit -m "feat: add category/about to digital tool pages"
```

---

## Task 10: Update design tools — batch 1

**Files:**
- Modify: `src/views/ColorPaletteView.vue`
- Modify: `src/views/MockupGeneratorView.vue`
- Modify: `src/views/TypeScaleView.vue`
- Modify: `src/views/ColorConverterView.vue`
- Modify: `src/views/ImageCompressorView.vue`
- Modify: `src/views/ImageCropperView.vue`

For each view, add `category="design"` to `<ToolPageLayout` and add the about slot.

| View | i18n key |
|------|---------|
| ColorPaletteView | `colorPalette.about` |
| MockupGeneratorView | `mockupGenerator.about` |
| TypeScaleView | `typeScale.about` |
| ColorConverterView | `colorConverter.about` |
| ImageCompressorView | `imageCompressor.about` |
| ImageCropperView | `imageCropper.about` |

- [ ] **Step 1: Update all 6 views**

For each: add `category="design"` prop, add `<template #about>{{ t('toolKey.about') }}</template>`.

- [ ] **Step 2: Verify in browser**

Spot-check: navigate to http://localhost:5173/tools/#/color-palette — confirm "Design" badge (purple) and about panel.

- [ ] **Step 3: Commit**

```bash
rtk git add src/views/ColorPaletteView.vue src/views/MockupGeneratorView.vue src/views/TypeScaleView.vue src/views/ColorConverterView.vue src/views/ImageCompressorView.vue src/views/ImageCropperView.vue
rtk git commit -m "feat: add category/about to design tool pages (batch 1)"
```

---

## Task 11: Update design tools — batch 2

**Files:**
- Modify: `src/views/ImageFiltersView.vue`
- Modify: `src/views/PlaceholderView.vue`
- Modify: `src/views/LoremIpsumView.vue`
- Modify: `src/views/ImageConverterView.vue`
- Modify: `src/views/ColorblindView.vue`
- Modify: `src/views/PaletteView.vue`

For each view, add `category="design"` to `<ToolPageLayout` and add the about slot.

| View | i18n key |
|------|---------|
| ImageFiltersView | `imageFilters.about` |
| PlaceholderView | `placeholder.about` |
| LoremIpsumView | `lorem.about` |
| ImageConverterView | `imageConverter.about` |
| ColorblindView | `colorblind.about` |
| PaletteView | `palette.about` |

- [ ] **Step 1: Update all 6 views**

For each: add `category="design"` prop, add `<template #about>{{ t('toolKey.about') }}</template>`.

- [ ] **Step 2: Commit**

```bash
rtk git add src/views/ImageFiltersView.vue src/views/PlaceholderView.vue src/views/LoremIpsumView.vue src/views/ImageConverterView.vue src/views/ColorblindView.vue src/views/PaletteView.vue
rtk git commit -m "feat: add category/about to design tool pages (batch 2)"
```

---

## Task 12: Update PdfXView (hidden tool)

**Files:**
- Modify: `src/views/PdfXView.vue`

PdfXView is currently hidden (route commented out). Still update it for consistency.

- [ ] **Step 1: Add category and about**

Open `src/views/PdfXView.vue`. Add `category="print"` to `<ToolPageLayout`. Before `</ToolPageLayout>`, add:
```vue
    <template #about>{{ t('pdfX.about') }}</template>
```

Note: The `pdfX` i18n section key may be `pdfX` or `pdf` — check the existing key in `fr.ts` and match it exactly. The about text was added in Task 2 under key `pdfX`.

- [ ] **Step 2: Commit**

```bash
rtk git add src/views/PdfXView.vue
rtk git commit -m "feat: add category/about to PdfXView (hidden tool)"
```

---

## Task 13: Run full test suite and final visual check

- [ ] **Step 1: Run tests**

```bash
rtk npm test
```
Expected: 227 tests pass, 0 failures.

- [ ] **Step 2: Build to catch TypeScript errors**

```bash
rtk npm run build
```
Expected: build succeeds with no type errors. If you see "Property 'about' does not exist on type", it means a tool section in `fr.ts` or `en.ts` is missing the `about` key added in Task 2 — add it.

- [ ] **Step 3: Visual spot-check — one tool per category**

- Print: http://localhost:5173/tools/#/dpi-checker — green "Print" badge ✓
- Digital: http://localhost:5173/tools/#/utm-builder — blue "Digital" badge ✓
- Design: http://localhost:5173/tools/#/contrast-checker — purple "Design" badge ✓
- Migrated: http://localhost:5173/tools/#/px-to-rem — full ToolPageLayout layout ✓
- About panel: scroll to bottom on any page — "ABOUT THIS TOOL" panel with accent bar ✓
- Dark mode: toggle dark mode in header — header card, badges, about panel all adapt ✓

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
rtk git add -p
rtk git commit -m "fix: address issues found in final visual check"
```
