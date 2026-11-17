import fs from 'fs';
import path from 'path';

const userUploadedLogo = 'C:/Users/Rahul/.gemini/antigravity/brain/61295a2a-70ee-4de7-8c39-260797a24b57/.user_uploaded/media_1794911973952_956c28b1.png';

const destinations = [
  'f:/Surpeise Nova/client/public/images/logo.png',
  'f:/Surpeise Nova/client/public/images/nanova-symbol.png',
  'f:/Surpeise Nova/client/public/logo.png',
  'f:/Surpeise Nova/server/uploads/logo.png'
];

for (const dest of destinations) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(userUploadedLogo, dest);
  console.log(`Copied logo to: ${dest}`);
}
