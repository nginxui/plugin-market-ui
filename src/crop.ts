import type { MarketCrop, MarketScreenshot } from './types'

/** The crop of a screenshot for the theme; a dark image without its own uses the light one. */
export function cropOf(shot: MarketScreenshot, dark: boolean): MarketCrop | undefined {
  return dark && shot.dark_url ? shot.dark_crop ?? shot.crop : shot.crop
}

/** The image of a screenshot for the theme, the light one when it has no dark one. */
export function shotUrl(shot: MarketScreenshot, dark: boolean): string {
  return (dark && shot.dark_url) || shot.url
}

/** Styles that show only the crop of an image in a frame of the crop's shape. */
export function cropStyles(crop: MarketCrop | undefined) {
  if (!crop)
    return {}
  return {
    root: { position: 'relative', display: 'block', overflow: 'hidden' },
    image: {
      position: 'absolute',
      maxWidth: 'none',
      width: `${100 / crop.width}%`,
      height: `${100 / crop.height}%`,
      left: `${-crop.x / crop.width * 100}%`,
      top: `${-crop.y / crop.height * 100}%`,
    },
  } as const
}
