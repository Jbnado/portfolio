import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

const SOURCE = resolve('C:/Users/bernardo/Pictures/eu.png');
const PUBLIC = resolve('public');

async function generate() {
  const src = sharp(SOURCE);
  const metadata = await src.metadata();
  console.log(`Source: ${metadata.width}x${metadata.height}`);

  // 1. favicon-32.png
  await sharp(SOURCE)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(PUBLIC, 'favicon-32.png'));
  console.log('✓ favicon-32.png');

  // 2. apple-touch-icon.png (180x180)
  await sharp(SOURCE)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(PUBLIC, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // 3. icon-192.png
  await sharp(SOURCE)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(PUBLIC, 'icon-192.png'));
  console.log('✓ icon-192.png');

  // 4. icon-512.png
  await sharp(SOURCE)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(PUBLIC, 'icon-512.png'));
  console.log('✓ icon-512.png');

  // 5. icon-512-maskable.png (with 10% safe area padding)
  const maskableSize = 512;
  const padding = Math.round(maskableSize * 0.1);
  const innerSize = maskableSize - padding * 2;
  const resized = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await sharp({
    create: { width: maskableSize, height: maskableSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(resolve(PUBLIC, 'icon-512-maskable.png'));
  console.log('✓ icon-512-maskable.png');

  // 6. favicon.ico (16, 32, 48)
  const ico16 = await sharp(SOURCE)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const ico32 = await sharp(SOURCE)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const ico48 = await sharp(SOURCE)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const icoBuffer = await pngToIco([ico16, ico32, ico48]);
  await writeFile(resolve(PUBLIC, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico');

  // 7. favicon.svg (PNG embedded as base64)
  const svg64Source = await sharp(SOURCE)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const b64 = svg64Source.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <image href="data:image/png;base64,${b64}" width="64" height="64"/>
</svg>`;
  await writeFile(resolve(PUBLIC, 'favicon.svg'), svgContent, 'utf-8');
  console.log('✓ favicon.svg');

  console.log('\nAll favicons generated!');
}

generate().catch(console.error);
