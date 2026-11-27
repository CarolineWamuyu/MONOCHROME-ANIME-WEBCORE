# KUROINK: monochrome anime webcore portfolio

A personal homepage and portfolio built with plain HTML, CSS and JavaScript, plus GSAP, ScrollTrigger, Lenis and Lucide.

## Run it
Open `index.html` through any local server, for example `python3 -m http.server`, then visit http://localhost:8000.
(Opening the file directly with file:// also works, but some browsers block local font preloads.)

## Structure
```
index.html
css/style.css
js/main.js          smooth scroll, nav, mobile menu, filters, guestbook, contact form, experiments
js/animations.js    GSAP entrance, floating, scroll-triggered and hover animations
js/vendor/          gsap 3.12.5, ScrollTrigger, lenis 1.1.13, lucide 0.460.0 (bundled locally, no CDN)
assets/images/      original SVG illustrations and project thumbnails
assets/icons/       pixel icons, sparkle, favicon
assets/textures/    halftone, screentone, speed lines, grain
assets/fonts/       Dela Gothic One, Silkscreen, Space Mono, DotGothic16 (SIL Open Font License)
```

## To do before going live
1. **Contact form:** create a form at formspree.io and replace `YOUR_FORM_ID` in `index.html`.
   Until you do, the form shows a "not connected yet" message instead of sending.
2. **Guestbook:** entries are saved in the visitor's own browser (localStorage), so other visitors
   won't see them. To make it public, send entries to a backend inside the guestbook submit
   handler in `js/main.js` (Formspree, Supabase or a serverless function all work).
3. Replace the placeholder name, email, projects and links with your own.

## Art & licensing
Every illustration, thumbnail, texture and icon in `assets/` was drawn for this project as an
original SVG. There are no third-party characters and no downloaded images, so there's nothing to
attribute. Fonts are OFL-licensed and the libraries are MIT/ISC (GSAP uses its standard free
"no charge" licence).
