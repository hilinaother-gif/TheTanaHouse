THE TANA HOUSE RESTAURANT WEBSITE
=================================
Open index.html in a browser. Food images and page fonts work locally; map links need internet. QR cards may load optional web fonts.

Files
  index.html, menu.html           English pages
  index-es.html, menu-es.html     Spanish pages
  index-am.html, menu-am.html     Amharic pages
  index-so.html, menu-so.html     Somali pages
  index-vi.html, menu-vi.html     Vietnamese pages
  qr-card.html                    Printable QR menu cards (not linked on the site; open it directly)
  assets/css/styles.css      Warm paper palette, classic serif type and open page layouts
  assets/css/menu.css        Menu browsing layout, category rail and responsive dish rows
  assets/css/responsive.css  Fluid gutters, open mobile layouts and readable menu columns
  assets/js/main.js          Opening status, language control, menu search, filters and category navigation
  assets/js/motion.js        Gentle entrances, photograph reveals and filtered-result motion
  assets/js/languages.js     Greetings, opening status and result counts in all five languages
  assets/i18n/strings.tsv    Amharic, Somali and Vietnamese translation source
  scripts/build-translations.py  Rebuild translated pages after changes to the English pages
  assets/js/content.js       Optional real restaurant photos and attributed customer reviews
  assets/img/logo*.png       Your logo: full, light (for dark backgrounds), emblem

Quick edits (top of assets/js/main.js)
  HOURS     opening hours, used by the live "Open now" badge
  TIMEZONE  restaurant timezone (America/Chicago), used by opening status

Before going live
  - The confirmed phone number is (612) 481-3306. Call buttons, contact links and restaurant structured data use +16124813306.
  - Add your website address as "url" in the Google info block once the site has a domain.

Photos
  Replace existing images with your own photos using the same filenames:
    assets/img/dishes/<dish-name>.jpg   small square thumbnails for all 62 menu items
    assets/img/photos/<section>.jpg    hero, favourites, kitchen and menu section images
  File names and ready-to-use image prompts for every dish: DISH-PHOTO-PROMPTS.txt

  Missing image references and external stock-image fallbacks have been removed.
  All menu items now have a matching image in both languages. New thumbnails are
  320 x 320 JPEGs, loaded lazily and displayed at 80px on desktop and 64px on phones.
  The 58 new images were generated with the built-in image_gen tool; their prompts
  are recorded in assets/img/dishes/generation-prompts.json.

Real restaurant photos and customer reviews
  Add real venue photos to assets/js/content.js under gallery. Each entry includes src,
  alt: { en: "...", es: "..." }, and optional caption: { en: "...", es: "..." }.
  The gallery appears on both homepages when it has a usable photo.

  Add genuine reviews under reviews with text: { en: "...", es: "..." }, author,
  sourceUrl and sourceLabel. Include only quotes you have permission to feature.
  Reviews appear with attribution and a source link. No sample reviews are published.
  Empty gallery/review sections stay hidden. Google Maps links are already available
  in the visit section for location details, photos and guest reviews.

Spanish pages
  The Spanish pages are generated from the English ones. If you change a price or dish in
  menu.html, make the same change in menu-es.html (or ask for the pages to be regenerated).

Languages
  The header language picker offers English, Español, አማርኛ, Soomaali and Tiếng Việt.
  Every language includes a homepage and a full 62-item menu. Switching language keeps
  the current page and section. Navigation and footer links stay in the chosen language.
  Search accepts local dish names and the original English dish names.
  Amharic uses Noto Sans Ethiopic and Noto Serif Ethiopic for readable native script.
  To rebuild the three added editions: python3 scripts/build-translations.py
  Edit assets/i18n/strings.tsv for static text and assets/js/languages.js for live text.

QR menu cards
  Open qr-card.html once the site is online: it fills in your live menu address automatically
  (or type it in). Choose English, Spanish or both, then Print. Cards are 4 x 6 in, stickers 3 in.
  Spanish cards point to menu-es.html automatically.

Generated food illustrations (November 2026): All 62 menu items now have thumbnails, including drinks and desserts. The original four images for Blueberry Pancakes, Denver Omelet, Classic Cheeseburger and Chicken Club are preserved. These are AI-generated illustrative images, not photographs of actual Tana House dishes.

Page structure and visual direction (November 2026)
  Inspired by the restrained composition of https://kingrestaurant.nyc/celebrate-at-king:
  a warm paper background, centered original logo and navigation, modest serif
  headings, thin dividers, outlined links and open photograph/text sections.
  The homepage presents breakfast and lunch, four text-only house favourites,
  a Mexican breakfast photograph, the kitchen story and useful visit details.
  The footer stays compact on the same background. Repeated card labels, dark
  feature panels, oversized page greetings and the fixed phone action bar have been
  removed. Opening status, language switching and contact links remain.

Menu layout
  All 62 dish names, descriptions, prices, filter tags and original image references
  remain in every language. The menu uses two columns of text on larger screens and
  one on phones, with understated section headings and no visible dish thumbnails.
  Search, filters, result counts, empty states and reset/clear controls remain active.
  A horizontal category rail sticks to the top after the centered header scrolls away.

Typography and color
  Page backgrounds use warm paper #FDFBF7, with dark ink and subtle forest green
  links. The original gold-and-green logo is unchanged. Local Baskerville/Palatino/
  Georgia serif stacks avoid a dependency on third-party font loading. Amharic uses
  Kefa with Noto fallbacks. Page titles and section headings use the existing deep
  forest green #142C25. Decorative pattern assets remain unused.

Languages and responsive layout
  All five editions share the same structure and styles. Rebuild Amharic, Somali and
  Vietnamese pages with python3 scripts/build-translations.py after English edits;
  Spanish remains its own source edition. Header links stay visible and can wrap on
  narrow screens. The language menu, categories and filters scroll within the space
  available. Gutters account for device safe areas; reduced-motion settings disable
  smooth scrolling. Printed QR cards retain their original artwork and border.

Welcome popup
  Every edition loads assets/js/welcome.js after the shared page scripts. A localized
  welcome appears once per tab session, using the original logo, paper background,
  deep green heading, fine border and outlined actions. Visitors can dismiss it with
  the close button, secondary action, Escape or the backdrop. On menu pages its menu
  action closes the popup and focuses search. Keyboard focus stays within the open
  dialog, short screens can scroll inside it, and reduced motion is respected.
  The page-level food-image notices have been removed in every language.

Motion and welcome copy
  The welcome saying reads: “Life’s too short for boring breakfasts. Pass the pancakes.”
  All five locales have a matching playful line in assets/js/languages.js.
  Every page loads motion.js after welcome.js. Page entrances begin after the welcome
  closes. Sections fade and rise once, food images settle gently into place, and
  restored menu results receive a short stagger. Buttons lift slightly on hover,
  navigation underlines draw in, and photographs have a subtle hover zoom.
  Content is visible without JavaScript, keyboard focus cancels obscuring motion,
  and reduced-motion preferences stop active effects and disable CSS animations.

Readability refinements
  On screens up to 736px, the header uses a 112px logo, less vertical padding and
  a smaller navigation gap. Homepage photography begins about 58px sooner on a
  typical phone. Main paragraph text uses 17px, with 18px desktop introduction text.
  The welcome keeps its title, pancake saying and actions; the extra generic
  sentence has been removed from the template and all five locale dictionaries.

Small sketches
  Three original SVG line drawings in assets/img/sketches add restrained green-and-
  gold accents: a plate at house favourites and the menu title, a coffee cup at the
  kitchen story, and a sunrise above visit details. They stay small on phones and
  leave the compact header, homepage introduction and welcome popup unchanged.
  Empty alt text and aria-hidden mark them as decorative. The kitchen sketch joins
  the existing gentle section entrances and respects reduced-motion preferences.
