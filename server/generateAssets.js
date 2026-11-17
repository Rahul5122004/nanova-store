import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('../client/public/images/products');
const serverQrDir = path.resolve('uploads/qr');
const clientPublicDir = path.resolve('../client/public');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(serverQrDir)) fs.mkdirSync(serverQrDir, { recursive: true });

function createSvgTeeFront(title, subtitle, bgColor = '#121216', accentColor = '#FFFFFF') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
    <rect width="600" height="700" fill="${bgColor}" rx="16" />
    <path d="M 200,60 C 250,110 350,110 400,60 L 540,160 L 460,260 L 420,220 L 420,640 L 180,640 L 180,220 L 140,260 L 60,160 Z" fill="#181820" stroke="#333340" stroke-width="4" />
    <!-- Chest Print Artwork -->
    <g transform="translate(300, 260)" text-anchor="middle">
      <!-- Geometric N Badge -->
      <polygon points="-25,-30 -8,-30 -8,30 -25,30" fill="${accentColor}" />
      <polygon points="-8,-30 25,30 10,30 -25,-30" fill="#FFFFFF" />
      <polygon points="10,-30 25,-30 25,30 10,30" fill="${accentColor}" />
      
      <text y="65" font-family="'Syne', 'Outfit', sans-serif" font-weight="900" font-size="24" fill="#FFFFFF" letter-spacing="4">NANOVA</text>
      <text y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="11" fill="#A1A1AA" letter-spacing="3">${title.toUpperCase()}</text>
      <text y="110" font-family="'Plus Jakarta Sans', sans-serif" font-weight="500" font-size="9" fill="#71717A" letter-spacing="2">${subtitle.toUpperCase()}</text>
    </g>
    <!-- Label Detail -->
    <rect x="260" y="80" width="80" height="24" fill="#09090C" rx="4" />
    <text x="300" y="96" font-family="sans-serif" font-size="9" fill="#A1A1AA" text-anchor="middle" font-weight="bold">NANOVA • L</text>
  </svg>`;
}

function createSvgTeeBack(mainArtText, quoteText, bgColor = '#121216', accentColor = '#FFFFFF') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
    <rect width="600" height="700" fill="${bgColor}" rx="16" />
    <path d="M 200,60 C 250,75 350,75 400,60 L 540,160 L 460,260 L 420,220 L 420,640 L 180,640 L 180,220 L 140,260 L 60,160 Z" fill="#181820" stroke="#333340" stroke-width="4" />
    <!-- Big Streetwear Back Graphic -->
    <g transform="translate(300, 310)" text-anchor="middle">
      <rect x="-140" y="-140" width="280" height="280" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="6,4" opacity="0.4" />
      <polygon points="-40,-50 -12,-50 -12,50 -40,50" fill="${accentColor}" opacity="0.9" />
      <polygon points="-12,-50 40,50 16,50 -40,-50" fill="#FFFFFF" />
      <polygon points="16,-50 40,-50 40,50 16,50" fill="${accentColor}" opacity="0.9" />
      
      <text y="90" font-family="'Syne', 'Outfit', sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="5">${mainArtText.toUpperCase()}</text>
      <text y="115" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="12" fill="${accentColor}" letter-spacing="3">${quoteText.toUpperCase()}</text>
      <text y="135" font-family="sans-serif" font-size="9" fill="#71717A" letter-spacing="1">AUTHENTIC STREET DROP // 11:11</text>
    </g>
  </svg>`;
}

function createSvgGiftBox(title, sub, baseGold = '#C99A3E', darkBg = '#14141A') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
    <rect width="600" height="700" fill="${darkBg}" rx="16" />
    <defs>
      <linearGradient id="goldBox" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A" />
        <stop offset="50%" stop-color="#D97706" />
        <stop offset="100%" stop-color="#78350F" />
      </linearGradient>
    </defs>
    <!-- 3D Isometric Luxury Box Graphic -->
    <g transform="translate(300, 270)">
      <!-- Box Base -->
      <polygon points="0,-80 150,0 0,80 -150,0" fill="#202028" stroke="#3B3B48" stroke-width="2" />
      <polygon points="-150,0 0,80 0,220 -150,140" fill="#181820" stroke="#2B2B38" stroke-width="2" />
      <polygon points="0,80 150,0 150,140 0,220" fill="#14141B" stroke="#2B2B38" stroke-width="2" />
      <!-- Satin Ribbon -->
      <polygon points="-15,-72 15,-56 15,220 -15,220" fill="url(#goldBox)" opacity="0.9" />
      <polygon points="-150,4 -150,-8 150,-8 150,4" fill="url(#goldBox)" opacity="0.8" />
      <!-- Big Golden Bow -->
      <circle cx="-25" cy="-90" r="30" fill="none" stroke="url(#goldBox)" stroke-width="14" />
      <circle cx="25" cy="-90" r="30" fill="none" stroke="url(#goldBox)" stroke-width="14" />
      <circle cx="0" cy="-85" r="14" fill="#FDE68A" />
    </g>
    <!-- Label Below -->
    <g transform="translate(300, 560)" text-anchor="middle">
      <text y="0" font-family="'Outfit', sans-serif" font-weight="800" font-size="22" fill="#FDE68A" letter-spacing="3">${title.toUpperCase()}</text>
      <text y="24" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="12" fill="#D4D4D8" letter-spacing="2">${sub.toUpperCase()}</text>
      <text y="45" font-family="sans-serif" font-size="10" fill="#9CA3AF" letter-spacing="1">SURPRISE NANOVA • CURATED WITH LOVE</text>
    </g>
  </svg>`;
}

function createQrSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600" width="500" height="600">
    <rect width="500" height="600" fill="#FFFFFF" rx="16" />
    <!-- Header -->
    <rect x="0" y="0" width="500" height="90" fill="#111116" rx="16" />
    <text x="250" y="45" font-family="'Outfit', sans-serif" font-weight="800" font-size="22" fill="#FFFFFF" text-anchor="middle">NANOVA OFFICIAL PAYMENT QR</text>
    <text x="250" y="70" font-family="sans-serif" font-weight="600" font-size="12" fill="#C99A3E" text-anchor="middle">SCAN &amp; PAY WITH ANY UPI APP</text>
    
    <!-- Stylized QR Grid -->
    <g transform="translate(75, 120)">
      <rect width="350" height="350" fill="#F8FAFC" rx="12" stroke="#CBD5E1" stroke-width="3" />
      
      <!-- Top Left Position Square -->
      <rect x="25" y="25" width="70" height="70" fill="#000000" rx="8" />
      <rect x="40" y="40" width="40" height="40" fill="#FFFFFF" rx="4" />
      <rect x="50" y="50" width="20" height="20" fill="#000000" rx="2" />
      
      <!-- Top Right Position Square -->
      <rect x="255" y="25" width="70" height="70" fill="#000000" rx="8" />
      <rect x="270" y="40" width="40" height="40" fill="#FFFFFF" rx="4" />
      <rect x="280" y="50" width="20" height="20" fill="#000000" rx="2" />
      
      <!-- Bottom Left Position Square -->
      <rect x="25" y="255" width="70" height="70" fill="#000000" rx="8" />
      <rect x="40" y="270" width="40" height="40" fill="#FFFFFF" rx="4" />
      <rect x="50" y="280" width="20" height="20" fill="#000000" rx="2" />

      <!-- QR Pattern Blocks -->
      <rect x="120" y="40" width="20" height="40" fill="#000000" />
      <rect x="160" y="30" width="40" height="20" fill="#000000" />
      <rect x="130" y="80" width="50" height="20" fill="#000000" />
      <rect x="40" y="120" width="40" height="30" fill="#000000" />
      <rect x="100" y="120" width="60" height="20" fill="#000000" />
      <rect x="180" y="110" width="30" height="50" fill="#000000" />
      <rect x="230" y="120" width="40" height="20" fill="#000000" />
      <rect x="290" y="120" width="20" height="50" fill="#000000" />

      <rect x="40" y="170" width="30" height="40" fill="#000000" />
      <rect x="90" y="160" width="40" height="40" fill="#000000" />
      <rect x="150" y="180" width="40" height="30" fill="#000000" />
      <rect x="220" y="160" width="50" height="20" fill="#000000" />

      <!-- Center Logo Box in QR -->
      <rect x="140" y="140" width="70" height="70" fill="#FFFFFF" rx="8" stroke="#000000" stroke-width="2" />
      <text x="175" y="182" font-family="'Syne', sans-serif" font-weight="900" font-size="28" fill="#000000" text-anchor="middle">N</text>

      <rect x="40" y="220" width="50" height="20" fill="#000000" />
      <rect x="120" y="230" width="40" height="40" fill="#000000" />
      <rect x="180" y="230" width="30" height="50" fill="#000000" />
      <rect x="230" y="210" width="80" height="30" fill="#000000" />

      <rect x="120" y="290" width="70" height="20" fill="#000000" />
      <rect x="210" y="260" width="30" height="50" fill="#000000" />
      <rect x="260" y="260" width="50" height="40" fill="#000000" />
    </g>

    <!-- Footer Instructions -->
    <g transform="translate(250, 505)" text-anchor="middle">
      <text y="0" font-family="sans-serif" font-weight="bold" font-size="14" fill="#0F172A">BHIM UPI • Google Pay • PhonePe • Paytm</text>
      <text y="22" font-family="sans-serif" font-size="11" fill="#64748B">Account Name: NANOVA ENTERPRISES</text>
      <text y="40" font-family="sans-serif" font-size="10" fill="#94A3B8">Enter your 12-digit UTR/Reference ID after payment</text>
    </g>
  </svg>`;
}

// Generate files
const files = [
  { path: path.join(publicDir, 'tee-cyber-front.png'), content: createSvgTeeFront('Cyber Nova', 'Heavyweight Drop') },
  { path: path.join(publicDir, 'tee-cyber-back.png'), content: createSvgTeeBack('NANOVA', 'WEAR YOUR VIBE') },
  { path: path.join(publicDir, 'tee-vibe-front.png'), content: createSvgTeeFront('Street Vibe', 'Bio-Washed') },
  { path: path.join(publicDir, 'tee-vibe-back.png'), content: createSvgTeeBack('STREET NOVA', 'LIMITED EDITION') },
  { path: path.join(publicDir, 'tee-custom-front.png'), content: createSvgTeeFront('Custom Bespoke', 'Personalized') },
  { path: path.join(publicDir, 'tee-custom-back.png'), content: createSvgTeeBack('YOUR VIBE', 'CUSTOM DESIGN') },
  { path: path.join(publicDir, 'gift-box-gold.png'), content: createSvgGiftBox('Grand Birthday Hamper', 'Golden Edition') },
  { path: path.join(publicDir, 'gift-box-couple.png'), content: createSvgGiftBox('Eternal Love Box', 'Velvet Keepsake') },
  { path: path.join(publicDir, 'gift-box-explode.png'), content: createSvgGiftBox('Exploding Photo Box', '4-Tier Surprise') },
  { path: path.join(serverQrDir, 'default_qr.png'), content: createQrSvg() },
  { path: path.join(clientPublicDir, 'default-qr.png'), content: createQrSvg() }
];

for (const f of files) {
  fs.writeFileSync(f.path, f.content, 'utf8');
}

console.log('[Assets] Created all vector product images and default QR graphics successfully.');
