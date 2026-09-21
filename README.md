# Gerasimos Balatsoukas: engineering portfolio (website, v3)

A single-page static site: plain HTML, CSS and JavaScript, no build step, no frameworks, no tracking and no third-party requests. It opens straight from the folder (double-click `index.html`) and works the same once published.

Last rebuilt on 17 September 2026 from `PORTFOLIO_V3_PLAN.md`.

## What is in this folder

| Path | What it is |
|---|---|
| `index.html` | All the words, figures and page structure. The comment at the top is a short editing guide. |
| `css/site.css` | Every colour, font, size and layout rule, plus the print layout used by "Save as PDF". |
| `js/site.js` | The theme control, mobile menu, switching between pages, print buttons, lightbox, hero clip and scroll reveals. |
| `images/` | Figures as WebP (a full-size file and, for wide ones, an `-800` copy), card and thumbnail crops, `og-card.png` (the link preview), `favicon.svg` and `apple-touch-icon.png`. |
| `media/` | The six clips, as MP4. |
| `fonts/` | Archivo, Schibsted Grotesk and Martian Mono, self-hosted, each with its licence. |
| `Gerasimos_Balatsoukas_CV.pdf` | The CV that the "Download CV" buttons open. |
| `404.html` | The page GitHub Pages shows for a wrong address. |
| `robots.txt`, `sitemap.xml` | For search engines. |
| `.nojekyll` | Tells GitHub Pages to publish the files as they are. |

Everything that must stay private (notes, original screenshots, old clips, scripts) is in the sibling folder `../portfolio-site-v3-working-files/`. **Never upload that folder.** Its `README.md` says why.

## Before you publish: set SITE_URL

The link preview, the canonical address, the structured data, the sitemap and the 404 page need the site's real address. Until you know it, they use the placeholder `https://site-url.example/`, which appears in `index.html` (five times), `404.html`, `robots.txt` and `sitemap.xml`.

Your address depends on the repository name (next section):
- repository `USERNAME.github.io` gives `https://USERNAME.github.io/`
- any other repository, for example `portfolio`, gives `https://USERNAME.github.io/portfolio/`

Open PowerShell in this folder (Shift and right-click in the folder, "Open PowerShell window here"), put your address on the first line, keeping the final slash, and paste all of it:

```powershell
$url = 'https://USERNAME.github.io/'
foreach ($f in 'index.html', '404.html', 'robots.txt', 'sitemap.xml') {
  $p = Join-Path (Get-Location) $f
  $t = [IO.File]::ReadAllText($p)
  [IO.File]::WriteAllText($p, $t.Replace('https://site-url.example/', $url))
}
Select-String -Path index.html, 404.html, robots.txt, sitemap.xml -Pattern 'https://site-url.example/' -SimpleMatch
```

The last command should print nothing, which means every copy was replaced. (`404.html` keeps the words `site-url.example` once, without `https://`, in the check that tells it whether the address has been set; leave that line alone.) Then upload the four changed files again.

## Publishing on GitHub Pages

1. Sign in at github.com and create a repository. The simplest address comes from naming it `USERNAME.github.io` (your own user name). Make it public.
2. In the new repository choose **Add file, Upload files**. Drag in the **contents** of this folder, not the folder itself, so that `index.html` sits at the top of the repository. The uploader takes 100 files at a time, so upload `images/` on its own first, then everything else. If `.nojekyll` does not appear in the list (Windows hides files that start with a dot), create it afterwards with **Add file, Create new file**, name `.nojekyll`, empty content.
3. **Settings, Pages**: under "Build and deployment" choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then Save.
4. Wait for the green tick in the **Actions** tab (about a minute). The address appears at the top of **Settings, Pages**.
5. If you had not yet set SITE_URL, do it now (previous section) and upload the four changed files.
6. Paste the address into a LinkedIn post draft (without posting) to check that the preview card shows the teal card with the stent.

**Updating later**: upload the changed files to the same place; they replace the old ones. Change "Last updated" in the footer of `index.html` and `<lastmod>` in `sitemap.xml` when the content changes.

**Using git instead of the web uploader**: only ever run git inside this folder. The drive `D:\Desktop-Data Drive` has its own broken repository, and git commands run anywhere else on the drive act on that one.

```powershell
cd "D:\Desktop-Data Drive\First Attempt at website\Live Website\portfolio-site-v3"
git init -b main
git add .
git commit -m "Portfolio v3"
git remote add origin https://github.com/USERNAME/USERNAME.github.io.git
git push -u origin main
```

## How the page works

- The page holds several views: the landing page, About, Experience and one view per project. Only one shows at a time. Links such as `#stent` open that project, and the browser back button steps back through what was visited. Without JavaScript every view shows in one long scroll.
- A project view has a sticky column on the left (title, summary, facts, results) from 1180 px up; below that the column sits above the text.
- Figures are buttons: selecting one opens the lightbox, the arrow keys move between figures, Escape closes it. Clips play only when opened.
- The hero clip on the landing page is the only video that plays by itself, and it does not play for people who ask for reduced motion or data saving. A Pause button sits under it.
- Cards, rows, figures and timeline entries fade in once as they scroll into view, unless reduced motion is on.
- The theme button switches light and dark and remembers the choice; otherwise the page follows the device.
- "Save as PDF" (footer) prints every view in order, with posters in place of clips.

## Editing text

- Open `index.html` in any text editor. Each project starts with a banner comment such as `<!-- PROJECT: BED TOWER -->`; type over the words.
- Headings are in sentence case, the voice is first person, UK spelling, no contractions and no dashes of the long kinds. Every number must come from a report, the CV or the paper.
- `../portfolio-site-v3-working-files/docs/CONTENT.md` holds every string with its source. Keep it in step if you change something substantial, so the record stays true.
- Results in the left column: a number goes in `<li><b>92.7&nbsp;%</b><span>label</span></li>`; a result without a number is `<li class="results-plain">A plain sentence.</li>`.

## Adding a figure

1. Export the figure as large as the software allows (at least 1200 px on the long side), cropped to the plot, with no software window, file path or user name in it.
2. Make WebP copies. With Python and Pillow (`pip install pillow`):

   ```python
   from PIL import Image
   im = Image.open("new-figure.png").convert("RGB")
   im.thumbnail((1600, 1600))
   im.save("new-figure.webp", quality=86, method=6)
   im.resize((800, round(800 * im.height / im.width))).save("new-figure-800.webp", quality=86, method=6)
   ```

   Use quality 82 for photographs. Skip the `-800` copy if the image is under 900 px wide.
3. Put the WebP files in `images/`, copy an existing `<figure class="fig">` block in the same project, and change `data-src`, `src`, `srcset` (widths in `w`), `width`, `height`, `alt` and the caption. Keep the figure numbers in order. A figure more than twice as wide as it is tall gets `class="fig wide"`.
4. Alt text says what the figure shows; the caption says what it means.

## Adding a clip

Convert with ffmpeg (no sound, no metadata, at most 1280 px wide, under 2.5 MB):

```powershell
ffmpeg -i input.mov -map 0:v:0 -map_metadata -1 -an -vf "scale='min(1280,iw)':-2,fps=30,format=yuv420p" -c:v libx264 -crf 26 -preset slow -movflags +faststart media/new-clip.mp4
ffmpeg -ss 2 -i media/new-clip.mp4 -frames:v 1 poster.png
```

Phone videos carry the place they were filmed; `-map_metadata -1` removes it. Turn the poster into WebP as above, then copy an existing figure with `data-type="video"` and `class="fig fig-video"`.

## Adding a project

1. Copy a whole project view, from its banner comment to its closing `</section>`, and paste it where the project should sit in the order.
2. Give it a new `id` (short, lower case, for example `id="gearbox"`), and change the `id` and `aria-labelledby` pairs inside it to match (`gearboxTitle`, `gearbox-problem` and so on).
3. Replace the title, summary, facts, results, text and figures.
4. Fix the "Previous project" and "Next project" links at the bottom of the new view and of its two neighbours.
5. Add the new id to `projectIds` near the top of the view section in `js/site.js`, in the same order, so the "Work" link stays highlighted on that page.
6. Link to it from the landing page: a card in "Selected projects" (keep eight cards so the grid has no gap) or a row in "Smaller projects and coursework".

## Replacing the CV

Save the new PDF as `Gerasimos_Balatsoukas_CV.pdf` in this folder, replacing the old one, and upload it. `../portfolio-site-v3-working-files/docs/CV_CORRECTIONS.md` lists the fixes the current CV needs.

## Colours and fonts

All colours are variables in the `:root` block at the top of `css/site.css`. Dark mode repeats them twice below it (once for the device setting, once for the button); change both. The fonts are files in `fonts/`, declared with `@font-face` in the same file.

## Checking before you publish

- Local preview: in this folder run `python -m http.server 8793` and open `http://localhost:8793/`.
- Lighthouse, if you want scores: `npx lighthouse http://localhost:8793 --preset=desktop --view`, and again without `--preset=desktop` for mobile. `npx` downloads Lighthouse the first time. It was not run during the rebuild; `../portfolio-site-v3-working-files/docs/PREFLIGHT.md` records the manual budget instead.
- Check both themes, a phone width, the lightbox, and "Save as PDF".

## What not to do

- Do not upload `../portfolio-site-v3-working-files/`, and do not put its contents in this folder. The original COMSOL screenshots show a student ID.
- Do not run git anywhere on `D:\Desktop-Data Drive` except inside this folder.
- Do not add a `transform`, `filter` or `will-change` to `.view` or its parents. Any of them silently stops the sticky project column from sticking.
- Do not justify text. Ragged right, about 65 characters a line.
- Do not link Google Fonts or any other outside service; the site makes no third-party requests, and that is part of its privacy.
- Do not autoplay any clip other than the hero, and keep every clip under 2.5 MB.
- Avoid the look of generated sites: no Inter, Geist, Space Grotesk, Poppins, Montserrat and similar; no purple or gradients; no glass, glow or noise; no pill-shaped navigation, bento tiles, marquees, emoji, skill bars, or sun and moon icons; no "passionate about", "Let's connect" or section eyebrows.
- Do not add numbers that are not in a source, and do not add anything from the MSc thesis: its data belong to the industrial partner.
