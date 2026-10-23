# WordPress import report

Written by `bin/import-wp.ts` (`docs/specs/wordpress-import.md`). Every list below is
sorted, so two runs on an unchanged site give the same file.

- Posts imported: 73 of 73 published
- Authors with at least one post: 26 of 32 terms
- Posts read from the rendered page (no post-content element): 10
- Old sitemap URLs: 165 (`import/legacy-urls.txt`)

## Conversion problems (post not written)

None.

## Text differences against the live page

None: every imported text equals the live page, word for word.

## Posts without an author (imported as drafts until named)

None.

## Posts without a cover

- `ce-poti-face-daca-nu-poti-iubi-pe-un-frate`
- `crucea-si-cresterea-spirituala`
- `cum-poate-fi-rezidit-un-loc-unde-dumnezeu-poate-locui`
- `intemeiati-in-cristos`
- `kenosis`
- `luni-dimineata-pregatirea-rugaciunea-mea-pentru-astazi`
- `ma-iubesti`
- `meditand-la-adevarul-divin`
- `obadia`
- `ocara`
- `rugaciunea-pentru-copiii-razvratiti`

## Covers narrower than 1200 px

- `banutii-vaduvei-partea-1-2`: 640 px
- `focalizat-o-poveste-si-o-cantare`: 989 px
- `in-flacari`: 450 px
- `intotdeauna-inainte-niciodata-inapoi`: 809 px
- `oamenii-lacusta`: 1024 px

## Posts read from the rendered page

- `cum-poate-fi-rezidit-un-loc-unde-dumnezeu-poate-locui`: REST content empty
- `domn-peste-toate-sau-deloc`: REST content empty; dropped the template label "Publicat de"
- `focalizat-o-poveste-si-o-cantare`: REST content equals the page
- `iata-ca-vin-ca-un-hot`: REST content empty; 1 video(s): affiyBaoMKE
- `meditand-la-adevarul-divin`: REST content empty
- `partasia`: REST content empty
- `rugaciune`: REST content differs from the page (69 words); the page is imported; dropped the template label "Publicat de"
- `rugaciunea-pentru-copiii-razvratiti`: REST content empty
- `sa-intelegem-caile-domnului`: REST content empty; kept the credit line "Editat de Dorina Cheloiu" as text; dropped the template label "Publicat de"
- `traind-prin-viata-divina`: REST content empty; 2 video(s): LsEsPyP1Fz0, ClCKgXmY4m0

## Citations under the article

61 posts have one, stored as `source`.

## Citation links into the WordPress uploads (they need a home on the new site before cut-over)

None.

## Author terms without posts (redirected to /authors/)

- `/authors/christian-chen/`
- `/authors/george-muller/`
- `/authors/hudson-taylor/`
- `/authors/j-wilbur-chapman/`
- `/authors/john-saunders/`
- `/authors/victor-matthews/`

## Author descriptions not imported (bios are owner-supplied)

- `paris-reidhead`: "Un scurt bio"

## Media not used as a cover or portrait

- 1010 application/pdf /wp-content/uploads/2025/02/O-mantuire-asa-de-mare-Paris-Reidhead.pdf (attached to nothing)
- 108 image/jpeg /wp-content/uploads/2021/10/JohnWilburChapman.jpg (attached to nothing)
- 109 image/jpeg /wp-content/uploads/2021/10/TaylorH.jpg (attached to nothing)
- 110 image/jpeg /wp-content/uploads/2021/10/George_Muller.jpg (attached to nothing)
- 126 image/jpeg /wp-content/uploads/2021/10/chen.jpeg (attached to nothing)
- 191 image/jpeg /wp-content/uploads/2021/10/IMG_3167-min-scaled.jpg (attached to nothing)
- 192 image/jpeg /wp-content/uploads/2021/10/DSC_0002_edited_edited-min-scaled.jpg (attached to nothing)
- 195 image/jpeg /wp-content/uploads/2021/10/IMG_3162-min-scaled.jpg (attached to nothing)
- 218 image/jpeg /wp-content/uploads/2021/10/eagle-min-scaled.jpg (attached to nothing)
- 219 image/jpeg /wp-content/uploads/2021/10/IMG_20190816_050122_1-min-scaled.jpg (attached to nothing)
- 251 image/jpeg /wp-content/uploads/2021/10/IMG_7771-scaled.jpg (attached to post 79, `domn-peste-toate-sau-deloc`)
- 271 image/png /wp-content/uploads/2021/10/mesaje_crestine.png (attached to nothing)
- 284 image/jpeg /wp-content/uploads/2021/10/david-tomaseti-AaZlf5FgUws-unsplash-scaled.jpg (attached to post 278, `iata-ca-vin-ca-un-hot`)
- 51 image/png /wp-content/uploads/2021/10/Dotted-Image.png (attached to nothing)
- 52 image/png /wp-content/uploads/2021/10/Ellipse-teal-01.png (attached to nothing)
- 54 image/png /wp-content/uploads/2021/10/Circle.png (attached to nothing)
- 55 image/png /wp-content/uploads/2021/10/quotes-02.png (attached to nothing)
- 56 image/png /wp-content/uploads/2021/10/quotes01.png (attached to nothing)
- 967 application/zip /wp-content/uploads/2024/08/fragmente-lda.zip (attached to post 964, `cum-sa-traiesti-in-cristos`)
- 99 image/jpeg /wp-content/uploads/2021/10/dailyVerse.jpeg (attached to nothing)

## Imported post folders no longer on WordPress

None.

## Old non-post URLs (each needs a page, a redirect or a 410)

- `/`
- `/authors/a-b-simpson/`
- `/authors/a-n-groves/`
- `/authors/alexander-maclaren/`
- `/authors/andrew-murray/`
- `/authors/charles-spurgeon/`
- `/authors/d-m-panton/`
- `/authors/erich-sauer/`
- `/authors/g-campbell-morgan/`
- `/authors/george-muller/`
- `/authors/harriet-beecher-stowe/`
- `/authors/harry-foster/`
- `/authors/hudson-taylor/`
- `/authors/j-m-mcl/`
- `/authors/j-wilbur-chapman/`
- `/authors/kenneth-s-wuest/`
- `/authors/kit-mays/`
- `/authors/lance-lambert/`
- `/authors/lilias-trotter/`
- `/authors/necunoscut/`
- `/authors/paris-reidhead/`
- `/authors/paul-e-billheimer/`
- `/authors/poul-madsen/`
- `/authors/radu-gavrilut/`
- `/authors/samuel-usher/`
- `/authors/stephen-kaung/`
- `/authors/stephen-ross/`
- `/authors/t-austin-sparks/`
- `/authors/watchman-nee/`
- `/authors/zoli-szabo/`
- `/blog/`
- `/category/articole/`
- `/category/mesaje/`
- `/category/uncategorized/`
- `/contact/`
- `/dailyverse/2021-10-18-ioan-1415/`
- `/dailyverse/2021-10-20-ioan-1623/`
- `/dailyverse/2021-11-03-evrei-1228/`
- `/dailyverse/2021-11-09-psalmul-1492/`
- `/dailyverse/2022-03-09-luca-2136/`
- `/dailyverse/`
- `/despre-noi/`
- `/quote/105/`
- `/quote/107/`
- `/quote/`
- `/quote/cristos-este-sau-domn-peste-toate-sau-nu-este-domn-deloc-hudson-taylor/`
- `/sample-page/`
- `/template/article/`
- `/template/authors/`
- `/template/footer/`
- `/template/header/`
