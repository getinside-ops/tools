# QR Code Creator - Design

## Overview
Client-side QR code generator with full customization. Pairs with existing QR decoder at `/qr-decoder`.

## Features

### Content Types
- **URL** — Input field with URL validation
- **Text** — Plain text / multiline
- **WiFi** — SSID, password, encryption type (WPA/WEP/None)
- **vCard** — Name, phone, email, organization, address

### Customization Options
- **Size**: 128px – 512px (preset: 256px)
- **Foreground color**: Color picker (default: #000000)
- **Background color**: Color picker (default: #FFFFFF)
- **Logo**: Upload center image (max 20% of QR size)
- **Error correction**: L/M/Q/H (default: M)

### Output
- Download as PNG
- Download as SVG
- Copy to clipboard (PNG)

## Architecture

```
useQrCreator.ts         → QR generation logic (qrcode lib)
QrCreatorView.vue      → UI component
```

### Dependencies
- `qrcode` — popular, well-maintained JS library for QR generation

## UI Layout

```
┌─────────────────────────────────┐
│ [Content Type Tabs]             │
├─────────────────────────────────┤
│ Content Input Area              │
│ (varies by type)                │
├─────────────────────────────────┤
│ [Customization Accordion]       │
│  - Size, Colors, Logo, Error corr.│
├─────────────────────────────────┤
│ ┌─────────────┐                   │
│ │   QR Code  │  [PNG] [SVG] [📋]│
│ │  Preview   │                   │
│ └─────────────┘                   │
└─────────────────────────────────┘
```

## Integration Steps
1. Add composable `useQrCreator.ts`
2. Add view `QrCreatorView.vue`
3. Add route `/qr-creator`
4. Add nav link in header
5. Add translations (fr.ts source, en.ts)
6. Add to HomeView tool grid

## Estimated Scope
~200 LOC composable + ~250 LOC view — straightforward implementation.