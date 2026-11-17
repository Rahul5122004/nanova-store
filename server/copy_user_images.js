import fs from 'fs';
import path from 'path';

const userDir = 'C:/Users/Rahul/.gemini/antigravity/brain/61295a2a-70ee-4de7-8c39-260797a24b57/.user_uploaded';
const clientDir = 'f:/Surpeise Nova/client/public/images/products';
const serverDir = 'f:/Surpeise Nova/server/uploads/products';

if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });
if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });

const mappings = [
  { src: 'media_1794909989852_0235b2e5.jpg', dest: 'gift-custom-mug.jpg' },
  { src: 'media_1794909997313_fc4592b7.jpg', dest: 'gift-temp-bottle.jpg' },
  { src: 'media_1794910010686_9d0b4a91.jpg', dest: 'gift-spotify-keychain.jpg' },
  { src: 'media_1794910020761_a40082ee.jpg', dest: 'gift-panda-lamp.jpg' },
  { src: 'media_1794910035850_663257b3.jpg', dest: 'gift-custom-wallet.jpg' },
  { src: 'media_1794910937047_1162c211.jpg', dest: 'tee-spiderman.jpg' },
  { src: 'media_1794910952831_2bafda23.jpg', dest: 'tee-captain-america.jpg' },
  { src: 'media_1794910968713_56bdacfd.jpg', dest: 'tee-captain-america-alt.jpg' }
];

for (const m of mappings) {
  const srcPath = path.join(userDir, m.src);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(clientDir, m.dest));
    fs.copyFileSync(srcPath, path.join(serverDir, m.dest));
    console.log(`Copied ${m.src} -> ${m.dest}`);
  } else {
    console.error(`Not found: ${srcPath}`);
  }
}

console.log('Finished copying user uploaded product images.');
