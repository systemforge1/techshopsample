# Image assets

Drop replacement artwork into the matching folder, then point
`src/data/images.ts` at it:

    { id: '/images/hero/titan.jpg', alt: 'Describe the machine' }

Anything starting with `/` is served as-is. Anything else is treated as an
Unsplash photo id and gets responsive transforms applied automatically, so
you can mix real and placeholder art while you shoot.

| Folder        | Used by                         |
| ------------- | ------------------------------- |
| `hero/`       | Hero, closing CTA backdrop      |
| `pcs/`        | The four Flagship systems       |
| `laptops/`    | Laptop collection               |
| `monitors/`   | Displays                        |
| `peripherals/`| Gear                            |
| `builds/`     | Custom build finishes           |
| `services/`   | Repair & upgrade                |
| `showcase/`   | Delivered builds gallery        |
| `brands/`     | Reserved — the marquee is currently typographic |

Suggested exports: 2000px wide max, JPEG or WebP, sRGB. The `srcset` ladder
(640 / 960 / 1280 / 1600 / 2000) only applies to CDN-hosted images; local
files are served at their native size, so export sensibly.
