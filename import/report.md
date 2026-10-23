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

## Redirects written to import/redirects.tsv (author terms without posts, the PDF, portraits, covers)

- `/authors/christian-chen/` → `/authors/`
- `/authors/george-muller/` → `/authors/`
- `/authors/hudson-taylor/` → `/authors/`
- `/authors/j-wilbur-chapman/` → `/authors/`
- `/authors/john-saunders/` → `/authors/`
- `/authors/victor-matthews/` → `/authors/`
- `/wp-content/uploads/2021/10/DSC_0215_edited-min-1-scaled.jpg` → `/partasia/`
- `/wp-content/uploads/2021/10/IMG_7324-scaled.jpg` → `/sa-intelegem-caile-domnului/`
- `/wp-content/uploads/2021/10/ValeaDraganului2018-143-scaled.jpg` → `/domn-peste-toate-sau-deloc/`
- `/wp-content/uploads/2021/10/WhatsApp-Image-2021-10-18-at-20.02.30-min.jpeg` → `/iata-ca-vin-ca-un-hot/`
- `/wp-content/uploads/2021/10/cropped-sparks.jpg` → `/authors/t-austin-sparks/`
- `/wp-content/uploads/2021/10/kaung.jpg` → `/authors/stephen-kaung/`
- `/wp-content/uploads/2021/10/reidhead.jpeg` → `/authors/paris-reidhead/`
- `/wp-content/uploads/2021/10/watchman_nee.jpg` → `/authors/watchman-nee/`
- `/wp-content/uploads/2021/11/DSC_0186_edited-min-1-scaled.jpg` → `/traind-prin-viata-divina/`
- `/wp-content/uploads/2021/11/Murray.jpg` → `/authors/andrew-murray/`
- `/wp-content/uploads/2021/11/focussed-1.jpg` → `/focalizat-o-poveste-si-o-cantare/`
- `/wp-content/uploads/2021/11/prayer.jpg` → `/rugaciune/`
- `/wp-content/uploads/2021/11/trotter.jpg` → `/authors/lilias-trotter/`
- `/wp-content/uploads/2022/02/aflame.jpg` → `/in-flacari/`
- `/wp-content/uploads/2022/03/patrick-fore-b_SHPU5M3nk-unsplash-scaled.jpg` → `/invata-ne-sa-ne-rugam/`
- `/wp-content/uploads/2022/09/morgan-winston-pOOpWTrzgUE-unsplash-scaled.jpg` → `/masa-domnului-prefata/`
- `/wp-content/uploads/2023/02/ANGroves1.jpg` → `/authors/a-n-groves/`
- `/wp-content/uploads/2023/02/image-9-c-t-studd.webp` → `/intotdeauna-inainte-niciodata-inapoi/`
- `/wp-content/uploads/2023/02/priscilla-du-preez-lIpubE3_DEQ-unsplash-scaled.jpg` → `/ziua-1-ocara-pentru-cristos/`
- `/wp-content/uploads/2023/02/wes-hicks-lY2ayo1i4pM-unsplash-scaled.jpg` → `/rabdarea-nadejdii/`
- `/wp-content/uploads/2023/03/aaron-burden-4uX_r8OhJ_o-unsplash-scaled.jpg` → `/domnul-este-partea-mea-29-martie/`
- `/wp-content/uploads/2023/03/lucas-calloch-P-yzuyWFEIk-unsplash-scaled.jpg` → `/eu-am-biruit-lumea-ioan-1633/`
- `/wp-content/uploads/2023/03/sebastian-staines-EkL1OWV0qvc-unsplash-scaled.jpg` → `/cum-ar-trebui-sa-depuna-credinciosii-marturie-inaintea-celor-pierduti/`
- `/wp-content/uploads/2023/03/sebastien-gabriel-Fxi1FPvbPa0-unsplash-scaled.jpg` → `/o-mantuire-asa-de-mare-partea-1/`
- `/wp-content/uploads/2023/03/simpson.jpg` → `/authors/a-b-simpson/`
- `/wp-content/uploads/2023/04/llambert-scaled.jpg` → `/authors/lance-lambert/`
- `/wp-content/uploads/2023/04/massimiliano-morosinotto-61oIlQD56DU-unsplash-scaled.jpg` → `/sa-tinem-tare-increderea-evrei-36/`
- `/wp-content/uploads/2023/05/sabine-ojeil-fa8Tzht-06g-unsplash-scaled.jpg` → `/a-doua-generatie-timotei/`
- `/wp-content/uploads/2023/06/jens-lelie-u0vgcIOQG08-unsplash-scaled.jpg` → `/acum-alege-deuteronom-3019/`
- `/wp-content/uploads/2023/06/samuel-mcgarrigle-GVRRtaLj3LU-unsplash-scaled.jpg` → `/inapoi-la-cruce/`
- `/wp-content/uploads/2023/07/neom-OCKa0AkSyRc-unsplash-scaled.jpg` → `/fapt-credinta-si-experienta/`
- `/wp-content/uploads/2023/07/ronaldo-de-oliveira-83heui-oQAg-unsplash-scaled.jpg` → `/cand-va-rugati-credeti-ca-primiti-marcu-1124/`
- `/wp-content/uploads/2023/09/The-Parable-of-the-Sower-Gospel-Images.jpg` → `/o-samanta-si-mai-multe-terenuri/`
- `/wp-content/uploads/2023/09/alexander-maclaren.jpg` → `/authors/alexander-maclaren/`
- `/wp-content/uploads/2024/01/2-widows-mite-video-still-dsc6405-2400x1600-1.webp` → `/banutii-vaduvei-partea-1-2/`
- `/wp-content/uploads/2024/08/kate-remmer-RZn4_FzNUCY-unsplash-scaled.jpg` → `/asteapta-dumnezeu-colaborarea-noastra/`
- `/wp-content/uploads/2024/08/steven-van-loy-oUhSla4L_98-unsplash-scaled.jpg` → `/cum-sa-traiesti-in-cristos/`
- `/wp-content/uploads/2024/11/1024px-John_Martin_-_Joshua_Commanding_the_Sun_to_Stand_Still_-_Google_Art_Project.jpg` → `/oamenii-lacusta/`
- `/wp-content/uploads/2024/11/ben-white-mO9vKbG5csg-unsplash-1.jpg` → `/ferestre-deschise-15-noiembrie/`
- `/wp-content/uploads/2024/11/liu-jiawei-iNyHRf2WDf8-unsplash-scaled.jpg` → `/ferestre-deschise-17-noiembrie/`
- `/wp-content/uploads/2024/11/lora-georgieva-67u2ES4LnV8-unsplash-scaled.jpg` → `/pilda-smochinului/`
- `/wp-content/uploads/2024/11/tim-marshall-K2u71wv2eI4-unsplash-1.jpg` → `/partasia-zilnica-cu-dumnezeu/`
- `/wp-content/uploads/2025/02/O-mantuire-asa-de-mare-Paris-Reidhead.pdf` → `/o-mantuire-asa-de-mare/o-mantuire-asa-de-mare-paris-reidhead.pdf`
- `/wp-content/uploads/2025/02/cdoncel-uq6x71rIFH8-unsplash-scaled.jpg` → `/o-mantuire-asa-de-mare/`
- `/wp-content/uploads/2025/05/claudio-schwarz-cM-SE4f8d34-unsplash-scaled.jpg` → `/misiunea-semnificatia-si-mesajul-lui-isus-cristos-in-corinteni/`
- `/wp-content/uploads/2025/07/alexey-elfimov-01huESAdPAQ-unsplash-scaled.jpg` → `/care-este-porunca-noastra/`
- `/wp-content/uploads/2025/07/bjarne-postma-4dHJS61PUOE-unsplash-scaled.jpg` → `/se-simte-el-acasa/`
- `/wp-content/uploads/2025/07/liane-metzler-B32qg6Ua34Y-unsplash-scaled.jpg` → `/cum-sa-inviezi-mortii/`
- `/wp-content/uploads/2025/07/patrick-q-BpZbBa7yM-unsplash.jpg` → `/rugaciunea-pentru-revenirea-domnului/`
- `/wp-content/uploads/2026/05/ahmed-zayan-28nzltYzCDM-unsplash-scaled.jpg` → `/sa-ne-uitam-tinta-la-cristos/`
- `/wp-content/uploads/2026/07/todd-quackenbush-IClZBVw5W5A-unsplash-scaled.jpg` → `/un-ajutor-sau-o-piedica/`
- `/wp-content/uploads/2026/10/kristaps-grundsteins-Grg8-u9hUaY-unsplash-scaled.jpg` → `/ceasul-hotararii/`

## Author descriptions not imported (bios are owner-supplied)

- `paris-reidhead`: "Un scurt bio"

## Media not used as a cover or portrait

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
