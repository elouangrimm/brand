# brand.elouan.xyz

Brand kit and asset manager. One place for all colors, profile pictures, banners, fonts, and project cards.

## Features

- Color palette with click-to-copy hex values and CSS variable export
- Profile picture gallery with all variants and originals
- Embedded PFP generator (from pfpgen.e5g.dev) with brand lookup
- Banner gallery matching each profile picture
- Card generator with logo upload, text customization, and project presets
- Font reference with download links and copyable font stacks
- Image store with click-to-copy and right-click-to-download

## Configuration

All data is driven by `brand-data.json`. Edit it to add/remove colors, images, fonts, projects, etc.

### Asset directories

```
assets/
├── pfp/              # Profile pictures
│   ├── originals/    # Higher resolution originals
│   ├── base_dark.png # PFP generator base sprites
│   └── base_light.png
├── banners/          # Banner images
│   └── originals/
├── logos/            # Project logos (for card generator)
├── fonts/            # Font files (if self-hosting)
└── misc/             # Miscellaneous brand images
```

## Usage

- **Colors**: Click any swatch to copy the hex. Use "Copy All as CSS Variables" for the full set.
- **Profile Pictures**: Click to download. Expand "Show Originals" for high-res versions.
- **PFP Generator**: Pick a color or fetch from brand.dev, adjust noise, download at any size.
- **Banners**: Click to download the matching banner.
- **Card Generator**: Upload a logo, set title/subtitle/colors, use presets for quick project cards.
- **Fonts**: Download font files or copy the font stack string.
- **Image Store**: Left-click copies to clipboard, right-click downloads.

## Deployment

Deployed on [Vercel](https://vercel.com) at [brand.elouan.xyz](https://brand.elouan.xyz).

## Tech Stack

- Plain HTML5
- CSS3 (custom properties, no preprocessor)
- Vanilla JavaScript (ES6+)

## Design System

This project uses [Elouan's Design System](https://e5g.dev/css).

## License

MIT
