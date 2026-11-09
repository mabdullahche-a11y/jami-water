# Rebrand Jami Water

1. **Set the identity.** Edit `assets/config.js`. Replace the name, tagline, city, business contacts, WhatsApp digits, hours, address, map links and delivery windows. WhatsApp digits include the country code with no plus sign or spaces.
2. **Set the look.** Edit the theme tokens, typefaces and radii in the same file. Ocean is the default. Preview `index.html?theme=aqua` or `index.html?theme=midnight`. Use `?theme=ocean` to return to the default. For different fonts, add local font files and update `assets/fonts/local.css`.
3. **Load the proof.** Replace licence and certificate fields and URLs, approved-lab name, report PDFs, measured values, batch links and filter records. Set `enabled` on each treatment stage. Put real plant, filter-room, team and delivery photos in `assets/`, then set each photo’s `src` and `alt`. Use relative paths from the site root.
4. **Load the offer and copy.** Confirm prices, refundable deposit, plans, offers, add-ons, routes and FAQs. Set `reviews.sampleReviewsEnabled: false` to hide demo reviews. Replace them with genuine reviews, add the Google profile URL, and leave rating fields null until verified. Review Urdu and guide sources before publishing.
5. **Regenerate, verify and publish.** Replace sample records before setting `demoMode: false`. Run `node build.cjs` to refresh the static pages and Vercel’s matching `X-Robots-Tag` rule, including after changing article slugs. Remove any retired article HTML explicitly. Run `node verify.cjs` with Playwright installed, then open `index.html` or deploy the folder to Vercel. For a local Chromium-based browser, set `JAMI_BROWSER` to its executable path.

The site loads its content and fonts locally. The optional map, WhatsApp and other external destinations require connectivity. The map loads only when requested.

