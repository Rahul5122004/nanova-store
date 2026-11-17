import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { query, getOne } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicesDir = path.join(__dirname, '../../uploads/invoices');
const cardsDir = path.join(__dirname, '../../uploads/cards');

if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}
if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true });
}

export function formatINR(val) {
  const num = Number(val || 0);
  return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Register custom cursive and serif fonts if available, or gracefully fallback
 */
function setupFonts(doc) {
  const scriptFontPath = path.join(__dirname, '../../assets/fonts/script.ttf');
  const serifFontPath = path.join(__dirname, '../../assets/fonts/serif.ttf');
  const serifBoldFontPath = path.join(__dirname, '../../assets/fonts/serif-bold.ttf');

  let hasScript = false;
  let hasSerif = false;
  let hasSerifBold = false;

  try {
    if (fs.existsSync(scriptFontPath)) {
      doc.registerFont('CustomScript', scriptFontPath);
      hasScript = true;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(serifFontPath)) {
      doc.registerFont('CustomSerif', serifFontPath);
      hasSerif = true;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(serifBoldFontPath)) {
      doc.registerFont('CustomSerifBold', serifBoldFontPath);
      hasSerifBold = true;
    }
  } catch (e) {}

  return {
    script: hasScript ? 'CustomScript' : 'Times-Italic',
    serif: hasSerif ? 'CustomSerif' : 'Times-Roman',
    serifBold: hasSerifBold ? 'CustomSerifBold' : (hasSerif ? 'CustomSerif' : 'Times-Bold'),
    sans: 'Helvetica',
    sansBold: 'Helvetica-Bold'
  };
}

/**
 * Draw decorative vector golden botanical branch
 */
function drawBotanicalBranch(doc, x, y, scale = 0.7, flip = false) {
  doc.save();
  const dir = flip ? -1 : 1;
  doc.strokeColor('#C89D35').lineWidth(1.0 * scale);

  // Central stem curve
  doc.moveTo(x, y)
     .bezierCurveTo(x + 6 * dir * scale, y + 16 * scale, x + 3 * dir * scale, y + 36 * scale, x + 8 * dir * scale, y + 52 * scale)
     .stroke();

  // Branching golden leaves
  const leafNodes = [
    { dy: 10, dx: 6 * dir, rx: 5.5, ry: 2.5, angle: 30 * dir },
    { dy: 20, dx: -4 * dir, rx: 5, ry: 2.3, angle: -25 * dir },
    { dy: 30, dx: 6.5 * dir, rx: 5.5, ry: 2.5, angle: 35 * dir },
    { dy: 40, dx: -5 * dir, rx: 4.5, ry: 2.2, angle: -30 * dir },
    { dy: 48, dx: 6 * dir, rx: 5, ry: 2.3, angle: 25 * dir },
    { dy: 54, dx: 1 * dir, rx: 4, ry: 2.0, angle: 0 }
  ];

  for (const node of leafNodes) {
    doc.save();
    doc.translate(x + node.dx * scale, y + node.dy * scale);
    doc.rotate(node.angle);
    doc.ellipse(0, 0, node.rx * scale, node.ry * scale)
       .fillAndStroke('#D4AF37', '#B8860B');
    doc.restore();
  }

  doc.restore();
}

/**
 * Draw luxury decorative golden corner ribbon
 */
function drawCornerRibbon(doc, x, y, flipX = false, flipY = false) {
  doc.save();
  doc.translate(x, y);
  if (flipX) doc.scale(-1, 1);
  if (flipY) doc.scale(1, -1);

  // Outer ribbon curve
  doc.path('M 0,26 Q 11,11 26,0 L 36,0 Q 16,16 0,36 Z')
     .fillAndStroke('#D4AF37', '#B8860B');

  // Inner highlight sheen
  doc.path('M 3,28 Q 13,13 28,3 L 32,5 Q 16,16 5,32 Z')
     .fillColor('#F5E29D')
     .fill();

  doc.restore();
}

/**
 * Render the Compact Luxury Thank You Card with Official Nanova Logo
 */
async function renderThankYouCard(doc, fonts, order, cardX, cardY, cardW, cardH) {
  const isTees = order.brand_code === 'nanova_tees';

  // Palette: Luxury warm champagne gold
  const cardBg = '#FAF5EB';
  const cardBorderGold = '#C89D35';
  const cardInnerGold = '#DFBE6B';
  const textBronze = '#704A15';
  const textWarmBrown = '#8A5B18';
  const textDarkGold = '#4A3515';
  const quoteColor = '#D4AF37';

  // 1. Card Container (Compact rounded rectangle with warm champagne fill)
  doc.roundedRect(cardX, cardY, cardW, cardH, 10)
     .fillAndStroke(cardBg, cardBorderGold);

  // 2. Inner delicate gold border
  doc.lineWidth(0.8)
     .roundedRect(cardX + 4, cardY + 4, cardW - 8, cardH - 8, 7)
     .stroke(cardInnerGold);

  // 3. Luxury Golden Ribbons on corners
  drawCornerRibbon(doc, cardX, cardY, false, false);
  drawCornerRibbon(doc, cardX + cardW, cardY + cardH, true, true);

  // 4. Botanical Foliage Flourishes on Left and Right borders
  drawBotanicalBranch(doc, cardX + 18, cardY + 35, 0.75, false);
  drawBotanicalBranch(doc, cardX + cardW - 18, cardY + 35, 0.75, true);

  // 5. TOP SECTION: Official Nanova Logo Emblem + Cursive "Thank You"
  const logoPath = path.join(__dirname, '../../assets/logo.png');
  const hasLogo = fs.existsSync(logoPath);

  let currY = cardY + 8;

  if (hasLogo) {
    const logoSize = 28;
    const logoX = cardX + (cardW - logoSize) / 2;
    // Circular gold emblem backing
    doc.circle(logoX + logoSize / 2, currY + logoSize / 2, logoSize / 2 + 2)
       .fillAndStroke('#FFFDF9', cardBorderGold);
    doc.image(logoPath, logoX, currY, { width: logoSize, height: logoSize });
    currY += logoSize + 4;
  } else {
    currY += 4;
  }

  // Title: "Thank You" in elegant script calligraphy
  doc.fillColor(textBronze)
     .font(fonts.script)
     .fontSize(21)
     .text('Thank You', cardX + 30, currY, { align: 'center', width: cardW - 60 });

  currY += 26;

  // Subtitle: "For choosing Us."
  const greetingNote = isTees
    ? "For choosing Us  *  We're grateful to be part of your style journey & vibe."
    : "For choosing Us  *  We're grateful to be part of your special moments.";

  doc.fillColor(textWarmBrown)
     .font(fonts.serif)
     .fontSize(8)
     .text(greetingNote, cardX + 30, currY, { align: 'center', width: cardW - 60 });

  // 6. Horizontal Subtle Golden Divider
  const divY = currY + 14;
  doc.save()
     .strokeColor('#E2CCA1')
     .lineWidth(0.5)
     .dash(3, { space: 2 })
     .moveTo(cardX + 35, divY)
     .lineTo(cardX + cardW - 35, divY)
     .stroke()
     .restore();

  // 7. BOTTOM SECTION (2-Column: QR Code on Left | Quote & Keepsake on Right)
  const bottomY = divY + 8;

  // --- COLUMN A (LEFT): QR Code & Follow ---
  const qrBoxX = cardX + 30;
  const qrBoxW = 125;

  // Generate real scannable QR Code
  let qrBuffer = null;
  try {
    const qrTarget = order.instagram_url || `https://www.instagram.com/${order.instagram_handle?.replace('@', '')}` || 'https://nanova-tees.loca.lt';
    qrBuffer = await QRCode.toBuffer(qrTarget, {
      margin: 1,
      width: 140,
      color: {
        dark: '#4A3515',
        light: '#FAF5EB'
      }
    });
  } catch (e) {
    console.warn('[QR Code Generation Warning]:', e.message);
  }

  const qrSize = 54;
  const qrX = qrBoxX + (qrBoxW - qrSize) / 2;
  const qrY = bottomY;

  if (qrBuffer) {
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
  } else {
    doc.roundedRect(qrX, qrY, qrSize, qrSize, 5).fillAndStroke('#FFFDF9', cardBorderGold);
    doc.fillColor(textBronze).font(fonts.sansBold).fontSize(7).text('SCAN ME', qrX, qrY + 22, { align: 'center', width: qrSize });
  }

  // Pill badge: [ SCAN & FOLLOW US ]
  const badgeY = qrY + qrSize + 4;
  const badgeW = 92;
  const badgeX = qrBoxX + (qrBoxW - badgeW) / 2;

  doc.roundedRect(badgeX, badgeY, badgeW, 13, 6)
     .fillAndStroke('#F2E2C4', cardBorderGold);

  doc.fillColor(textBronze)
     .font(fonts.sansBold)
     .fontSize(6.5)
     .text('SCAN & FOLLOW US', badgeX, badgeY + 3, { align: 'center', width: badgeW });

  // Friendly subtext
  doc.fillColor('#6E4F1E')
     .font(fonts.sans)
     .fontSize(6)
     .text('Stay connected for new collections!', qrBoxX, badgeY + 14, { align: 'center', width: qrBoxW });

  // --- COLUMN B (RIGHT): Heartwarming Quote & Card Keepsake ---
  const quoteBoxX = cardX + 165;
  const quoteBoxW = cardW - 195;
  let qY = bottomY;

  // Golden Quote Marks
  doc.fillColor(quoteColor)
     .font(fonts.serif)
     .fontSize(16)
     .text('"', quoteBoxX, qY - 2, { align: 'center', width: quoteBoxW });

  qY += 10;

  // Heartwarming Quote text
  const quoteText = isTees
    ? 'Wear your vibe with pride.\nThank you for letting us be part of your story. *'
    : 'Every gift tells a story.\nThank you for letting us be part of yours. *';

  doc.fillColor(textDarkGold)
     .font(fonts.serif)
     .fontSize(8.5)
     .text(quoteText, quoteBoxX, qY, { align: 'center', width: quoteBoxW, lineGap: 2 });

  qY += 24;

  // Card Reference Box
  const cardNoBoxW = 155;
  const cardNoBoxX = quoteBoxX + (quoteBoxW - cardNoBoxW) / 2;
  const cardNo = `SN-${order.order_number.replace('NAN-', '')}`;

  doc.roundedRect(cardNoBoxX, qY, cardNoBoxW, 16, 5)
     .fillAndStroke('#FFFDF9', cardBorderGold);

  doc.fillColor(textBronze)
     .font(fonts.sansBold)
     .fontSize(7.5)
     .text(`Card No.:  ${cardNo}`, cardNoBoxX, qY + 4, { align: 'center', width: cardNoBoxW });

  qY += 19;

  // Calligraphy accent
  const cursiveTagline = isTees ? 'Wear Your Vibe *' : 'Making Every Moment Special *';
  doc.fillColor(textWarmBrown)
     .font(fonts.script)
     .fontSize(10.5)
     .text(cursiveTagline, quoteBoxX, qY, { align: 'center', width: quoteBoxW });

  // 8. CARD FOOTER SOCIAL BAR
  const footY = cardY + cardH - 18;
  doc.roundedRect(cardX + 8, footY, cardW - 16, 14, 4)
     .fill('#F4E8D1');

  const igHandle = isTees ? '@nanova_tees' : '@surprise_nova_11.11';
  const contactText = `Instagram: ${order.instagram_handle || igHandle}       *       WhatsApp / Phone: +91 7904756012`;
  doc.fillColor('#634515')
     .font(fonts.sansBold)
     .fontSize(7)
     .text(contactText, cardX + 10, footY + 3, { align: 'center', width: cardW - 20 });
}

/**
 * Generate Complete Invoice PDF (Colorful Simple Bill + Attached Compact Luxury Thank You Card)
 */
export async function generateInvoicePdf(orderId) {
  const order = await getOne(
    `SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, 
            c.address, c.city, c.district, c.state, c.pin_code,
            b.code as brand_code, b.name as brand_name, b.tagline as brand_tagline, 
            b.phone as brand_phone, b.instagram_handle, b.instagram_url
     FROM orders o
     JOIN customers c ON o.customer_id = c.id
     JOIN brands b ON o.brand_id = b.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!order) {
    throw new Error('Order not found for PDF invoice generation.');
  }

  const items = await query(
    `SELECT oi.*, p.sku as product_sku
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId]
  );

  let invoice = await getOne('SELECT * FROM invoices WHERE order_id = ?', [orderId]);
  const invoiceNumber = invoice ? invoice.invoice_number : `INV-${order.order_number.replace('NAN-', '')}`;

  if (!invoice) {
    const today = new Date().toISOString().split('T')[0];
    await query(
      `INSERT INTO invoices (invoice_number, order_id, brand_id, customer_name, customer_phone, customer_address, subtotal, delivery_charges, discount_amount, gst_rate, gst_amount, total_amount, invoice_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        invoiceNumber,
        orderId,
        order.brand_id,
        order.customer_name,
        order.customer_phone,
        `${order.address}, ${order.city}, ${order.district}, ${order.state} - ${order.pin_code}`,
        order.subtotal,
        order.delivery_charges,
        order.discount_amount,
        order.final_amount,
        today
      ]
    );
  }

  const doc = new PDFDocument({ margin: 35, size: 'A4' });
  const filename = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoicesDir, filename);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  const fonts = setupFonts(doc);

  // Styling & Palette (Tastefully colorful yet simple)
  const isTees = order.brand_code === 'nanova_tees';
  const primaryColor = isTees ? '#1E293B' : '#7C5012';       // Sleek Navy / Warm Caramel
  const secondaryColor = isTees ? '#2563EB' : '#9E6B18';     // Vibrant Royal Blue / Golden Honey
  const lightCardBg = isTees ? '#F8FAFC' : '#FAF7F2';        // Soft light panel
  const borderColor = isTees ? '#E2E8F0' : '#E8DCB8';

  const marginX = 35;
  const contentW = 525;

  // ==========================================
  // SECTION 1: THE COLORFUL SIMPLE TAX INVOICE
  // ==========================================

  // 1. Header Banner
  doc.roundedRect(marginX, 30, contentW, 58, 8).fill(primaryColor);

  // Brand Name & Tagline
  doc.fillColor('#FFFFFF')
     .font(fonts.sansBold)
     .fontSize(18)
     .text(order.brand_name, marginX + 16, 40);

  doc.fillColor(isTees ? '#93C5FD' : '#FCE8BD')
     .font(fonts.sans)
     .fontSize(8.5)
     .text(order.brand_tagline, marginX + 16, 64);

  // Tax Invoice & Meta (Right Aligned)
  doc.fillColor('#FFFFFF')
     .font(fonts.sansBold)
     .fontSize(13)
     .text('TAX INVOICE', marginX + contentW - 170, 40, { align: 'right', width: 154 });

  doc.fillColor(isTees ? '#E2E8F0' : '#FFF5E0')
     .font(fonts.sans)
     .fontSize(8)
     .text(`Invoice #: ${invoiceNumber}`, marginX + contentW - 170, 56, { align: 'right', width: 154 })
     .text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, marginX + contentW - 170, 68, { align: 'right', width: 154 });

  // 2. Sold By & Bill To / Ship To Panels
  const panelY = 96;
  const panelH = 78;
  const panelW = (contentW - 12) / 2;

  // Left Panel: Sold By (Owner Details)
  doc.roundedRect(marginX, panelY, panelW, panelH, 6)
     .fillAndStroke(lightCardBg, borderColor);

  doc.fillColor(secondaryColor)
     .font(fonts.sansBold)
     .fontSize(8)
     .text('SOLD BY / DISPATCHED FROM:', marginX + 10, panelY + 7);

  doc.fillColor('#111827')
     .font(fonts.sansBold)
     .fontSize(8.5)
     .text(`${order.brand_name} (Prop. Naveen)`, marginX + 10, panelY + 19);

  doc.font(fonts.sans)
     .fontSize(7.5)
     .fillColor('#374151')
     .text('142/79A, 2nd Street, Karunanithi Nagar, Sowripalayam', marginX + 10, panelY + 31, { width: panelW - 20, lineBreak: false })
     .text('COIMBATORE, TAMIL NADU 641028, India', marginX + 10, panelY + 42)
     .text('Phone number: +91 7904756012', marginX + 10, panelY + 53)
     .text(`Instagram: ${order.instagram_handle}  *  Verified Store`, marginX + 10, panelY + 64, { width: panelW - 20, lineBreak: false });

  // Right Panel: Bill To / Ship To
  const rightPanelX = marginX + panelW + 12;
  doc.roundedRect(rightPanelX, panelY, panelW, panelH, 6)
     .fillAndStroke(lightCardBg, borderColor);

  doc.fillColor(secondaryColor)
     .font(fonts.sansBold)
     .fontSize(8)
     .text('BILL TO / SHIP TO:', rightPanelX + 10, panelY + 7);

  doc.fillColor('#111827')
     .font(fonts.sansBold)
     .fontSize(8.5)
     .text(order.customer_name, rightPanelX + 10, panelY + 19);

  doc.font(fonts.sans)
     .fontSize(7.5)
     .fillColor('#374151')
     .text(`Phone: +91 ${order.customer_phone}`, rightPanelX + 10, panelY + 31)
     .text(order.address, rightPanelX + 10, panelY + 42, { width: panelW - 20, lineBreak: false })
     .text(`${order.city}, ${order.district ? order.district + ', ' : ''}${order.state} - ${order.pin_code}`, rightPanelX + 10, panelY + 53, { width: panelW - 20, lineBreak: false })
     .text('Country: India  *  Standard Delivery', rightPanelX + 10, panelY + 64);

  // 3. Order Reference Bar
  const refY = panelY + panelH + 8;
  doc.roundedRect(marginX, refY, contentW, 20, 4)
     .fillAndStroke(isTees ? '#F1F5F9' : '#F6F0E4', borderColor);

  doc.fillColor('#374151')
     .font(fonts.sansBold)
     .fontSize(8)
     .text(`Order ID: ${order.order_number}`, marginX + 12, refY + 6)
     .text(`Payment: ${order.payment_method === 'UPI_QR' ? 'UPI QR Payment' : 'Cash on Delivery'}`, marginX + 210, refY + 6)
     .text(`Status: ${order.payment_status}`, marginX + 390, refY + 6);

  // 4. Items Table
  let tableY = refY + 26;
  const thH = 18;

  // Header
  doc.roundedRect(marginX, tableY, contentW, thH, 4).fill(secondaryColor);
  doc.fillColor('#FFFFFF')
     .font(fonts.sansBold)
     .fontSize(8)
     .text('Item Description', marginX + 12, tableY + 5)
     .text('Size / Color', marginX + 220, tableY + 5)
     .text('Qty', marginX + 325, tableY + 5, { align: 'center', width: 35 })
     .text('Price', marginX + 375, tableY + 5, { align: 'right', width: 60 })
     .text('Total', marginX + 445, tableY + 5, { align: 'right', width: 65 });

  tableY += thH;

  // Render Items (up to 4 items on Page 1)
  const maxPage1Items = 4;
  const itemsToRender = items.slice(0, maxPage1Items);

  for (let i = 0; i < itemsToRender.length; i++) {
    const item = itemsToRender[i];
    const rowH = 18;
    const isEven = i % 2 === 1;

    if (isEven) {
      doc.rect(marginX, tableY, contentW, rowH).fill('#FBFBFC');
    }

    doc.strokeColor(borderColor).lineWidth(0.5)
       .rect(marginX, tableY, contentW, rowH).stroke();

    doc.fillColor('#1F2937')
       .font(fonts.sans)
       .fontSize(8)
       .text(item.product_name, marginX + 12, tableY + 5, { width: 195, lineBreak: false })
       .text(`${item.size} * ${item.color}`, marginX + 220, tableY + 5, { width: 95, lineBreak: false })
       .text(String(item.quantity), marginX + 325, tableY + 5, { align: 'center', width: 35 })
       .text(formatINR(item.unit_price), marginX + 375, tableY + 5, { align: 'right', width: 60 })
       .text(formatINR(item.subtotal), marginX + 445, tableY + 5, { align: 'right', width: 65 });

    tableY += rowH;
  }

  // 5. Financial Summary Box
  tableY += 6;
  const summaryX = marginX + contentW - 200;
  const summaryW = 200;

  const summaryRows = [
    { label: 'Subtotal:', value: formatINR(order.subtotal) },
    { label: 'Delivery Charges:', value: order.delivery_charges > 0 ? formatINR(order.delivery_charges) : 'FREE' },
    { label: 'Discount:', value: order.discount_amount > 0 ? `- ${formatINR(order.discount_amount)}` : 'Rs. 0.00' },
    { label: 'Final Total:', value: formatINR(order.final_amount), bold: true }
  ];

  for (const s of summaryRows) {
    if (s.bold) {
      doc.roundedRect(summaryX, tableY, summaryW, 19, 4).fill(primaryColor);
      doc.fillColor('#FFFFFF').font(fonts.sansBold).fontSize(9);
      doc.text(s.label, summaryX + 10, tableY + 5);
      doc.text(s.value, summaryX + 85, tableY + 5, { align: 'right', width: 105 });
      tableY += 21;
    } else {
      doc.fillColor('#4B5563').font(fonts.sans).fontSize(7.5);
      doc.text(s.label, summaryX + 10, tableY + 2);
      doc.text(s.value, summaryX + 85, tableY + 2, { align: 'right', width: 105 });
      tableY += 13;
    }
  }

  // ==========================================
  // SECTION 2: PERFORATION & TEAR-OFF LINE
  // ==========================================
  const cutLineY = Math.max(tableY + 10, 310);

  doc.save()
     .strokeColor(borderColor)
     .lineWidth(0.8)
     .dash(4, { space: 3 })
     .moveTo(marginX, cutLineY)
     .lineTo(marginX + contentW, cutLineY)
     .stroke()
     .restore();

  // Cut marker badge in center
  const badgeW = 200;
  const badgeX = marginX + (contentW - badgeW) / 2;
  doc.roundedRect(badgeX, cutLineY - 7, badgeW, 14, 7)
     .fillAndStroke('#FFFFFF', borderColor);

  doc.fillColor('#6B7280')
     .font(fonts.sansBold)
     .fontSize(6.5)
     .text('*  THANK YOU CARD (Cut & Place with Gift)  *', badgeX, cutLineY - 3, { align: 'center', width: badgeW });

  // ==========================================
  // SECTION 3: THE COMPACT LUXURY THANK YOU CARD (WITH LOGO)
  // ==========================================
  const cardY = cutLineY + 12;
  const cardH = 225; // Clean, compact, cute gift card size!

  await renderThankYouCard(doc, fonts, order, marginX, cardY, contentW, cardH);

  // If there are additional overflow items (>4), render them on Page 2
  if (items.length > maxPage1Items) {
    doc.addPage();
    doc.fillColor(primaryColor).font(fonts.sansBold).fontSize(14).text('Order Items (Continued)', marginX, 40);
    let overflowY = 65;

    for (let j = maxPage1Items; j < items.length; j++) {
      const it = items[j];
      doc.rect(marginX, overflowY, contentW, 20).strokeColor(borderColor).stroke();
      doc.fillColor('#1F2937')
         .font(fonts.sans)
         .fontSize(8.5)
         .text(it.product_name, marginX + 12, overflowY + 6, { width: 200 })
         .text(`${it.size} * ${it.color}`, marginX + 225, overflowY + 6)
         .text(String(it.quantity), marginX + 330, overflowY + 6)
         .text(formatINR(it.unit_price), marginX + 380, overflowY + 6, { align: 'right', width: 60 })
         .text(formatINR(it.subtotal), marginX + 450, overflowY + 6, { align: 'right', width: 60 });
      overflowY += 22;
    }

    // Render Standalone Keepsake Card on Page 2
    overflowY += 25;
    await renderThankYouCard(doc, fonts, order, marginX, overflowY, contentW, 225);
  }

  doc.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));

  await query('UPDATE invoices SET pdf_path = ? WHERE invoice_number = ?', [`/uploads/invoices/${filename}`, invoiceNumber]);

  return {
    invoiceNumber,
    filePath,
    url: `/uploads/invoices/${filename}`
  };
}

/**
 * Generate Standalone Printable Thank You Card PDF (Compact Postcard Format)
 */
export async function generateThankYouCardPdf(orderId) {
  const order = await getOne(
    `SELECT o.*, c.full_name as customer_name, c.phone as customer_phone, 
            b.code as brand_code, b.name as brand_name, b.tagline as brand_tagline, 
            b.phone as brand_phone, b.instagram_handle, b.instagram_url
     FROM orders o
     JOIN customers c ON o.customer_id = c.id
     JOIN brands b ON o.brand_id = b.id
     WHERE o.id = ?`,
    [orderId]
  );

  if (!order) {
    throw new Error('Order not found for Thank You Card generation.');
  }

  const cardFilename = `TYC-${order.order_number}.pdf`;
  const filePath = path.join(cardsDir, cardFilename);
  const writeStream = fs.createWriteStream(filePath);

  // Compact Postcard Size: 520 x 265 pt
  const doc = new PDFDocument({
    size: [520, 265],
    margin: 15
  });

  doc.pipe(writeStream);

  const fonts = setupFonts(doc);
  const margin = 15;
  const cardW = 520 - margin * 2;
  const cardH = 265 - margin * 2;

  await renderThankYouCard(doc, fonts, order, margin, margin, cardW, cardH);

  doc.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));

  return {
    cardFilename,
    filePath,
    url: `/uploads/cards/${cardFilename}`
  };
}
