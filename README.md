# tommasoferrario18.github.io

Personal portfolio of Tommaso Ferrario, served at <https://tommasoferrario18.github.io/>.

It's a single static page with no build step or dependencies: plain HTML, CSS and a little JavaScript.

## Structure

```
index.html              the whole site
404.html                "page not found" page
assets/css/styles.css   styles (colour and font tokens at the top)
assets/js/main.js       project filter + footer year
assets/images/          avatar, logos, project thumbnails, favicons
files/CV.pdf            resume linked from the header and footer
```

## Editing content

Everything is in `index.html`. Each section is a `<section id="...">` block.
Projects are `<article class="project" data-kind="Professional|Academic">` blocks. The filter
counts come from `data-kind`, so a new project only needs a new `<article>`.
Add `thumb--cover` to a thumbnail to crop the image to fill the box instead of fitting it.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Every push to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml). The workflow
copies the site files into `_site/` and publishes them with the official GitHub Pages actions.
You can also start it by hand from the Actions tab.

One-time setup: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
