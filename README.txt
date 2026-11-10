THE TANA HOUSE RESTAURANT WEBSITE
=================================
Open index.html in a browser. Food images are bundled locally; internet is needed for Google Fonts and map links.

Files
  index.html, menu.html           English pages
  index-es.html, menu-es.html     Spanish pages
  index-am.html, menu-am.html     Amharic pages
  index-so.html, menu-so.html     Somali pages
  index-vi.html, menu-vi.html     Vietnamese pages
  qr-card.html                    Printable QR menu cards (not linked on the site; open it directly)
  assets/css/styles.css      Peach, burnt orange, ochre and espresso palette
  assets/css/menu.css        Menu browsing layout, category sidebar and responsive dish cards
  assets/css/responsive.css  Fluid gutters, adaptive cards, tablet layouts and short-screen navigation
  assets/js/main.js          Local-time greetings, opening status, mobile navigation, menu search and filters
  assets/js/motion.js        One-time scroll reveals, staggered entrances and filtered-result motion
  assets/js/languages.js     Greetings, opening status and result counts in all five languages
  assets/i18n/strings.tsv    Amharic, Somali and Vietnamese translation source
  scripts/build-translations.py  Rebuild translated pages after changes to the English pages
  assets/js/content.js       Optional real restaurant photos and attributed customer reviews
  assets/img/logo*.png       Your logo: full, light (for dark backgrounds), emblem

Quick edits (top of assets/js/main.js)
  SPECIAL / SPECIAL_ES   the banner text (English / Spanish) at the top of every page (set to "" to hide it)
  HOURS     opening hours, used by the live "Open now" badge
  TIMEZONE  restaurant timezone (America/Chicago); the greeting uses the visitor's device time

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
  The menu heading identifies them as AI-generated food illustrations.
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

Generated food illustrations (November 2026): All 62 menu items now have thumbnails, including drinks and desserts. The original four images for Blueberry Pancakes, Denver Omelet, Classic Cheeseburger and Chicken Club are preserved. These are AI-generated illustrative images, not photographs of actual Tana House dishes. The menu heading and footer identify the images as illustrative. Update those notices once all images are actual restaurant photography.

Design update (November 2026)
  English and Spanish pages use a simplified hero, consistent food images, rounded
  buttons, readable type, clearer menu prices and an always-visible mobile action bar.
  The full-screen intro has been removed. Sections and food cards reveal once as
  they enter the screen, with gentle hover/tap feedback and a brief photo entrance.
  Motion respects reduced-motion settings, including changes during the visit.
  Content is visible by default and no animation library is required.
  Menu search ignores accents; filters can be combined with search and reset from
  the empty state. All 62 dishes, prices and descriptions are preserved in each language.

Menu refresh (November 2026)
  The menu uses two-column dish cards on larger screens and a single column on phones.
  Desktop categories stay in a sidebar; smaller screens get a swipeable category bar.
  Category counts and section counts update with search and filters. Clear-search and
  clear-filter buttons are available in the toolbar, and the category search button
  returns keyboard focus to the search field. Small thumbnails and motion are retained.

Responsive layout
  Pages adapt to narrow phones, tablets, desktop screens and larger default text.
  Card columns depend on the available space. Tablet sections stack and narrow phone
  favourites/footer sections use one column. Gutters account for device safe areas.
  Header menus scroll within the available screen height. The mobile quick-action bar
  becomes compact in landscape and stays out of the way of open menus and search.

Color refresh (November 2026)
  The palette takes its direction from https://earthgirlcreative.com/: peach #F9E7C9,
  burnt orange #82400C and ochre #D3962B, with espresso for dark sections.
  Shared CSS color tokens keep the homepage, menu and all five languages consistent.
  Menu controls, woven SVG details, browser theme colors and QR cards use the new palette.
  Original logo artwork is preserved.

Ethiopian pattern details
  Original tibeb-inspired stepped diamonds carry through every language.
  Section breaks are clean, with no full-width woven divider bands.
  Printed QR cards retain the small border in assets/img/tibeb-border.svg.
  The light and dark section patterns use section-weave.svg and section-arches.svg.
  Faint motifs fade out near section edges, leaving clear space around copy and dish images.
  Decorative site patterns are hidden for printing and forced-color accessibility modes;
  QR card bands remain in the printed cards.
  Weaving reference: https://digitalcommons.unl.edu/tsaconf/168/

Welcome and motion
  The first homepage or menu opened in a tab shows a localized welcome once per session.
  The original greeting reads: “May your coffee be warm, your plate be full, and your day
  a little brighter.” Edit welcome strings in assets/js/languages.js.
  assets/js/welcome.js handles the native dialog, close button, Escape, backdrop dismissal
  and menu link. Visitors can continue immediately; the dialog never closes on a timer.
  Page entrances begin after dismissal. Sections reveal on scroll, food photos ease into
  place, and buttons/cards respond on hover. Reduced-motion preferences stop animations.
