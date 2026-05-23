/**
 * Atlas Image Compressor — Node.js version
 * Uses 'sharp' (installs automatically via npm, no separate Python needed)
 *
 * RUN FROM YOUR REPO FOLDER:
 *   npm install sharp
 *   node compress_atlas.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ATLAS_ROOT = path.join(__dirname, 'public', 'atlas');
const MAX_WIDTH = 1024;
const QUALITY = 78;
const SKIP_DIRS = new Set(['pelvis', 'pelvis_dess']);

async function compressImage(filePath) {
  const before = fs.statSync(filePath).size;
  const tmp = filePath + '.tmp';
  await sharp(filePath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })
    .toFile(tmp);
  fs.renameSync(tmp, filePath);
  const after = fs.statSync(filePath).size;
  return before - after;
}

async function main() {
  const folders = fs.readdirSync(ATLAS_ROOT).filter(f => {
    const full = path.join(ATLAS_ROOT, f);
    return fs.statSync(full).isDirectory() && !SKIP_DIRS.has(f);
  });

  let totalFiles = 0, totalSavedBytes = 0;

  for (const folder of folders.sort()) {
    const folderPath = path.join(ATLAS_ROOT, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.jpg'));
    if (!files.length) continue;

    process.stdout.write(`\n📁 ${folder} (${files.length} files) `);
    let folderSaved = 0;

    for (const file of files.sort()) {
      const filePath = path.join(folderPath, file);
      try {
        const saved = await compressImage(filePath);
        folderSaved += saved;
        totalFiles++;
        process.stdout.write('.');
      } catch (e) {
        process.stdout.write('x');
      }
    }
    console.log(`  saved ${(folderSaved / 1024 / 1024).toFixed(1)} MB`);
    totalSavedBytes += folderSaved;
  }

  console.log(`\n✅ Done — ${totalFiles} images, ${(totalSavedBytes / 1024 / 1024).toFixed(1)} MB saved`);
  console.log('\nNext steps:');
  console.log('  git add public/atlas');
  console.log('  git commit -m "compress atlas images"');
  console.log('  git push');
}

main().catch(console.error);
