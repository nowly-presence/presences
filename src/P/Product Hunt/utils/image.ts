export const withImgixSize = (url: string, size: number): string => {
  if (!/\.imgix\.net(?:\/|$)/i.test(url)) return url

  return url.replace(/([?&])([hw])=\d+/g, `$1$2=${size}`)
}
