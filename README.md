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

- Richard Waldron, Director — 07825 071298 — Rich@clevelandconstruction.co.uk
- Sarah Waldron, Office Manager

There is no enquiry form. The telephone and email links use `tel:` and `mailto:`.

## Add photographs

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
5. In `index.html`, change the canonical URL, `og:url`, `og:image` and the address in the structured data to the new domain.
