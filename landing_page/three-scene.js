/**
 * BILLING STUDIO — APPLE CRAFT 3D ENGINE
 * Deconstructed Multi-Layer Kinetic Invoice Architecture
 */

(function () {
  const canvas = document.getElementById('canvas3d');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── 1. Scene, Camera & Studio Renderer Setup ── */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
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

  /* ── 2. Studio Lighting (Crisp Softbox & Rim Highlights) ── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  // Key Studio Softbox
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
  keyLight.position.set(6, 10, 10);
  scene.add(keyLight);

  // Fill Light (Subtle Brand Blue)
  const fillLight = new THREE.DirectionalLight(0x93C5FD, 1.2);
  fillLight.position.set(-8, -4, 6);
  scene.add(fillLight);

  // Specular Rim Light (Crisp Edge Glint)
  const rimLight = new THREE.PointLight(0x3B82F6, 2.5, 40);
  rimLight.position.set(2, 6, -4);
  scene.add(rimLight);

  /* ── 3. High-Definition Dynamic Canvas Texture Generator ── */
  function createInvoiceCanvasTexture() {
    const c = document.createElement('canvas');
    c.width = 1200;
    c.height = 1600;
    const ctx = c.getContext('2d');

    // Background Canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1200, 1600);

    // Decorative Studio Accent Line
    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(0, 0, 1200, 18);

    // Header Branding
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText('BILLING STUDIO', 70, 110);

    ctx.fillStyle = '#1D4ED8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('TAX INVOICE · ORIGINAL FOR RECIPIENT', 70, 150);

    // Invoice Meta (Right side)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748B';
    ctx.font = '24px sans-serif';
    ctx.fillText('INVOICE NO:', 1130, 95);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 30px monospace';
    ctx.fillText('BS-2026-8891', 1130, 135);
    ctx.fillStyle = '#64748B';
    ctx.font = '22px sans-serif';
    ctx.fillText('DATE: 17 AUG 2026', 1130, 175);
    ctx.textAlign = 'left';

    // Thin separator
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 210);
    ctx.lineTo(1130, 210);
    ctx.stroke();

    // Billed By & Billed To Blocks
    // Billed By
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('BILLED BY', 70, 260);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Apex Technologies Pvt Ltd', 70, 300);
    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText('GSTIN: 07AAACA1234A1Z5 · DL (07)', 70, 335);
    ctx.fillText('Cyber City, DLF Phase 2, Gurugram', 70, 370);

    // Billed To
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('BILLED TO', 650, 260);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Razorpay Software Ltd', 650, 300);
    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText('GSTIN: 29AABCR5678B1Z2 · KA (29)', 650, 335);
    ctx.fillText('Koramangala 4th Block, Bengaluru', 650, 370);

    // Table Header
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(70, 430, 1060, 60);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(70, 430, 1060, 60);

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('ITEM & SERVICE DESCRIPTION', 95, 468);
    ctx.fillText('HSN/SAC', 640, 468);
    ctx.fillText('QTY', 790, 468);
    ctx.fillText('RATE (₹)', 880, 468);
    ctx.fillText('TOTAL (₹)', 1010, 468);

    // Line Items
    const items = [
      { name: 'Cloud Infrastructure Management', hsn: '998313', qty: '1.0', rate: '75,000', total: '75,000.00' },
      { name: 'API Real-time Invoicing Engine License', hsn: '998314', qty: '1.0', rate: '50,000', total: '50,000.00' },
    ];

    items.forEach((item, idx) => {
      const y = 540 + idx * 80;
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(item.name, 95, y);

      ctx.fillStyle = '#475569';
      ctx.font = '22px monospace';
      ctx.fillText(item.hsn, 640, y);
      ctx.fillText(item.qty, 790, y);
      ctx.fillText(item.rate, 880, y);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(item.total, 1010, y);

      ctx.strokeStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.moveTo(70, y + 25);
      ctx.lineTo(1130, y + 25);
      ctx.stroke();
    });

    // Summary Box
    ctx.fillStyle = '#EFF6FF';
    ctx.fillRect(650, 720, 480, 260);
    ctx.strokeStyle = '#BFDBFE';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(650, 720, 480, 260);

    ctx.fillStyle = '#475569';
    ctx.font = '22px sans-serif';
    ctx.fillText('Taxable Subtotal:', 680, 770);
    ctx.fillText('IGST (18.0%):', 680, 815);
    ctx.fillText('Cash Discount:', 680, 860);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('₹ 1,25,000.00', 1100, 770);
    ctx.fillText('₹ 22,500.00', 1100, 815);
    ctx.fillText('- ₹ 0.00', 1100, 860);

    ctx.strokeStyle = '#93C5FD';
    ctx.beginPath();
    ctx.moveTo(680, 890);
    ctx.lineTo(1100, 890);
    ctx.stroke();

    ctx.fillStyle = '#1D4ED8';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('TOTAL DUE:', 840, 940);
    ctx.font = 'bold 32px monospace';
    ctx.fillText('₹ 1,47,500.00', 1100, 940);
    ctx.textAlign = 'left';

    // Green Paid Verification Badge
    ctx.fillStyle = '#DCFCE7';
    ctx.fillRect(70, 720, 260, 75);
    ctx.strokeStyle = '#86EFAC';
    ctx.strokeRect(70, 720, 260, 75);
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('✓ PAID ONLINE', 105, 768);

    // UPI QR Stamp
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(70, 830, 150, 150);
    ctx.strokeStyle = '#CBD5E1';
    ctx.strokeRect(70, 830, 150, 150);

    // Draw stylized QR pattern inside
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(85, 845, 40, 40);
    ctx.fillRect(165, 845, 40, 40);
    ctx.fillRect(85, 925, 40, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(95, 855, 20, 20);
    ctx.fillRect(175, 855, 20, 20);
    ctx.fillRect(95, 935, 20, 20);

    ctx.fillStyle = '#475569';
    ctx.font = '18px monospace';
    ctx.fillText('SCAN TO PAY VIA UPI', 240, 890);
    ctx.fillStyle = '#1D4ED8';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('apextech@okaxis', 240, 920);

    // Authorized Signature
    ctx.fillStyle = '#64748B';
    ctx.font = '18px monospace';
    ctx.fillText('Digitally Signed by Billing Studio Engine', 70, 1530);

    const texture = new THREE.CanvasTexture(c);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.generateMipmaps = true;
    return texture;
  }

  /* ── 4. Build Multi-Layered Deconstructed 3D Rig ── */
  const masterRig = new THREE.Group();
  scene.add(masterRig);

  // Layer 0: Base Glass Plate (Subsurface depth)
  const baseGlassGeo = new THREE.BoxGeometry(5.2, 7.0, 0.12);
  const baseGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xF8FAFC,
    roughness: 0.15,
    metalness: 0.05,
    transmission: 0.2,
    transparent: true,
    opacity: 0.95,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const baseCard = new THREE.Mesh(baseGlassGeo, baseGlassMat);
  masterRig.add(baseCard);

  // Layer 1: High-Res Invoice Face Plane
  const invoiceTex = createInvoiceCanvasTexture();
  const invoiceFaceGeo = new THREE.PlaneGeometry(5.0, 6.8);
  const invoiceFaceMat = new THREE.MeshBasicMaterial({
    map: invoiceTex,
    transparent: true,
    side: THREE.DoubleSide
  });
  const invoiceFace = new THREE.Mesh(invoiceFaceGeo, invoiceFaceMat);
  invoiceFace.position.z = 0.07;
  masterRig.add(invoiceFace);

  // Layer 2: Holographic Tax Breakdown Badge (Detaches in 3D)
  const taxBadgeGroup = new THREE.Group();
  const badgeGeo = new THREE.BoxGeometry(2.4, 1.2, 0.08);
  const badgeMat = new THREE.MeshPhysicalMaterial({
    color: 0x1D4ED8,
    roughness: 0.2,
    metalness: 0.4,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.92
  });
  const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
  taxBadgeGroup.add(badgeMesh);

  // Add subtle edge glow ring to badge
  const badgeEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(badgeGeo),
    new THREE.LineBasicMaterial({ color: 0x93C5FD, linewidth: 2 })
  );
  taxBadgeGroup.add(badgeEdges);
  taxBadgeGroup.position.set(1.8, -1.8, 0.4);
  masterRig.add(taxBadgeGroup);

  // Layer 3: Instant Dispatch WhatsApp Pill (Detaches in 3D)
  const sharePillGroup = new THREE.Group();
  const pillGeo = new THREE.BoxGeometry(2.2, 0.8, 0.08);
  const pillMat = new THREE.MeshPhysicalMaterial({
    color: 0x10B981,
    roughness: 0.25,
    metalness: 0.2,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.94
  });
  const pillMesh = new THREE.Mesh(pillGeo, pillMat);
  sharePillGroup.add(pillMesh);
  sharePillGroup.position.set(-1.8, 2.0, 0.35);
  masterRig.add(sharePillGroup);

  // Layer 4: Orbital Precision Ring Arrays
  const ringGroup = new THREE.Group();
  masterRig.add(ringGroup);

  function createOrbitRing(radius, color, rotX, rotY) {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.75, 0, 2 * Math.PI);
    const pts = curve.getPoints(100).map(p => new THREE.Vector3(p.x, p.y, 0));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 });
    const ring = new THREE.Line(geo, mat);
    ring.rotation.x = rotX;
    ring.rotation.y = rotY;
    return ring;
  }

  const ring1 = createOrbitRing(4.5, 0x2563EB, 0.4, 0.2);
  const ring2 = createOrbitRing(5.2, 0x60A5FA, -0.3, 0.5);
  ringGroup.add(ring1);
  ringGroup.add(ring2);

  /* ── 5. Five Chapter Keyframes with Strict Non-Colliding Coordinates ──
     Step 0 (Hero, Left text):       Rig placed on RIGHT (x: +3.6)
     Step 1 (Catalog, Left text):    Rig placed on RIGHT (x: +3.8, exploded item layer)
     Step 2 (Tax GST, Right text):   Rig placed on LEFT  (x: -3.8, exploded tax badge)
     Step 3 (Share, Left text):      Rig placed on RIGHT (x: +3.8, exploded share pill)
     Step 4 (Radar, Right text):     Rig placed on LEFT  (x: -3.6, full inspection angle)
  ─────────────────────────────────────────────────────────────────────────── */
  const KEYFRAMES = [
    // Step 0: Hero — Right-side perspective floating hero
    {
      x: 3.5, y: 0.0, z: 0.0,
      rx: 0.12, ry: -0.35, rz: 0.04,
      scale: 1.0,
      badgeZ: 0.4, badgeRotY: 0.0,
      pillZ: 0.35,
      camZ: 14.5
    },
    // Step 1: Deconstruct — Right-side exploded tilt
    {
      x: 3.8, y: 0.2, z: 0.5,
      rx: 0.25, ry: -0.55, rz: 0.08,
      scale: 1.05,
      badgeZ: 0.8, badgeRotY: -0.2,
      pillZ: 0.6,
      camZ: 13.8
    },
    // Step 2: Tax Telemetry — Smoothly glides to LEFT SIDE (zero overlap with right text)
    {
      x: -3.8, y: -0.1, z: 0.4,
      rx: -0.15, ry: 0.55, rz: -0.06,
      scale: 1.08,
      badgeZ: 1.6, badgeRotY: 0.4, // Tax badge explodes forward
      pillZ: 0.3,
      camZ: 13.5
    },
    // Step 3: WhatsApp Dispatch — Glides to RIGHT SIDE
    {
      x: 3.8, y: 0.1, z: 0.6,
      rx: 0.18, ry: -0.5, rz: 0.05,
      scale: 1.05,
      badgeZ: 0.5, badgeRotY: 0.0,
      pillZ: 1.8, // Share pill explodes forward
      camZ: 13.8
    },
    // Step 4: Ledger Radar — Glides to LEFT SIDE
    {
      x: -3.6, y: 0.0, z: 0.8,
      rx: 0.05, ry: 0.4, rz: -0.02,
      scale: 1.15,
      badgeZ: 0.9, badgeRotY: 0.2,
      pillZ: 0.9,
      camZ: 13.2
    }
  ];

  /* ── 6. Precision Scroll Interpolator (Hermite Smoothstep) ── */
  let scrollProgress = 0;
  let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;

  function calculateScroll() {
    const track = document.getElementById('product-story');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const totalDist = track.offsetHeight - window.innerHeight;
    const currentScroll = Math.max(0, -rect.top);
    scrollProgress = Math.min(Math.max(currentScroll / totalDist, 0), 1);
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

  function smoothStep(t) {
    return t * t * (3 - 2 * t);
  }

  function interpolateKF(prog) {
    const totalSteps = KEYFRAMES.length - 1;
    const scaled = prog * totalSteps;
    const idx = Math.min(Math.floor(scaled), totalSteps - 1);
    const rawT = scaled - idx;
    const t = smoothStep(rawT);

    const a = KEYFRAMES[idx];
    const b = KEYFRAMES[Math.min(idx + 1, totalSteps)];

    const lerp = (prop) => a[prop] + (b[prop] - a[prop]) * t;

    return {
      x: lerp('x'),
      y: lerp('y'),
      z: lerp('z'),
      rx: lerp('rx'),
      ry: lerp('ry'),
      rz: lerp('rz'),
      scale: lerp('scale'),
      badgeZ: lerp('badgeZ'),
      badgeRotY: lerp('badgeRotY'),
      pillZ: lerp('pillZ'),
      camZ: lerp('camZ'),
    };
  }

  /* ── 7. Render Loop with Kinetic Damping ── */
  const cur = { ...KEYFRAMES[0] };
  const clock = new THREE.Clock();

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    const elapsedTime = clock.getElapsedTime();

    // Mouse Damping (Micro-parallax)
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    // Get interpolated target from scroll
    const target = interpolateKF(scrollProgress);

    // Responsive Mobile Offset (Center on small viewports)
    const isMobile = window.innerWidth < 768;
    const effectiveTargetX = isMobile ? 0 : target.x;
    const effectiveScale = isMobile ? target.scale * 0.75 : target.scale;

    // Smooth Kinetic Damping
    const LERP_SPEED = 0.08;
    cur.x += (effectiveTargetX - cur.x) * LERP_SPEED;
    cur.y += (target.y - cur.y) * LERP_SPEED;
    cur.z += (target.z - cur.z) * LERP_SPEED;
    cur.rx += (target.rx - cur.rx) * LERP_SPEED;
    cur.ry += (target.ry - cur.ry) * LERP_SPEED;
    cur.rz += (target.rz - cur.rz) * LERP_SPEED;
    cur.scale += (effectiveScale - cur.scale) * LERP_SPEED;
    cur.badgeZ += (target.badgeZ - cur.badgeZ) * LERP_SPEED;
    cur.badgeRotY += (target.badgeRotY - cur.badgeRotY) * LERP_SPEED;
    cur.pillZ += (target.pillZ - cur.pillZ) * LERP_SPEED;
    cur.camZ += (target.camZ - cur.camZ) * LERP_SPEED;

    // Apply Position & Micro-tilt
    masterRig.position.set(
      cur.x,
      cur.y + mouseY * 0.15,
      cur.z
    );

    masterRig.rotation.set(
      cur.rx - mouseY * 0.08,
      cur.ry + mouseX * 0.1,
      cur.rz
    );

    masterRig.scale.setScalar(cur.scale);

    // Exploded Sub-layers
    taxBadgeGroup.position.z = cur.badgeZ;
    taxBadgeGroup.rotation.y = cur.badgeRotY;
    sharePillGroup.position.z = cur.pillZ;

    // Subtle idle floating & orbital rotation
    ringGroup.rotation.z = elapsedTime * 0.08;
    baseCard.position.y = Math.sin(elapsedTime * 1.2) * 0.05;
    invoiceFace.position.y = Math.sin(elapsedTime * 1.2) * 0.05;

    camera.position.z = cur.camZ;

    renderer.render(scene, camera);
  }

  renderLoop();
})();
