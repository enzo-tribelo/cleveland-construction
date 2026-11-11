# Cleveland Construction Ltd

Single-page brochure for Cleveland Construction Ltd. The copy and photographs come from the company’s project-portfolio presentation. The Viola Bank project is intentionally left out and should not be added back.

The site is static HTML, CSS and a small script. Pushing to `main` publishes it with GitHub Actions.

Live site: https://enzo-tribelo.github.io/cleveland-construction/

## Edit the content

- Page text, project write-ups and contact details are in `index.html`.
- Visual styling is in `css/styles.css`.
- The mobile menu and the photograph viewer are in `js/main.js`.
- Photographs live in `assets/images/`. Keep new files as WebP or JPEG, and no wider than about 1600 pixels, so the page stays fast.

Contact details on the page:

- Richard Waldron, Director — 07825 071298 — rich@clevelandconstruction.co.uk
- Sarah Waldron, Office Manager — sarah@clevelandconstruction.co.uk

There is no enquiry form. The telephone and email links use `tel:` and `mailto:`.

## Add photographs

New project photos are still to come from Rich. Until then, keep the photographs already on the site, including the Claremont House images.

St James Square is written up from the brochure, which did not include pictures of it. Northend already uses the three site photographs from the brochure; more can be added in the same way.

1. Export each photo as WebP (or JPEG), longest side about 1600 pixels.
2. For St James Square, save files in `assets/images/st-james-square/`. For extra Northend pictures, save them in `assets/images/northend/`.
3. In `index.html`, find the comment inside the St James Square project (or the Northend gallery) and follow the example markup. Give every image a short `alt` description of what it shows.
4. Commit and push to `main`. The Pages workflow publishes the change.

## Deploy

`.github/workflows/deploy.yml` runs on every push to `main`. It uses the official GitHub Pages actions (`configure-pages`, `upload-pages-artifact`, `deploy-pages`).

Pages has to be switched on once by someone with admin access to the repository. The workflow cannot do that itself: GitHub returns “Resource not accessible by integration” for this app.

1. Open [Settings → Pages](https://github.com/enzo-tribelo/cleveland-construction/settings/pages).
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the [Deploy GitHub Pages workflow](https://github.com/enzo-tribelo/cleveland-construction/actions/workflows/deploy.yml), select the latest run, and choose **Re-run failed jobs**.

After that, every push to `main` publishes on its own. The source must stay on **GitHub Actions** (not “Deploy from a branch”).

Asset links in the HTML are relative (`assets/...`, `css/...`), so the site works at `https://enzo-tribelo.github.io/cleveland-construction/` without a leading-slash path.

## Add a custom domain later

Do not add a `CNAME` file until the domain is ready. When it is:

1. Open the repository on GitHub and go to Settings → Pages.
2. Under Custom domain, enter the domain and save. GitHub will create a `CNAME` file; commit it if it is not already on `main`.
3. At the domain host, add DNS records:
   - For an apex domain such as `clevelandconstruction.co.uk`, add these A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - For `www`, add a CNAME record pointing to `enzo-tribelo.github.io`.
4. After DNS has updated, turn on Enforce HTTPS in the Pages settings.
5. In `index.html`, change the canonical URL, `og:url`, `og:image` and the `url` in the structured data to the new domain. Update the same address in `robots.txt` and `sitemap.xml`.

## Analytics and Search Console

Both are off until the client supplies IDs. With the defaults, the site loads no Google script and sets no analytics cookies.

### Google Analytics 4

1. Open `js/config.js`.
2. Set `GA_MEASUREMENT_ID` to the GA4 measurement ID, for example `G-XXXXXXXXXX`.
3. Commit and push to `main`.

When that ID is empty, nothing analytics-related runs. When it is set, a cookie banner appears with equal **Reject** and **Accept** buttons. The choice is stored in `localStorage` under `cleveland-analytics-consent`. Google Consent Mode v2 defaults to denied. `gtag.js` is loaded only after Accept, and only `analytics_storage` is granted. Advertising storage stays denied. Reject leaves analytics unloaded. Clear the site data for this domain to see the banner again.

### Search Console

Prefer a DNS TXT record once the custom domain is connected. That does not require a tag in the page.

If you need the HTML tag instead, edit the commented placeholder in the `<head>` of `index.html`:

```html
<meta name="google-site-verification" content="paste-the-token-here">
```

Remove the comment marks so the tag is live, then commit and push.

After the custom domain is serving this site, submit `sitemap.xml` in Search Console (for example `https://your-domain/sitemap.xml`).

## Social links

Profiles are off until real URLs exist. With the defaults, the footer and contact section show no social icons.

1. Open `js/config.js`.
2. Paste a full `https://` address into `SOCIAL_LINKS` for any of `instagram`, `facebook`, `linkedin`, `houzz`, or `x`. Leave the others as `""`.
3. Commit and push to `main`.

Only filled-in links are shown. If every value is empty, the row is not added. Each link opens in a new tab and is named for screen readers, for example “Cleveland Construction on Instagram”.

JSON-LD cannot read `js/config.js`. When the URLs are known, also add a `sameAs` array to the structured data in `index.html`. A commented example sits just above that script.
