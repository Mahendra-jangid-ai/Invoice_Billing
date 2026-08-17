/**
 * BILLING STUDIO — TADAKTA-FADAKTA 3D INTERACTIVE ENGINE (THREE.JS)
 * Kinetic Rupee Coins, Dynamic Laser Raycast, Click Shockwave Ripples & Undulating 3D Grid
 */

(function () {
  const canvas = document.getElementById('canvas3d');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── 1. Scene, Camera & Studio Renderer Setup ── */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 15);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  /* ── 2. Studio Lighting Rig ── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
  mainLight.position.set(8, 12, 10);
  scene.add(mainLight);

  const fillSoft = new THREE.DirectionalLight(0x93C5FD, 1.0);
  fillSoft.position.set(-8, -4, 6);
  scene.add(fillSoft);

  // Dynamic Interactive Cursor Laser Light (traces mouse in 3D)
  const cursorLaserLight = new THREE.PointLight(0x3B82F6, 4.0, 18);
  cursorLaserLight.position.set(0, 0, 3);
  scene.add(cursorLaserLight);

  const sweepLight = new THREE.PointLight(0x60A5FA, 3.0, 25);
  sweepLight.position.set(0, 0, 4);
  scene.add(sweepLight);

  /* ── 3. High-Definition Canvas Texture Generator ── */
  function createUltraPolishedInvoiceTexture() {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 2800;
    const ctx = c.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const bgGrad = ctx.createLinearGradient(0, 0, 0, 2800);
    bgGrad.addColorStop(0, '#FFFFFF');
    bgGrad.addColorStop(1, '#F8FAFC');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 2800);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1968, 2720);

    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(40, 40, 1968, 28);

    ctx.fillStyle = '#1D4ED8';
    roundRect(ctx, 120, 140, 90, 90, 22, true, false);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.strokeRect(148, 162, 34, 46);
    ctx.beginPath();
    ctx.moveTo(158, 178); ctx.lineTo(172, 178);
    ctx.moveTo(158, 192); ctx.lineTo(172, 192);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 68px system-ui, -apple-system, sans-serif';
    ctx.fillText('BILLING STUDIO', 240, 195);

    ctx.fillStyle = '#1D4ED8';
    ctx.font = '700 28px monospace';
    ctx.fillText('ORIGINAL TAX INVOICE · GST COMPLIANT', 240, 235);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748B';
    ctx.font = '600 30px system-ui, sans-serif';
    ctx.fillText('INVOICE NUMBER', 1928, 150);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 48px monospace';
    ctx.fillText('BS-2026-8891', 1928, 205);

    ctx.fillStyle = '#DCFCE7';
    roundRect(ctx, 1728, 225, 200, 52, 26, true, false);
    ctx.fillStyle = '#166534';
    ctx.font = '700 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ FINALIZED', 1828, 260);

    ctx.textAlign = 'left';

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 310);
    ctx.lineTo(1928, 310);
    ctx.stroke();

    const metaY = 370;
    const metaCols = [
      { label: 'DATE OF ISSUE', val: '17 AUG 2026', x: 120 },
      { label: 'DUE DATE', val: 'IMMEDIATE', x: 600 },
      { label: 'PLACE OF SUPPLY', val: '29 - KARNATAKA', x: 1080 },
      { label: 'PAYMENT TERMS', val: 'UPI / NET BANKING', x: 1560 }
    ];

    metaCols.forEach(col => {
      ctx.fillStyle = '#64748B';
      ctx.font = '600 24px monospace';
      ctx.fillText(col.label, col.x, metaY);
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 32px system-ui, sans-serif';
      ctx.fillText(col.val, col.x, metaY + 45);
    });

    const cardY = 480;
    const cardW = 880;
    const cardH = 260;

    // Supplier Card
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, 120, cardY, cardW, cardH, 20, true, false);
    ctx.strokeStyle = '#E2E8F0';
    roundRect(ctx, 120, cardY, cardW, cardH, 20, false, true);

    ctx.fillStyle = '#1D4ED8';
    ctx.font = '700 24px monospace';
    ctx.fillText('BILLED BY (SUPPLIER)', 160, cardY + 50);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 36px system-ui, sans-serif';
    ctx.fillText('Apex Technologies Pvt Ltd', 160, cardY + 105);

    ctx.fillStyle = '#475569';
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillText('GSTIN: 07AAACA1234A1Z5 · State: Delhi (07)', 160, cardY + 155);
    ctx.fillText('Building 4A, DLF Cyber City, Gurugram 122002', 160, cardY + 200);

    // Customer Card
    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, 1048, cardY, cardW, cardH, 20, true, false);
    ctx.strokeStyle = '#E2E8F0';
    roundRect(ctx, 1048, cardY, cardW, cardH, 20, false, true);

    ctx.fillStyle = '#1D4ED8';
    ctx.font = '700 24px monospace';
    ctx.fillText('BILLED TO (CUSTOMER)', 1088, cardY + 50);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 36px system-ui, sans-serif';
    ctx.fillText('Razorpay Software Ltd', 1088, cardY + 105);

    ctx.fillStyle = '#475569';
    ctx.font = '500 28px system-ui, sans-serif';
    ctx.fillText('GSTIN: 29AABCR5678B1Z2 · State: Karnataka (29)', 1088, cardY + 155);
    ctx.fillText('Koramangala 4th Block, Bengaluru 560034', 1088, cardY + 200);

    // Line Items Table
    const tableTop = 790;
    
    ctx.fillStyle = '#0F172A';
    roundRect(ctx, 120, tableTop, 1808, 70, 14, true, false);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 26px monospace';
    ctx.fillText('NO', 160, tableTop + 45);
    ctx.fillText('ITEM / SERVICE DESCRIPTION', 260, tableTop + 45);
    ctx.fillText('HSN/SAC', 1080, tableTop + 45);
    ctx.fillText('QTY', 1280, tableTop + 45);
    ctx.fillText('RATE (₹)', 1450, tableTop + 45);
    ctx.fillText('AMOUNT (₹)', 1720, tableTop + 45);

    const tableRows = [
      { num: '01', title: 'Cloud Infrastructure Management', sub: 'Dedicated cluster monitoring, auto-scaling & maintenance', hsn: '998313', qty: '1.0 Units', rate: '75,000.00', amount: '75,000.00' },
      { num: '02', title: 'API Billing & Invoicing Engine License', sub: 'Tier-1 high throughput transaction signing & telemetry', hsn: '998314', qty: '1.0 Annual', rate: '50,000.00', amount: '50,000.00' },
      { num: '03', title: 'Priority 24/7 SLA & Regulatory Filing Support', sub: 'Automated E-way bill dispatch integration', hsn: '998319', qty: '1.0 Pack', rate: '0.00', amount: '0.00' }
    ];

    let rowY = tableTop + 100;
    tableRows.forEach((row, i) => {
      if (i % 2 === 0) {
        ctx.fillStyle = '#F8FAFC';
        roundRect(ctx, 120, rowY - 20, 1808, 120, 12, true, false);
      }

      ctx.fillStyle = '#64748B';
      ctx.font = '700 28px monospace';
      ctx.fillText(row.num, 160, rowY + 30);

      ctx.fillStyle = '#0F172A';
      ctx.font = '700 32px system-ui, sans-serif';
      ctx.fillText(row.title, 260, rowY + 25);

      ctx.fillStyle = '#64748B';
      ctx.font = '500 24px system-ui, sans-serif';
      ctx.fillText(row.sub, 260, rowY + 65);

      ctx.fillStyle = '#475569';
      ctx.font = '600 28px monospace';
      ctx.fillText(row.hsn, 1080, rowY + 40);
      ctx.fillText(row.qty, 1280, rowY + 40);
      ctx.fillText(row.rate, 1450, rowY + 40);

      ctx.fillStyle = '#0F172A';
      ctx.font = '800 32px monospace';
      ctx.fillText(row.amount, 1720, rowY + 40);

      rowY += 135;
    });

    const sumY = 1270;
    const sumW = 820;
    const sumH = 430;
    const sumX = 1108;

    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, sumX, sumY, sumW, sumH, 20, true, false);
    ctx.strokeStyle = '#E2E8F0';
    roundRect(ctx, sumX, sumY, sumW, sumH, 20, false, true);

    const sumLines = [
      { label: 'Taxable Value (Subtotal):', val: '₹ 1,25,000.00' },
      { label: 'Inter-state IGST (18.0%):', val: '₹ 22,500.00' },
      { label: 'Cash Discount / Promo:', val: '- ₹ 0.00' },
      { label: 'Round Off:', val: '₹ 0.00' },
    ];

    let lineY = sumY + 60;
    sumLines.forEach(l => {
      ctx.fillStyle = '#475569';
      ctx.font = '600 28px system-ui, sans-serif';
      ctx.fillText(l.label, sumX + 40, lineY);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F172A';
      ctx.font = '700 30px monospace';
      ctx.fillText(l.val, sumX + sumW - 40, lineY);
      ctx.textAlign = 'left';

      lineY += 55;
    });

    ctx.fillStyle = '#1D4ED8';
    roundRect(ctx, sumX + 20, sumY + 300, sumW - 40, 105, 16, true, false);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 32px system-ui, sans-serif';
    ctx.fillText('TOTAL DUE', sumX + 50, sumY + 365);

    ctx.textAlign = 'right';
    ctx.font = '800 48px monospace';
    ctx.fillText('₹ 1,47,500.00', sumX + sumW - 50, sumY + 370);
    ctx.textAlign = 'left';

    const payY = 1270;
    const payW = 940;
    const payH = 430;

    ctx.fillStyle = '#F8FAFC';
    roundRect(ctx, 120, payY, payW, payH, 20, true, false);
    ctx.strokeStyle = '#E2E8F0';
    roundRect(ctx, 120, payY, payW, payH, 20, false, true);

    ctx.fillStyle = '#DCFCE7';
    roundRect(ctx, 160, payY + 40, 460, 68, 14, true, false);
    ctx.fillStyle = '#166534';
    ctx.font = '800 28px system-ui, sans-serif';
    ctx.fillText('✓ SETTLED VIA RAZORPAY UPI', 185, payY + 84);

    const qrSize = 190;
    const qrX = 160;
    const qrY = payY + 140;

    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, qrX, qrY, qrSize, qrSize, 16, true, false);
    ctx.strokeStyle = '#CBD5E1';
    roundRect(ctx, qrX, qrY, qrSize, qrSize, 16, false, true);

    drawHighFidelityQR(ctx, qrX + 15, qrY + 15, qrSize - 30);

    ctx.fillStyle = '#0F172A';
    ctx.font = '800 32px system-ui, sans-serif';
    ctx.fillText('Scan & Pay via any UPI App', qrX + qrSize + 35, payY + 190);

    ctx.fillStyle = '#475569';
    ctx.font = '600 26px monospace';
    ctx.fillText('VPA: apextech@okaxis', qrX + qrSize + 35, payY + 235);
    ctx.fillText('Bank: HDFC Bank Ltd · A/c: 502000889123', qrX + qrSize + 35, payY + 275);
    ctx.fillText('IFSC: HDFC0000123 · Branch: Cyber City', qrX + qrSize + 35, payY + 315);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillText('Terms: This is a computer generated tax invoice and does not require physical signature.', 120, 2680);
    ctx.fillText('Certified under the Central Goods and Services Tax Act, 2017.', 120, 2720);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#1D4ED8';
    ctx.font = '700 26px monospace';
    ctx.fillText('🔒 DIGITALLY SIGNED & ENCRYPTED BY BILLING STUDIO', 1928, 2700);
    ctx.textAlign = 'left';

    const texture = new THREE.CanvasTexture(c);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.generateMipmaps = true;
    return texture;
  }

  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  function drawHighFidelityQR(ctx, x, y, size) {
    ctx.fillStyle = '#0F172A';
    const cSize = size * 0.3;

    ctx.fillRect(x, y, cSize, cSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, y + 6, cSize - 12, cSize - 12);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 12, y + 12, cSize - 24, cSize - 24);

    ctx.fillRect(x + size - cSize, y, cSize, cSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + size - cSize + 6, y + 6, cSize - 12, cSize - 12);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + size - cSize + 12, y + 12, cSize - 24, cSize - 24);

    ctx.fillRect(x, y + size - cSize, cSize, cSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 6, y + size - cSize + 6, cSize - 12, cSize - 12);
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(x + 12, y + size - cSize + 12, cSize - 24, cSize - 24);

    const step = size / 8;
    for (let r = 2; r < 6; r++) {
      for (let c = 2; c < 6; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(x + c * step, y + r * step, step * 0.7, step * 0.7);
        }
      }
    }
  }

  /* ── 4. Build Multi-Layer 3D Physical Assembly ── */
  const masterRig = new THREE.Group();
  scene.add(masterRig);

  // Layer 0: Beveled Glass Card Backing (Constrained to container)
  const cardW = 4.4;
  const cardH = 6.0;
  const cardDepth = 0.08;

  const baseGlassGeo = new THREE.BoxGeometry(cardW, cardH, cardDepth);
  const baseGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xFFFFFF,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: 0.15,
    opacity: 0.98,
    transparent: true
  });
  const baseCard = new THREE.Mesh(baseGlassGeo, baseGlassMat);
  masterRig.add(baseCard);

  const bevelGeo = new THREE.EdgesGeometry(baseGlassGeo);
  const bevelMat = new THREE.LineBasicMaterial({
    color: 0x93C5FD,
    transparent: true,
    opacity: 0.4
  });
  const bevelLine = new THREE.LineSegments(bevelGeo, bevelMat);
  masterRig.add(bevelLine);

  // Layer 1: Razor-Sharp Invoice Face
  const invoiceTex = createUltraPolishedInvoiceTexture();
  const invoiceGeo = new THREE.PlaneGeometry(4.32, 5.9);
  const invoiceMat = new THREE.MeshBasicMaterial({
    map: invoiceTex,
    transparent: true,
    side: THREE.DoubleSide
  });
  const invoiceMesh = new THREE.Mesh(invoiceGeo, invoiceMat);
  invoiceMesh.position.z = 0.045;
  masterRig.add(invoiceMesh);

  // Layer 2: Ultra-Polished Floating WhatsApp Dispatch Pill
  function createPolishedWhatsAppPill() {
    const group = new THREE.Group();
    const c = document.createElement('canvas');
    c.width = 640;
    c.height = 180;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#065F46';
    roundRect(ctx, 10, 10, 620, 160, 80, true, false);

    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 4;
    roundRect(ctx, 10, 10, 620, 160, 80, false, true);

    ctx.fillStyle = '#10B981';
    roundRect(ctx, 35, 35, 110, 110, 55, true, false);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px system-ui';
    ctx.fillText('💬', 62, 108);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('WhatsApp Direct PDF', 170, 85);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '600 26px system-ui, sans-serif';
    ctx.fillText('Delivered in 0.4s • Ready to Pay', 170, 130);

    const tex = new THREE.CanvasTexture(c);
    const planeGeo = new THREE.PlaneGeometry(2.3, 0.65);
    const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    group.add(mesh);
    return group;
  }

  const sharePillGroup = createPolishedWhatsAppPill();
  sharePillGroup.position.set(-1.6, 1.8, 0.08);
  masterRig.add(sharePillGroup);

  // Layer 3: Ultra-Polished Floating Tax Intelligence Chip
  function createPolishedTaxChip() {
    const group = new THREE.Group();
    const c = document.createElement('canvas');
    c.width = 680;
    c.height = 200;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#1E3A8A';
    roundRect(ctx, 10, 10, 660, 180, 24, true, false);

    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 4;
    roundRect(ctx, 10, 10, 660, 180, 24, false, true);

    ctx.fillStyle = '#2563EB';
    roundRect(ctx, 35, 35, 110, 130, 18, true, false);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px system-ui';
    ctx.fillText('🛡️', 60, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 36px system-ui, sans-serif';
    ctx.fillText('GST Auto-Classification', 170, 85);

    ctx.fillStyle = '#93C5FD';
    ctx.font = '700 26px monospace';
    ctx.fillText('IGST 18% · State POS: 29 (KA)', 170, 135);

    const tex = new THREE.CanvasTexture(c);
    const planeGeo = new THREE.PlaneGeometry(2.4, 0.7);
    const planeMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    group.add(mesh);
    return group;
  }

  const taxChipGroup = createPolishedTaxChip();
  taxChipGroup.position.set(1.6, -1.8, 0.08);
  masterRig.add(taxChipGroup);

  // Layer 4: TADAKTA-FADAKTA 3D HOLOGRAPHIC RUPEE (₹) COINS
  const coinsGroup = new THREE.Group();
  masterRig.add(coinsGroup);

  function createRupeeCoin(radius, color) {
    const group = new THREE.Group();

    // Coin body
    const coinGeo = new THREE.CylinderGeometry(radius, radius, 0.10, 48);
    const coinMat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.90,
      roughness: 0.10,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.0
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.rotation.x = Math.PI / 2;
    group.add(coinMesh);

    // Rim ring for detail
    const rimGeo = new THREE.TorusGeometry(radius, 0.025, 8, 48);
    const rimMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.05,
      emissive: color,
      emissiveIntensity: 0.35
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    group.add(rimMesh);

    // ₹ face — transparent background (no white box)
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    // Fully transparent background — no fillRect
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = 'bold 148px system-ui, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('₹', 128, 132);
    const tex = new THREE.CanvasTexture(c);
    tex.premultiplyAlpha = false;
    const faceGeo = new THREE.PlaneGeometry(radius * 1.55, radius * 1.55);
    const faceMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.01,
      depthWrite: false
    });
    const faceMesh = new THREE.Mesh(faceGeo, faceMat);
    faceMesh.position.z = 0.06;
    group.add(faceMesh);

    return group;
  }

  // Coins live directly in the scene (NOT inside masterRig)
  // so they never clip through the bill geometry
  const coin1 = createRupeeCoin(0.44, 0x1D4ED8);
  const coin2 = createRupeeCoin(0.34, 0x10B981);
  const coin3 = createRupeeCoin(0.30, 0xF59E0B);
  scene.add(coin1);
  scene.add(coin2);
  scene.add(coin3);

  // Layer 5: Interactive 3D Click Shockwave Ripple Ring
  const rippleGeo = new THREE.RingGeometry(0.1, 0.25, 64);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: 0x3B82F6,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
  rippleMesh.position.z = 0.06;
  masterRig.add(rippleMesh);

  let rippleProgress = 1.0;
  window.addEventListener('click', (e) => {
    rippleProgress = 0.0;
    rippleMesh.position.x = (e.clientX / window.innerWidth - 0.5) * 3;
    rippleMesh.position.y = -(e.clientY / window.innerHeight - 0.5) * 3;
  });

  // Layer 6: Undulating 3D Financial Energy Wireframe Grid
  const gridGeo = new THREE.PlaneGeometry(26, 26, 24, 24);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x2563EB,
    wireframe: true,
    transparent: true,
    opacity: 0.06
  });
  const energyGrid = new THREE.Mesh(gridGeo, gridMat);
  energyGrid.rotation.x = -Math.PI / 2.3;
  energyGrid.position.set(0, -5.5, -3);
  scene.add(energyGrid);

  // Layer 7: Ambient Dust Sparkles
  const DUST_COUNT = 60;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT * 3; i += 3) {
    dustPos[i] = (Math.random() - 0.5) * 16;
    dustPos[i + 1] = (Math.random() - 0.5) * 12;
    dustPos[i + 2] = (Math.random() - 0.5) * 8;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x93C5FD,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const dustField = new THREE.Points(dustGeo, dustMat);
  scene.add(dustField);

  /* ── 5. Chapter Keyframes (Strictly inside 1180px Container Bounds) ── */
  const KEYFRAMES = [
    // Step 0: Hero — Right inside container (x: 2.3)
    { x: 2.3, y: 0.0, z: 0.0, rx: 0.08, ry: -0.25, rz: 0.02, scale: 0.95, badgeZ: 0.08, badgeRotY: 0.0, pillZ: 0.08, camZ: 14.5 },
    // Step 1: Deconstruct — Right inside container (x: 2.4)
    { x: 2.4, y: 0.15, z: 0.3, rx: 0.18, ry: -0.42, rz: 0.05, scale: 0.98, badgeZ: 0.5, badgeRotY: -0.15, pillZ: 0.45, camZ: 14.0 },
    // Step 2: Tax Telemetry — Left inside container (x: -2.4)
    { x: -2.4, y: -0.1, z: 0.3, rx: -0.10, ry: 0.42, rz: -0.04, scale: 1.0, badgeZ: 1.4, badgeRotY: 0.3, pillZ: 0.2, camZ: 13.8 },
    // Step 3: WhatsApp Dispatch — Right inside container (x: 2.4)
    { x: 2.4, y: 0.1, z: 0.4, rx: 0.12, ry: -0.38, rz: 0.04, scale: 0.98, badgeZ: 0.3, badgeRotY: 0.0, pillZ: 1.5, camZ: 14.0 },
    // Step 4: Ledger Radar — Left inside container (x: -2.3)
    { x: -2.3, y: 0.0, z: 0.5, rx: 0.05, ry: 0.30, rz: -0.02, scale: 1.05, badgeZ: 0.7, badgeRotY: 0.15, pillZ: 0.7, camZ: 13.5 }
  ];

  /* ── 6. Scroll Tracking ── */
  let scrollProgress = 0;
  let scrollVelocity = 0;
  let lastScrollProgress = 0;
  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

  function calculateScroll() {
    const track = document.getElementById('product-story');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const totalDist = track.offsetHeight - window.innerHeight;
    const currentScroll = Math.max(0, -rect.top);
    const raw = Math.min(Math.max(currentScroll / totalDist, 0), 1);
    scrollVelocity = raw - lastScrollProgress;
    lastScrollProgress = raw;
    scrollProgress = raw;
  }

  window.addEventListener('scroll', calculateScroll, { passive: true });
  calculateScroll();

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    calculateScroll();
  });

  /* Quintic smooth-step — more cinematic ease-in/out than cubic */
  function smoothStepQ(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function interpolateKF(prog) {
    const totalSteps = KEYFRAMES.length - 1;
    const scaled = prog * totalSteps;
    const idx = Math.min(Math.floor(scaled), totalSteps - 1);
    const rawT = scaled - idx;
    const t = smoothStepQ(rawT);

    const a = KEYFRAMES[idx];
    const b = KEYFRAMES[Math.min(idx + 1, totalSteps)];
    const lerp = (prop) => a[prop] + (b[prop] - a[prop]) * t;

    return {
      x: lerp('x'), y: lerp('y'), z: lerp('z'),
      rx: lerp('rx'), ry: lerp('ry'), rz: lerp('rz'),
      scale: lerp('scale'),
      badgeZ: lerp('badgeZ'), badgeRotY: lerp('badgeRotY'),
      pillZ: lerp('pillZ'), camZ: lerp('camZ')
    };
  }

  /* ── 7. Ultra-Polished Kinetic Render Loop ── */
  const cur = { ...KEYFRAMES[0] };
  const clock = new THREE.Clock();

  // Intro entrance animation state
  let introT = 0;

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    const elapsedTime = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05);

    // Smooth mouse damping
    mouseX += (targetMouseX - mouseX) * 0.055;
    mouseY += (targetMouseY - mouseY) * 0.055;

    const target = interpolateKF(scrollProgress);
    const isMobile = window.innerWidth < 768;
    const effectiveTargetX = isMobile ? 0 : target.x;
    const effectiveScale = isMobile ? target.scale * 0.72 : target.scale;

    // Adaptive LERP: faster when scroll is moving, silkier when idle
    const scrollSpeed = Math.min(Math.abs(scrollVelocity) * 120, 1.0);
    const LERP_SPEED = 0.065 + scrollSpeed * 0.055;

    cur.x      += (effectiveTargetX   - cur.x)      * LERP_SPEED;
    cur.y      += (target.y           - cur.y)       * LERP_SPEED;
    cur.z      += (target.z           - cur.z)       * LERP_SPEED;
    cur.rx     += (target.rx          - cur.rx)      * LERP_SPEED;
    cur.ry     += (target.ry          - cur.ry)      * LERP_SPEED;
    cur.rz     += (target.rz          - cur.rz)      * LERP_SPEED;
    cur.scale  += (effectiveScale     - cur.scale)   * LERP_SPEED;
    cur.badgeZ += (target.badgeZ      - cur.badgeZ)  * LERP_SPEED;
    cur.badgeRotY += (target.badgeRotY - cur.badgeRotY) * LERP_SPEED;
    cur.pillZ  += (target.pillZ       - cur.pillZ)   * LERP_SPEED;
    cur.camZ   += (target.camZ        - cur.camZ)    * LERP_SPEED;

    // ── Idle organic micro-drift (multi-frequency, never repeating exactly) ──
    const idleX  = Math.sin(elapsedTime * 0.42) * 0.018 + Math.sin(elapsedTime * 0.71) * 0.009;
    const idleY  = Math.cos(elapsedTime * 0.35) * 0.022 + Math.cos(elapsedTime * 0.61) * 0.008;
    const idleRx = Math.sin(elapsedTime * 0.28) * 0.006;
    const idleRy = Math.cos(elapsedTime * 0.33) * 0.006;

    masterRig.position.set(
      cur.x + idleX,
      cur.y + idleY + mouseY * 0.10,
      cur.z
    );
    masterRig.rotation.set(
      cur.rx + idleRx - mouseY * 0.055,
      cur.ry + idleRy + mouseX * 0.07,
      cur.rz
    );
    masterRig.scale.setScalar(cur.scale);

    // ── Parallax depth for floating sub-layers (independent frequencies) ──
    const chipFloat  = Math.sin(elapsedTime * 1.15 + 0.6) * 0.04;
    const pillFloat  = Math.cos(elapsedTime * 0.95 + 1.2) * 0.04;
    taxChipGroup.position.z  = cur.badgeZ + chipFloat;
    taxChipGroup.rotation.y  = cur.badgeRotY + Math.sin(elapsedTime * 0.4) * 0.04;
    taxChipGroup.rotation.x  = Math.cos(elapsedTime * 0.3) * 0.03;
    sharePillGroup.position.z = cur.pillZ + pillFloat;
    sharePillGroup.rotation.y = Math.sin(elapsedTime * 0.38) * 0.04;

    // ── Sweep light: smooth figure-8 Lissajous over the document ──
    const lissX = Math.sin(elapsedTime * 0.7) * 2.0;
    const lissY = Math.sin(elapsedTime * 0.5 + Math.PI / 4) * 1.6;
    sweepLight.position.set(cur.x + lissX, cur.y + lissY, cur.z + 2.6);
    sweepLight.intensity = 2.8 + Math.sin(elapsedTime * 1.2) * 0.4;

    // Cursor laser light — smooth, not jittery
    cursorLaserLight.position.x += (cur.x + mouseX * 2.2 - cursorLaserLight.position.x) * 0.08;
    cursorLaserLight.position.y += (cur.y + mouseY * 2.2 - cursorLaserLight.position.y) * 0.08;
    cursorLaserLight.position.z = cur.z + 2.0;

    // ── Kinetic Rupee Coins — orbit around bill in WORLD space ──
    // Coins are scene-level objects (not masterRig children) so they
    // NEVER clip into the bill. Z is forced always AHEAD of the bill face.
    const rigX = masterRig.position.x;
    const rigY = masterRig.position.y;
    const rigZ = masterRig.position.z;
    const billFrontZ = rigZ + 0.5 * cur.scale;   // safe front-of-bill offset
    const coinScale  = isMobile ? 0.55 : 1.0;

    // Coin 1 — large blue, wide horizontal ellipse, right side
    const r1 = (2.2 + Math.sin(elapsedTime * 0.38) * 0.12) * coinScale;
    coin1.position.set(
      rigX + Math.sin(elapsedTime * 1.1) * r1,
      rigY + Math.cos(elapsedTime * 1.1) * r1 * 0.45,
      billFrontZ + 0.55 + Math.sin(elapsedTime * 0.55) * 0.15
    );
    coin1.rotation.y  = elapsedTime * 1.8;
    coin1.rotation.x  = Math.sin(elapsedTime * 0.7) * 0.38;
    coin1.scale.setScalar(coinScale);

    // Coin 2 — green, counter-clockwise, left-low orbit
    const r2 = (2.5 + Math.cos(elapsedTime * 0.3) * 0.10) * coinScale;
    coin2.position.set(
      rigX + Math.cos(elapsedTime * 0.9 + 2.1) * r2 * 0.85,
      rigY + Math.sin(elapsedTime * 0.9 + 2.1) * r2 * 0.42,
      billFrontZ + 0.45 + Math.cos(elapsedTime * 0.62) * 0.12
    );
    coin2.rotation.y  = -elapsedTime * 1.5;
    coin2.rotation.z  = Math.sin(elapsedTime * 0.5) * 0.32;
    coin2.scale.setScalar(coinScale);

    // Coin 3 — amber/gold, tight diagonal orbit, top-right
    const r3 = (1.9 + Math.sin(elapsedTime * 0.5) * 0.15) * coinScale;
    coin3.position.set(
      rigX + Math.sin(elapsedTime * 0.75 + 4.2) * r3 * 0.7,
      rigY + Math.cos(elapsedTime * 0.75 + 4.2) * r3 * 0.65,
      billFrontZ + 0.40 + Math.sin(elapsedTime * 0.80 + 1.5) * 0.10
    );
    coin3.rotation.z  = elapsedTime * 1.4;
    coin3.rotation.x  = Math.cos(elapsedTime * 0.45) * 0.28;
    coin3.scale.setScalar(coinScale);

    // ── Shockwave Ripple — quintic fade out ──
    if (rippleProgress < 1.0) {
      rippleProgress = Math.min(rippleProgress + 0.028, 1.0);
      const rEase = smoothStepQ(rippleProgress);
      rippleMesh.scale.set(1.0 + rEase * 10.0, 1.0 + rEase * 10.0, 1);
      rippleMat.opacity = Math.pow(1.0 - rEase, 1.8) * 0.75;
    } else {
      rippleMat.opacity = 0;
    }

    // ── Undulating Energy Grid — traveling wave (scroll velocity adds extra ripple) ──
    const pos = energyGrid.geometry.attributes.position;
    const waveBoost = Math.abs(scrollVelocity) * 40;
    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const z = (
        Math.sin(u * 0.28 + elapsedTime * 1.2) *
        Math.cos(v * 0.28 + elapsedTime * 1.2) * 0.4
        + Math.sin(u * 0.55 + elapsedTime * 2.1 + v * 0.3) * (0.12 + waveBoost * 0.06)
      );
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;

    // ── Dust field — parallax drift responding to mouse ──
    dustField.rotation.y = elapsedTime * 0.018 + mouseX * 0.04;
    dustField.rotation.x = mouseY * 0.035;
    dustField.position.z = Math.sin(elapsedTime * 0.2) * 0.5;

    // ── Orbital rings ──
    // (rings are children of masterRig so they inherit rig transform automatically)

    camera.position.z = cur.camZ;

    renderer.render(scene, camera);
  }

  renderLoop();
})();

