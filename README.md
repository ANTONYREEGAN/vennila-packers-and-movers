# Vennila Packers and Movers — Website

A static, responsive website built with plain HTML5, CSS3 and JavaScript.
No backend, no database, no build step. It runs on any static host
(GitHub Pages, Netlify, Vercel, Cloudflare Pages, or regular shared hosting).

## Project structure

```
index.html          Home: hero, free quote form, services, about, why choose us, gallery preview
about.html          About Us
services.html       Our Services: service cards, how it works, gallery section
gallery.html        Gallery: "Moments from Our Work" with lightbox
contact.html        Contact details, WhatsApp enquiry form, map area
css/style.css       All styles (colours, layout, responsive breakpoints)
js/script.js        Menu, forms, WhatsApp, service preselection, lightbox
images/             Your original photos (left unchanged)
images/optimized/   Resized web copies used by the site (fast loading)
images/optimized/thumbs/  Smaller copies used in grids and cards
images/logo.svg     Logo mark, also used as the favicon
```

## How to view it

Double-click `index.html` to open it in a browser. Everything works when opened
from your computer, including the WhatsApp forms.

## How the WhatsApp forms work (important)

This is a static website, so **nothing is stored or emailed automatically**.

1. The customer fills in the quote form (Home page) or the enquiry form (Contact page).
2. The form checks that all required fields are filled and that the mobile number is valid.
3. When they click the button, WhatsApp opens (the app on phones, WhatsApp Web on computers)
   with a message already written that contains all their details.
4. **The customer must press Send in WhatsApp** for the enquiry to reach you.
   WhatsApp does not allow any website to send a message automatically; the
   final Send tap always happens inside WhatsApp. If the customer closes WhatsApp
   without pressing Send, you will not receive anything.

## Changing the WhatsApp number

Open `js/script.js` and edit this line near the top:

```js
WHATSAPP_NUMBER: "918190908066",
```

Use the country code + number, digits only (no `+`, spaces or hyphens).
Every WhatsApp button and both forms read from this one value.

The HTML pages also contain `https://wa.me/918190908066` as a fallback for
visitors with JavaScript turned off. If you change the number, use your editor's
search-and-replace across all `.html` files too. The phone number shown on the
pages (`+91 81909 08066` and `tel:+918190908066`) is also in the HTML files.

## Details to update later

- **Open Graph links**: once you have a domain, change the `og:url` and `og:image`
  values in each page's `<head>` to full addresses
  (for example `https://www.yourdomain.com/images/optimized/vennila-moving-truck.jpg`),
  so links shared on WhatsApp/Facebook show a preview image.
- Contact details (phone, email, address, Justdial link) are written directly in the
  HTML pages. Use search-and-replace across all `.html` files to change them.

## Service "Get a Quote" buttons

Each card on the Services page links to the home page with the service in the URL, for example:

```
index.html?service=Home%20Shifting#quote
```

`js/script.js` reads `service` from the URL, selects that option in the quote form's
dropdown, and scrolls to the form.

## Images

Your original photos in `images/` were not changed. The site uses resized copies in
`images/optimized/` (large, for the lightbox and banners) and `images/optimized/thumbs/`
(small, for grids and cards).

Not used on the site:
- `01_justdial_award.jpg.jpeg`: a phone screenshot of a certificate. It was left out
  because the site avoids award claims. Add it back if you want to show it.
- `02_wrapped_cartons.jpg.jpeg` and `04_appliance_cartons.jpg.jpeg`: same photos as
  the "Enhanced" versions, which are used instead.
- `10_moving_boxes_gallery_2.jpg.jpeg`: a small, low-resolution screenshot.
- `09_moving_boxes_gallery.jpg.jpeg` is used after cropping off the phone app screen.

### Adding a new photo to the gallery

1. Resize the photo to about 1600px on the longest side and save it as
   `images/optimized/your-photo.jpg`. Save a second copy about 720px wide as
   `images/optimized/thumbs/your-photo.jpg`. (Free tools: squoosh.app, or any photo editor.)
2. In `gallery.html`, copy one existing `<a class="gallery-item" ...>` block and change
   the file names, the `alt` text, `data-caption` and the caption text.

**Note:** file names are case-sensitive on most web hosts. Keep the folder name `images`
in lowercase, exactly as the HTML refers to it.

## Colours

Defined once at the top of `css/style.css`:

| Name | Value |
|---|---|
| Primary navy | `#0B2345` |
| Secondary blue | `#123F70` |
| Primary yellow | `#FFB800` |
| White | `#FFFFFF` |
| Light background | `#F5F8FC` |
| Text | `#263238` |

## Responsive breakpoints

- Mobile: up to 480px
- Tablet: 481px – 768px
- Laptop: 769px – 1200px (menu switches to the hamburger below 1025px)
- Desktop: 1201px and above

## Deploying

Upload the whole folder (keeping its structure) to any static host. For example,
on Netlify you can drag and drop the folder onto https://app.netlify.com/drop.
