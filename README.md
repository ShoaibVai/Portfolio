# Portfolio

## Accessibility & Performance Improvements

- Increased base font sizes and adjusted small text to a minimum of 12px for better readability on mobile.
- Improved button and input sizes for touch accessibility (min target size >= 44px).
- Added responsive canvas/image scaling in the intro header.
- Added UI/UX enhancers: AOS (scroll animations), Typed.js, VanillaTilt.
- Added UI/UX enhancers: AOS (scroll animations), Typed.js, VanillaTilt.
- Removed Particles.js to improve mobile performance and simplicity.
- Enforced mobile-friendly font sizes (12-18px) and improved touch targets for controls.
- Added a build script to minify local JS files via terser (requires Node.js and npm).

### Build / Minify Instructions

1. Install dependencies:

```
npm install
```

2. Minify JavaScript files (produces `*.min.js` versions):

```
npm run build
```

Note: If you prefer not to minify locally, `js/enhancements.min.js` is already included and loaded by default.


