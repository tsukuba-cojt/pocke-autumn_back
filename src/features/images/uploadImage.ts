import type { Bindings } from '../../global'

const IMAGES_BASE_URL = 'https://api.cloudflare.com/client/v4'

type UploadImageResult = {
  id: string
  url: string | null
  variants: string[]
}

export const uploadImage = async (
  env: Bindings,
  file: File
): Promise<UploadImageResult> => {
  const endpoint = `${IMAGES_BASE_URL}/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1`
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_IMAGES_API_TOKEN}`,
    },
    body: form,
  })

  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('Cloudflare Images upload error', res.status, await res.text())
    throw new Error('Failed to upload image')
  }

  const data = (await res.json()) as {
    result?: { id: string; variants?: string[] }
    success?: boolean
  }

  const id = data.result?.id ?? ''
  const variants = data.result?.variants ?? []
  const preferredVariant = env.CLOUDFLARE_IMAGES_DEFAULT_VARIANT
  const url =
    preferredVariant
      ? variants.find((variant) => variant.endsWith(`/${preferredVariant}`)) ?? null
      : variants[0] ?? null

  return { id, url, variants }
}
