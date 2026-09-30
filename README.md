# Pink Beluga

A small online shop for hand-made art, jewellery and accessories.
It is a plain HTML/CSS/JavaScript site: no build step, no server and no database, so it runs on any static host.

**Live site (once GitHub Pages is on):** https://bertqrt.github.io/Pink-Beluga/

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home: hero, mission, featured products, reviews, newsletter |
| `shop.html` | Every product, with category filters and "Add to bag" |
| `about.html` | The brand story |
| `contact.html` | Contact form and FAQ |
| `404.html` | Shown for any missing page |
| `Pink Beluga.html` | Redirects old links to `index.html` |

## Put it online with GitHub Pages (free)

1. On GitHub, open the repo, then **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
3. Choose branch **main** and folder **/ (root)**, then **Save**.
4. After a minute or two the site is live at `https://bertqrt.github.io/Pink-Beluga/`.

The site also works on Netlify, Vercel or Cloudflare Pages: drag the folder in, or connect the repo with no build command.

### Custom domain (optional)
If you buy a domain, add it under **Settings → Pages → Custom domain**, then update the URLs in
`sitemap.xml`, `robots.txt` and the `canonical` / `og:` tags at the top of each page.

## Make it yours: `assets/js/config.js`

```js
email: 'you@example.com',   // orders + contact form fall back to email
whatsapp: '233201234567',   // enables "Order on WhatsApp" in the bag
formEndpoint: '',           // optional, e.g. a Formspree URL, see below
```

- **Orders:** customers fill the bag, then press *Order on WhatsApp* or *Order by email*.
  The message is pre-written with the items and total. You confirm payment (e.g. mobile money) with them yourself.
  The site never handles card details.
- **Contact and newsletter forms:** with only `email` set, they open the visitor's email app.
  For forms that send straight from the page, create a free form at [formspree.io](https://formspree.io),
  then paste its endpoint into `formEndpoint`.

## Editing products: `assets/js/products.js`

Each product looks like this:

```js
{ id: 'mug', name: 'Polka Pink Mug', category: 'Home', price: 65,
  image: 'assets/img/products/mug.svg', description: '…', featured: true }
```

- `featured: true` shows it on the home page.
- New categories appear as filter buttons automatically.
- To use real photos, put them in `assets/img/products/` (JPG or WebP, about 900×600) and change `image`.

## Try it on your computer

Open `index.html` in a browser, or run a tiny local server from this folder:

```sh
python3 -m http.server 8000   # then visit http://localhost:8000
```

## What's built in

- Works on phones, tablets and desktops, with a mobile menu
- Automatic dark mode
- Accessibility: skip link, keyboard-friendly bag, visible focus rings, good colour contrast, reduced-motion support
- SEO and sharing: page descriptions, social preview image, sitemap and robots.txt
- Installable icon (web manifest) and a custom 404 page

## Arduino sketches

`Counter_and_LED.ino` and `Jojo_theme.ino` are separate Arduino practice sketches and are not part of the website.
