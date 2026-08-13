import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '../public')
const source = path.join(publicDir, 'apple-icon.png')

async function createMaskableIcon(size, output) {
  const iconSize = Math.round(size * 0.58)
  const icon = await sharp(source).resize(iconSize, iconSize).png().toBuffer()

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#2563EB',
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toFile(output)
}

await sharp(source).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192x192.png'))
await sharp(source).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512x512.png'))
await createMaskableIcon(512, path.join(publicDir, 'icon-maskable-512x512.png'))

console.log('PWA icons generated in public/')
