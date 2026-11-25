import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

const TARGET_COUNT = 4;
const TARGET_Z = -13;
const TARGET_X = [-5.2, -1.75, 1.75, 5.2];
const TARGET_Y = [1.45, 1.75, 1.75, 1.45];

function makeLabelTexture(letter, color) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 128, 128);
  ctx.font = "bold 84px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 8;
  ctx.fillText(letter, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function buildF15EX() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8a919e, metalness: 0.5, roughness: 0.45 });
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xb4b9c4, metalness: 0.45, roughness: 0.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x23262b, metalness: 0.5, roughness: 0.5 });
  const intakeMat = new THREE.MeshStandardMaterial({ color: 0x1c1e23, metalness: 0.4, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc6403a, metalness: 0.3, roughness: 0.5 });

  // Fuselage
  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.14, 1.85, 18), bodyMat);
  fuse.rotation.x = Math.PI / 2;
  g.add(fuse);

  // Radome
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 18), lightMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, -1.17);
  g.add(nose);

  // Canopy
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3a5a8a, metalness: 0.75, roughness: 0.08, transparent: true, opacity: 0.85 })
  );
  canopy.position.set(0, 0.1, -0.44);
  canopy.scale.set(1, 1.85, 0.75);
  g.add(canopy);

  // Large rectangular air intakes (F-15 signature)
  for (const s of [-1, 1]) {
    const intake = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.18, 0.52), intakeMat);
    intake.position.set(s * 0.21, -0.07, -0.52);
    g.add(intake);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.19, 0.07), lightMat);
    lip.position.set(s * 0.21, -0.07, -0.77);
    g.add(lip);
  }

  // Wings + lighter wing tips
  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.05, 0.8), bodyMat);
  wing.position.set(0, -0.03, 0.18);
  g.add(wing);
  for (const s of [-1, 1]) {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.52), lightMat);
    tip.position.set(s * 1.12, -0.03, 0.26);
    g.add(tip);
  }

  // Twin canted vertical stabilizers with red markings + horizontal stabs
  for (const s of [-1, 1]) {
    const stab = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.46, 0.36), bodyMat);
    stab.position.set(s * 0.32, 0.24, 0.62);
    stab.rotation.z = s * 0.16;
    g.add(stab);
    const tipMark = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.13, 0.36), accentMat);
    tipMark.position.set(s * 0.34, 0.42, 0.62);
    tipMark.rotation.z = s * 0.16;
    g.add(tipMark);
    const hStab = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.3), bodyMat);
    hStab.position.set(s * 0.5, 0.02, 0.64);
    g.add(hStab);
  }

  // Centerline fuel tank
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 14), lightMat);
  tank.rotation.x = Math.PI / 2;
  tank.position.set(0, -0.16, 0.05);
  g.add(tank);
  const tankCap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), darkMat);
  tankCap.position.set(0, -0.16, -0.3);
  g.add(tankCap);

  // Under-wing missile loadout: white AIM-120 style on racks + wingtip Sidewinders
  const missileMat = new THREE.MeshStandardMaterial({ color: 0xeef2f6, metalness: 0.3, roughness: 0.5 });
  const tipMat = new THREE.MeshStandardMaterial({ color: 0xc6403a, metalness: 0.3, roughness: 0.5 });
  const finMat = new THREE.MeshStandardMaterial({ color: 0x8a919e, metalness: 0.3, roughness: 0.6 });
  const mounts = [];
  for (const s of [-1, 1]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.18), finMat);
    pylon.position.set(s * 0.62, -0.07, 0.2);
    g.add(pylon);
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.46, 10), missileMat);
      body.rotation.x = Math.PI / 2;
      m.add(body);
      const mNose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.13, 10), tipMat);
      mNose.rotation.x = -Math.PI / 2;
      mNose.position.set(0, 0, -0.29);
      m.add(mNose);
      for (const f of [-1, 1]) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.08, 0.08), finMat);
        fin.position.set(f * 0.05, 0, 0.16);
        m.add(fin);
      }
      m.position.set(s * (0.62 + (k - 1) * 0.12), -0.13, 0.2);
      g.add(m);
      mounts.push(m);
    }
    const w = new THREE.Group();
    const wb = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 10), missileMat);
    wb.rotation.x = Math.PI / 2;
    w.add(wb);
    const wn = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 10), tipMat);
    wn.rotation.x = -Math.PI / 2;
    wn.position.set(0, 0, -0.25);
    w.add(wn);
    for (const f of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.07, 0.07), finMat);
      fin.position.set(f * 0.045, 0, 0.14);
      w.add(fin);
    }
    w.position.set(s * 1.05, -0.06, 0.2);
    g.add(w);
    mounts.push(w);
  }
  g.userData.missiles = mounts;

  // Twin engine nozzles with afterburner glow
  const glows = [];
  for (const s of [-1, 1]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.32, 12), darkMat);
    eng.rotation.x = Math.PI / 2;
    eng.position.set(s * 0.19, -0.03, 1.0);
    g.add(eng);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.1, 12), lightMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(s * 0.19, -0.03, 1.18);
    g.add(nozzle);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0x99ddff }));
    glow.position.set(s * 0.19, -0.03, 1.26);
    g.add(glow);
    glows.push(glow);
  }
  g.userData.glows = glows;
  g.scale.setScalar(0.85);
  return g;
}

function buildSu30() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x56657a, metalness: 0.45, roughness: 0.45 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b3644, metalness: 0.5, roughness: 0.4 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xc6403a, metalness: 0.3, roughness: 0.5 });

  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 1.8, 14), bodyMat);
  fuse.rotation.x = Math.PI / 2;
  g.add(fuse);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.46, 14), bodyMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, -1.13);
  g.add(nose);

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x3a6fa5, metalness: 0.7, roughness: 0.1, transparent: true, opacity: 0.85 })
  );
  canopy.position.set(0, 0.1, -0.4);
  canopy.scale.set(1, 1.7, 0.7);
  g.add(canopy);

  for (const s of [-1, 1]) {
    const canard = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.22), bodyMat);
    canard.position.set(s * 0.3, 0.02, -0.56);
    canard.rotation.y = s * 0.25;
    g.add(canard);
  }

  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.86), bodyMat);
  wing.position.set(0, -0.02, 0.2);
  g.add(wing);

  for (const s of [-1, 1]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.36), bodyMat);
    tail.position.set(s * 0.3, 0.25, 0.64);
    tail.rotation.z = s * 0.26;
    g.add(tail);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.14, 0.32), accentMat);
    tip.position.set(s * 0.3, 0.44, 0.64);
    g.add(tip);
    const stab = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.3), bodyMat);
    stab.position.set(s * 0.5, 0, 0.66);
    g.add(stab);
  }

  for (const s of [-1, 1]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 10), darkMat);
    eng.rotation.x = Math.PI / 2;
    eng.position.set(s * 0.2, -0.02, 1.04);
    g.add(eng);
  }
  g.scale.setScalar(0.78);
  return g;
}

const Game3DScene = forwardRef(function Game3DScene(_props, ref) {
  const mountRef = useRef(null);
  const apiRef = useRef({});

  useImperativeHandle(
    ref,
    () => ({
      fireAt: (i, correct) => apiRef.current.fireAt && apiRef.current.fireAt(i, correct),
      reset: () => apiRef.current.reset && apiRef.current.reset(),
      shake: () => apiRef.current.shake && apiRef.current.shake(),
      lockOn: (i) => apiRef.current.lockOn && apiRef.current.lockOn(i),
      enemyAttack: (i) => apiRef.current.enemyAttack && apiRef.current.enemyAttack(i),
      resetView: () => apiRef.current.resetView && apiRef.current.resetView(),
    }),
    []
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let width = mount.clientWidth || 600;
    let height = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a1a30, 26, 72);

    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = 16;
    bgCanvas.height = 256;
    const bctx = bgCanvas.getContext("2d");
    const grad = bctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#173474");
    grad.addColorStop(0.55, "#2c5d96");
    grad.addColorStop(1, "#08121f");
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, 16, 256);
    scene.background = new THREE.CanvasTexture(bgCanvas);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 120);
    camera.position.set(0, 1.35, 5.4);
    camera.lookAt(0, 0.5, -8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";

    // Free orbit camera state + drag handling (全方位视角)
    let orbitTheta = 0;
    let orbitPhi = 0.08;
    const orbitR = 9.5;
    const orbitCenter = new THREE.Vector3(0, 0.6, -4);
    let cameraCue = null;
    let dragging = false;
    let lastPX = 0;
    let lastPY = 0;
    const onPointerDown = (e) => {
      dragging = true;
      lastPX = e.clientX;
      lastPY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      orbitTheta += (e.clientX - lastPX) * 0.005;
      orbitPhi = Math.max(-0.32, Math.min(0.72, orbitPhi - (e.clientY - lastPY) * 0.004));
      lastPX = e.clientX;
      lastPY = e.clientY;
    };
    const onPointerUp = () => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    scene.add(new THREE.AmbientLight(0x88aaff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    // Player F-15EX (centered, clearly visible)
    const jet = buildF15EX();
    jet.position.set(0, 0.35, 1.4);
    scene.add(jet);

    // Muzzle flash at the nose (additive glow)
    const muzzle = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 14, 14),
      new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    muzzle.position.set(0, 0.02, -1.25);
    jet.add(muzzle);
    jet.userData.muzzle = muzzle;

    // 3D lock-on bracket (stationary, on the target) + aiming diamond (moves to overlap)
    const bracketTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d");
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      const m = 16, l = 34;
      ctx.beginPath();
      ctx.moveTo(m, m + l); ctx.lineTo(m, m); ctx.lineTo(m + l, m);
      ctx.moveTo(128 - m - l, m); ctx.lineTo(128 - m, m); ctx.lineTo(128 - m, m + l);
      ctx.moveTo(128 - m, 128 - m - l); ctx.lineTo(128 - m, 128 - m); ctx.lineTo(128 - m - l, 128 - m);
      ctx.moveTo(m + l, 128 - m); ctx.lineTo(m, 128 - m); ctx.lineTo(m, 128 - m - l);
      ctx.stroke();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    })();
    const diamondTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d");
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(64, 10); ctx.lineTo(118, 64); ctx.lineTo(64, 118); ctx.lineTo(10, 64); ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.arc(64, 64, 4, 0, Math.PI * 2); ctx.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    })();
    const lockReticle = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: bracketTex, color: 0x34d399, transparent: true, depthTest: false, opacity: 0 })
    );
    lockReticle.scale.set(0.5, 0.5, 1);
    lockReticle.visible = false;
    lockReticle.renderOrder = 5;
    scene.add(lockReticle);
    const aimReticle = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: diamondTex, color: 0x34d399, transparent: true, depthTest: false, opacity: 0 })
    );
    aimReticle.scale.set(0.5, 0.5, 1);
    aimReticle.visible = false;
    aimReticle.renderOrder = 6;
    scene.add(aimReticle);

    // aim animation state
    let aimActive = false;
    let aimT = 0;
    const aimDur = 0.34;
    let overlapped = false;
    const aimStart = new THREE.Vector3();
    const aimEnd = new THREE.Vector3();

    // Smooth banking / pitch state for the player jet
    const jetTarget = { roll: 0, pitch: -0.08, yaw: 0 };
    const jetState = { roll: 0, pitch: -0.08, yaw: 0 };
    let recoil = 0;
    let missileIndex = 0;

    // Enemy SU-30 targets
    const targets = [];
    for (let i = 0; i < TARGET_COUNT; i++) {
      const g = buildSu30();
      g.rotation.y = 0; // 看前：nose points away from the player (-z)
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: makeLabelTexture(String.fromCharCode(65 + i), "#ffd9a0"), transparent: true })
      );
      sprite.position.set(0, 1.0, 0);
      sprite.scale.set(0.9, 0.9, 0.9);
      g.add(sprite);
      g.position.set(TARGET_X[i], TARGET_Y[i], TARGET_Z);
      g.userData = { baseY: TARGET_Y[i], alive: true, spin: 0.25 + i * 0.04, bob: i * 0.7 };
      targets.push(g);
      scene.add(g);
    }

    // Streaming starfield
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 46;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      starPos[i * 3 + 2] = -Math.random() * 46 - 2;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbbddff, size: 0.09, transparent: true, opacity: 0.85 }));
    scene.add(stars);

    // Alpine mountain range (scrolls toward the player for a forward-flight feel)
    const mountains = new THREE.Group();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x2a3a52, roughness: 0.95, flatShading: true });
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xe4eef7, roughness: 0.6, flatShading: true });
    const rockMat2 = new THREE.MeshStandardMaterial({ color: 0x1f2c40, roughness: 0.95, flatShading: true });
    const peaks = [];
    function addPeak(x, z, h, mat, speed, farH) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(3.5 + Math.random() * 3, h, 5), mat);
      cone.position.set(x, h / 2 - 9, z);
      cone.rotation.y = Math.random() * Math.PI;
      mountains.add(cone);
      const snow = new THREE.Mesh(new THREE.ConeGeometry(1.3, h * 0.32, 5), snowMat);
      snow.position.set(x, h - 9 - h * 0.12, z);
      mountains.add(snow);
      peaks.push({ cone, snow, speed, farH });
    }
    const sideX = () => (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 22);
    for (let i = 0; i < 20; i++) {
      const x = sideX();
      addPeak(x, -40 + (Math.random() - 0.5) * 8, 9 + Math.random() * 9, rockMat, 7, 9 + Math.random() * 9);
    }
    for (let i = 0; i < 12; i++) {
      const x = sideX();
      addPeak(x, -24 + (Math.random() - 0.5) * 6, 6 + Math.random() * 6, rockMat2, 11, 6 + Math.random() * 6);
    }
    scene.add(mountains);

    // Speed streaks (motion lines)
    const streakCount = 140;
    const streakGeo = new THREE.BufferGeometry();
    const sPos = new Float32Array(streakCount * 6);
    const sVel = new Float32Array(streakCount);
    for (let i = 0; i < streakCount; i++) {
      const x = (Math.random() - 0.5) * 46;
      const y = (Math.random() - 0.5) * 22 + 1;
      const z = -Math.random() * 46 - 2;
      const len = 1.2 + Math.random() * 1.8;
      sPos[i * 6] = x;
      sPos[i * 6 + 1] = y;
      sPos[i * 6 + 2] = z;
      sPos[i * 6 + 3] = x;
      sPos[i * 6 + 4] = y;
      sPos[i * 6 + 5] = z - len;
      sVel[i] = 26 + Math.random() * 30;
    }
    streakGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const streaks = new THREE.LineSegments(
      streakGeo,
      new THREE.LineBasicMaterial({ color: 0xaad6ff, transparent: true, opacity: 0.55 })
    );
    scene.add(streaks);

    const projectiles = [];
    const explosions = [];
    let shakeAmt = 0;

    // --- shared VFX textures & scratch (built once, reused by every explosion & missile) ---
    function makeRadialTex(inner, outer, size = 64) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, inner);
      g.addColorStop(1, outer);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }
    function makeRingTex(size = 128) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = size * 0.1;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size * 0.36, 0, Math.PI * 2);
      ctx.stroke();
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }
    const vfxGlowTex = makeRadialTex("rgba(255,255,255,1)", "rgba(255,255,255,0)");
    const vfxSmokeTex = makeRadialTex("rgba(220,226,232,1)", "rgba(220,226,232,0)");
    const vfxRingTex = makeRingTex();
    const _grav = new THREE.Vector3(0, -0.0009, 0);

    function explode(pos, correct) {
      const exp = new THREE.Group();
      const flashColor = correct ? 0x66ff88 : 0xff5a3c;
      const sparkColor = correct ? 0xc8ffd8 : 0xffd06a;
      // bright white core flash (additive)
      const flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
      );
      exp.add(flash);
      // large soft colored glow halo
      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: vfxGlowTex, color: flashColor, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      glow.scale.setScalar(1.4);
      exp.add(glow);
      // shockwave ring (billboard sprite that expands & thins)
      const ring = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: vfxRingTex, color: 0xffffff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      ring.scale.setScalar(0.5);
      exp.add(ring);
      // hot sparks: fast, gravity, additive
      const pcount = 40;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pcount * 3);
      const pVel = [];
      for (let i = 0; i < pcount; i++) {
        pPos[i * 3] = pos.x;
        pPos[i * 3 + 1] = pos.y;
        pPos[i * 3 + 2] = pos.z;
        pVel.push(
          new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
            .normalize()
            .multiplyScalar(0.04 + Math.random() * 0.12)
        );
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pts = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: sparkColor, size: 0.16, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      exp.add(pts);
      // smoke puffs: slow, drift up, fade late, textured
      const scount = 22;
      const sGeo = new THREE.BufferGeometry();
      const sPos = new Float32Array(scount * 3);
      const sVel = [];
      for (let i = 0; i < scount; i++) {
        sPos[i * 3] = pos.x + (Math.random() - 0.5) * 0.2;
        sPos[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 0.2;
        sPos[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.2;
        sVel.push(new THREE.Vector3((Math.random() - 0.5) * 0.03, 0.02 + Math.random() * 0.04, (Math.random() - 0.5) * 0.03));
      }
      sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
      const smoke = new THREE.Points(
        sGeo,
        new THREE.PointsMaterial({ map: vfxSmokeTex, color: 0xb8c0c8, size: 0.5, transparent: true, opacity: 0.6, depthWrite: false })
      );
      exp.add(smoke);
      exp.userData = { flash, glow, ring, pts, pVel, smoke, sVel, life: 0, max: 0.95 };
      scene.add(exp);
      explosions.push(exp);
    }

    // Shared, reusable missile resources — created once, never per shot
    const missileBodyGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    const missileBodyMat = new THREE.MeshStandardMaterial({ color: 0xe8eef5, metalness: 0.4, roughness: 0.5 });
    const missileNoseGeo = new THREE.ConeGeometry(0.05, 0.16, 8);
    const missileNoseMat = new THREE.MeshStandardMaterial({ color: 0xc6403a, metalness: 0.3, roughness: 0.5 });
    const finGeo = new THREE.BoxGeometry(0.02, 0.12, 0.12);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x9aa6b3, metalness: 0.3, roughness: 0.6 });
    const exhaustGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const exhaustMat = new THREE.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending });
    const exhaustGlowMat = new THREE.SpriteMaterial({ map: vfxGlowTex, color: 0xffb060, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const trailMat = new THREE.LineBasicMaterial({ color: 0xffd49a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const launchFlash = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    );
    launchFlash.visible = false;
    scene.add(launchFlash);
    const sharedMissileResources = [
      missileBodyGeo, missileBodyMat, missileNoseGeo, missileNoseMat,
      finGeo, finMat, exhaustGeo, exhaustMat, exhaustGlowMat, trailMat, launchFlash.geometry, launchFlash.material,
      vfxGlowTex, vfxSmokeTex, vfxRingTex,
    ];
    // scratch vectors to avoid per-frame allocations
    const _dir = new THREE.Vector3();
    const _fwd = new THREE.Vector3(0, 0, -1);

    // Mountain avoidance: returns a lateral + vertical push away from any peak near pos
    function computeAvoid(px, py, pz) {
      let ax = 0, ay = 0;
      for (let i = 0; i < peaks.length; i++) {
        const p = peaks[i].cone.position;
        const dz = p.z - pz;
        if (dz < -3 || dz > 8) continue; // only peaks ahead or just passing
        const dx = p.x - px;
        const adx = Math.abs(dx);
        if (adx > 9) continue;
        const w = (1 - Math.min(1, Math.abs(dz) / 7)) * (1 - adx / 9);
        if (w <= 0) continue;
        ax += -Math.sign(dx || (i % 2 ? 1 : -1)) * w * 2.6; // push away horizontally (no climb)
      }
      return { ax, ay };
    }

    function fireAt(i, correct) {
      const t = targets[i];
      if (!t || !t.userData.alive) return;
      lockReticle.visible = false;
      aimReticle.visible = false;
      aimActive = false;

      // The airframe holds steady — only a subtle glance toward the target
      const dx = t.position.x - jet.position.x;
      const dy = t.position.y - jet.position.y;
      jetTarget.yaw = Math.sign(dx) * Math.min(0.12, Math.abs(dx) * 0.04);
      jetTarget.pitch = -0.08 + Math.min(0.06, Math.abs(dy) * 0.05) * Math.sign(dy);

      // Muzzle flash at the nose
      muzzle.material.opacity = 1;
      muzzle.scale.setScalar(1.1);
      (jet.userData.glows || []).forEach((gl) => gl.scale.setScalar(1.5));

      // Launch a missile from a wing pylon (cycle through mounts)
      const mounts = jet.userData.missiles || [];
      const mount = mounts[missileIndex % Math.max(1, mounts.length)] || null;
      missileIndex++;
      const start = new THREE.Vector3();
      if (mount) mount.getWorldPosition(start);
      else { start.copy(jet.position); start.y += 0.1; start.z -= 1.0; }

      // Reusable ignition flash at the pylon (no per-shot allocation)
      launchFlash.position.copy(start);
      launchFlash.material.opacity = 1;
      launchFlash.scale.setScalar(0.6);
      launchFlash.visible = true;

      const end = t.position.clone();

      // Missile body reusing shared geometry + material (per-instance transform only)
      const missile = new THREE.Group();
      const mBody = new THREE.Mesh(missileBodyGeo, missileBodyMat);
      mBody.rotation.x = Math.PI / 2;
      missile.add(mBody);
      const mNose = new THREE.Mesh(missileNoseGeo, missileNoseMat);
      mNose.rotation.x = -Math.PI / 2;
      mNose.position.set(0, 0, -0.33);
      missile.add(mNose);
      for (const s of [-1, 1]) {
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(s * 0.06, 0, 0.2);
        missile.add(fin);
      }
      const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
      exhaust.position.set(0, 0, 0.28);
      exhaust.scale.setScalar(0.1); // dim during the drop phase
      missile.add(exhaust);
      missile.userData.exhaust = exhaust;
      // additive tail glow billboard
      const tailGlow = new THREE.Sprite(exhaustGlowMat);
      tailGlow.position.set(0, 0, 0.32);
      tailGlow.scale.setScalar(0.5);
      missile.add(tailGlow);
      missile.userData.tailGlow = tailGlow;

      // Release orientation matches the jet; it re-orients toward the target on ignition
      missile.position.copy(start);
      missile.quaternion.copy(jet.quaternion);
      scene.add(missile);

      const trailLen = 16;
      const trailPos = new Float32Array(trailLen * 3);
      for (let k = 0; k < trailLen; k++) {
        trailPos[k * 3] = start.x;
        trailPos[k * 3 + 1] = start.y;
        trailPos[k * 3 + 2] = start.z;
      }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
      const trail = new THREE.Line(trailGeo, trailMat);
      trail.visible = false; // hidden until ignition
      scene.add(trail);

      projectiles.push({
        bullet: missile, trail, trailGeo, trailLen, end, correct, target: t, index: i,
        speed: 42 + Math.random() * 8,
        birth: clock.elapsedTime,
        dropDur: 0.14,
        ignited: false,
        dropDir: new THREE.Vector3(0, -0.6, 0.8).normalize(),
      });
    }

    function enemyFire(from) {
      const end = jet.position.clone();
      const missile = new THREE.Group();
      const mBody = new THREE.Mesh(missileBodyGeo, missileBodyMat);
      mBody.rotation.x = Math.PI / 2;
      missile.add(mBody);
      const mNose = new THREE.Mesh(missileNoseGeo, missileNoseMat);
      mNose.rotation.x = -Math.PI / 2;
      mNose.position.set(0, 0, -0.33);
      missile.add(mNose);
      for (const s of [-1, 1]) {
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(s * 0.06, 0, 0.2);
        missile.add(fin);
      }
      const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
      exhaust.position.set(0, 0, 0.28);
      missile.add(exhaust);
      missile.userData.exhaust = exhaust;
      const tailGlow = new THREE.Sprite(exhaustGlowMat);
      tailGlow.position.set(0, 0, 0.32);
      tailGlow.scale.setScalar(0.5);
      missile.add(tailGlow);
      missile.userData.tailGlow = tailGlow;
      _dir.copy(end).sub(from).normalize();
      missile.quaternion.setFromUnitVectors(_fwd, _dir);
      missile.position.copy(from);
      scene.add(missile);
      const trailLen = 14;
      const trailPos = new Float32Array(trailLen * 3);
      for (let k = 0; k < trailLen; k++) {
        trailPos[k * 3] = from.x;
        trailPos[k * 3 + 1] = from.y;
        trailPos[k * 3 + 2] = from.z;
      }
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
      const trail = new THREE.Line(trailGeo, trailMat);
      scene.add(trail);
      projectiles.push({
        bullet: missile, trail, trailGeo, trailLen, end, correct: false, target: null, index: -1,
        speed: 14 + Math.random() * 4, birth: clock.elapsedTime, ignited: true, dropDur: 0, dropDir: new THREE.Vector3(),
      });
    }

    function enemyAttack(i) {
      const t = targets[i];
      if (!t || !t.userData.alive) return;
      const start = t.position.clone();
      const behind = new THREE.Vector3(jet.position.x * 0.4, 1.4, 15);
      const base = new THREE.Vector3(TARGET_X[i], TARGET_Y[i], TARGET_Z);
      // C-shape arc control points: swoop up and out to one side, like a real fighter turn
      const diveCtrl = start.clone().lerp(behind, 0.5);
      diveCtrl.y += 2.8;
      diveCtrl.x += 3.5;
      const returnCtrl = behind.clone().lerp(base, 0.5);
      returnCtrl.y += 2.4;
      returnCtrl.x += 3.5;
      t.userData.attack = {
        phase: "dive",
        t0: clock.elapsedTime,
        diveDur: 1.2,
        returnDur: 1.2,
        startPos: start,
        behindPos: behind,
        base,
        diveCtrl,
        returnCtrl,
      };
      // Cinematic rear close-up on the attacking enemy
      cameraCue = {
        t0: clock.elapsedTime,
        dur: 3,
        pos: new THREE.Vector3(behind.x, behind.y + 0.5, behind.z + 2.6),
        look: behind.clone(),
      };
    }

    function reset() {
      cameraCue = null;
      projectiles.forEach((p) => {
        scene.remove(p.bullet);
        scene.remove(p.trail);
        p.trailGeo.dispose();
      });
      projectiles.length = 0;
      launchFlash.visible = false;
      launchFlash.material.opacity = 0;
      jetTarget.roll = 0;
      jetTarget.pitch = -0.08;
      jetTarget.yaw = 0;
      recoil = 0;
      muzzle.material.opacity = 0;
      lockReticle.visible = false;
      lockReticle.material.opacity = 0;
      lockReticle.material.color.setHex(0x34d399);
      lockReticle.scale.set(0.5, 0.5, 1);
      aimReticle.visible = false;
      aimReticle.material.opacity = 0;
      aimReticle.material.color.setHex(0x34d399);
      aimActive = false;
      overlapped = false;
      explosions.forEach((e) => scene.remove(e));
      explosions.length = 0;
      targets.forEach((t, idx) => {
        t.visible = true;
        t.userData.alive = true;
        t.userData.attack = null;
        t.position.set(TARGET_X[idx], TARGET_Y[idx], TARGET_Z);
      });
    }

    function shake() {
      shakeAmt = 0.45;
    }

    function resetView() {
      orbitTheta = 0;
      orbitPhi = 0.08;
      cameraCue = null;
    }

    function lockOn(i) {
      const t = targets[i];
      if (!t) return;
      lockReticle.userData = { target: t };
      lockReticle.visible = true;
      lockReticle.material.opacity = 0;
      lockReticle.material.color.setHex(0x34d399);
      lockReticle.scale.set(0.5, 0.5, 1);
      aimStart.set(jet.position.x, jet.position.y, jet.position.z - 0.6);
      aimEnd.copy(t.position);
      aimReticle.position.copy(aimStart);
      aimReticle.visible = true;
      aimReticle.material.opacity = 0;
      aimReticle.material.color.setHex(0x34d399);
      aimReticle.scale.set(0.5, 0.5, 1);
      aimActive = true;
      aimT = 0;
      overlapped = false;
    }

    apiRef.current = { fireAt, reset, shake, lockOn, enemyAttack, resetView };

    let raf;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      // Smoothly ease the jet toward the target bank, then relax back to neutral
      const ease = 1 - Math.pow(0.0015, dt);
      jetState.roll += (jetTarget.roll - jetState.roll) * ease;
      jetState.pitch += (jetTarget.pitch - jetState.pitch) * ease;
      jetState.yaw += (jetTarget.yaw - jetState.yaw) * ease;
      jetTarget.roll += (0 - jetTarget.roll) * (1 - Math.pow(0.2, dt));
      jetTarget.pitch += (-0.08 - jetTarget.pitch) * (1 - Math.pow(0.2, dt));
      jetTarget.yaw += (0 - jetTarget.yaw) * (1 - Math.pow(0.2, dt));

      // Recoil pushes the jet back, then settles
      recoil *= Math.pow(0.02, dt);

      const pjAv = computeAvoid(0, 0.35, jet.position.z);
      jet.position.x = pjAv.ax * 0.5; // lateral dodge only, no climb
      jet.position.y = 0.35 + Math.sin(t * 1.5) * 0.05;
      jet.position.z = 1.4 + recoil;
      jet.rotation.z = jetState.roll + Math.sin(t * 0.8) * 0.03 + pjAv.ax * 0.05;
      jet.rotation.x = jetState.pitch + Math.sin(t * 1.2) * 0.015;
      jet.rotation.y = jetState.yaw;
      (jet.userData.glows || []).forEach((gl) => gl.scale.setScalar(1 + Math.sin(t * 18) * 0.2));

      // Fade the muzzle flash
      muzzle.material.opacity = Math.max(0, muzzle.material.opacity - dt * 7);
      muzzle.scale.setScalar(1.1 + (1 - muzzle.material.opacity) * 0.6);

      // Fade the reusable launch flash
      if (launchFlash.visible) {
        launchFlash.material.opacity = Math.max(0, launchFlash.material.opacity - dt * 6);
        launchFlash.scale.setScalar(0.6 + (1 - launchFlash.material.opacity) * 1.4);
        if (launchFlash.material.opacity <= 0) launchFlash.visible = false;
      }

      // Lock-on bracket: stationary on the target (fade in only)
      if (lockReticle.visible) {
        const tg = lockReticle.userData.target;
        if (tg && tg.userData.alive) lockReticle.position.copy(tg.position);
        lockReticle.material.opacity = Math.min(1, lockReticle.material.opacity + dt * 8);
      }
      // Aiming diamond: moves from the player to overlap the lock bracket, then both turn red
      if (aimActive) {
        aimT += dt / aimDur;
        const k = Math.min(1, aimT);
        const e = 1 - Math.pow(1 - k, 2);
        aimReticle.position.lerpVectors(aimStart, aimEnd, e);
        aimReticle.material.opacity = Math.min(1, aimReticle.material.opacity + dt * 8);
        if (k >= 1 && !overlapped) {
          overlapped = true;
          lockReticle.material.color.setHex(0xff3030);
          aimReticle.material.color.setHex(0xff3030);
        }
      }

      const sp = starGeo.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        sp[i * 3 + 2] += dt * 22;
        if (sp[i * 3 + 2] > 8) sp[i * 3 + 2] -= 48;
      }
      starGeo.attributes.position.needsUpdate = true;

      peaks.forEach((p) => {
        const nz = p.cone.position.z + dt * p.speed;
        if (nz > 14) {
          const nx = (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 22);
          const h = p.farH;
          p.cone.position.set(nx, h / 2 - 9, -48 - Math.random() * 6);
          p.cone.rotation.y = Math.random() * Math.PI;
          p.snow.position.set(nx, h - 9 - h * 0.12, p.cone.position.z);
        } else {
          p.cone.position.z = nz;
          p.snow.position.z = nz;
        }
      });

      const stp = streakGeo.attributes.position.array;
      for (let i = 0; i < streakCount; i++) {
        const nz = stp[i * 6 + 2] + dt * sVel[i];
        const nl = stp[i * 6 + 5] - stp[i * 6 + 2];
        stp[i * 6 + 2] = nz;
        stp[i * 6 + 5] = nz + nl;
        if (nz > 9) {
          const x = (Math.random() - 0.5) * 46;
          const y = (Math.random() - 0.5) * 22 + 1;
          const z = -46 - Math.random() * 6;
          const len = 1.2 + Math.random() * 1.8;
          stp[i * 6] = x;
          stp[i * 6 + 1] = y;
          stp[i * 6 + 2] = z;
          stp[i * 6 + 3] = x;
          stp[i * 6 + 4] = y;
          stp[i * 6 + 5] = z - len;
          sVel[i] = 26 + Math.random() * 30;
        }
      }
      streakGeo.attributes.position.needsUpdate = true;

      targets.forEach((tg, i) => {
        if (!tg.userData.alive) return;
        const atk = tg.userData.attack;
        if (atk && atk.phase) {
          // Enemy attack run: dive behind the player → fire → return to base
          const a = t - atk.t0;
          if (atk.phase === "dive") {
            const k = Math.min(1, a / atk.diveDur);
            const e = k * k * (3 - 2 * k); // smoothstep — smoother in/out
            const u = 1 - e;
            const s = atk.startPos, c = atk.diveCtrl, b = atk.behindPos;
            tg.position.set(
              u * u * s.x + 2 * u * e * c.x + e * e * b.x,
              u * u * s.y + 2 * u * e * c.y + e * e * b.y,
              u * u * s.z + 2 * u * e * c.z + e * e * b.z
            );
            tg.rotation.z = -0.4 * Math.sin(Math.min(1, k) * Math.PI); // bank into the turn, level at ends
            if (k >= 1) { atk.phase = "fire"; atk.t0 = t; enemyFire(tg.position); }
          } else if (atk.phase === "fire") {
            tg.position.copy(atk.behindPos);
            tg.rotation.z = -0.2;
            if (a > 0.6) { atk.phase = "return"; atk.t0 = t; atk.startPos = tg.position.clone(); }
          } else if (atk.phase === "return") {
            const k = Math.min(1, a / atk.returnDur);
            const e = k * k * (3 - 2 * k); // smoothstep — smoother in/out
            const u = 1 - e;
            const s = atk.startPos, c = atk.returnCtrl, b = atk.base;
            tg.position.set(
              u * u * s.x + 2 * u * e * c.x + e * e * b.x,
              u * u * s.y + 2 * u * e * c.y + e * e * b.y,
              u * u * s.z + 2 * u * e * c.z + e * e * b.z
            );
            tg.rotation.z = -0.3 * Math.sin(Math.min(1, k) * Math.PI);
            if (k >= 1) { tg.position.copy(atk.base); atk.phase = null; }
          }
          tg.rotation.y = Math.sin(t * 0.5 + i) * 0.08; // stays 看前 (-z)
        } else {
          const av = computeAvoid(TARGET_X[i], tg.userData.baseY, TARGET_Z);
          tg.position.x = TARGET_X[i] + av.ax;
          tg.position.y = tg.userData.baseY + Math.sin(t * 1.4 + tg.userData.bob) * 0.22;
          tg.rotation.roll = (tg.rotation.roll || 0) + dt * tg.userData.spin;
          tg.rotation.z = Math.sin(t * 0.6 + i) * 0.08 + av.ax * 0.14;
          tg.rotation.y = Math.sin(t * 0.5 + i) * 0.08;
        }
      });

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const age = t - p.birth;
        // --- drop phase: missile falls away from the pylon before ignition ---
        if (!p.ignited) {
          if (age < p.dropDur) {
            p.bullet.position.addScaledVector(p.dropDir, 2.4 * dt);
            if (p.bullet.userData.exhaust) p.bullet.userData.exhaust.scale.setScalar(0.1 + (age / p.dropDur) * 0.3);
            continue;
          }
          // ignition: exhaust flares, trail ignites, re-orient toward target
          p.ignited = true;
          if (p.bullet.userData.exhaust) p.bullet.userData.exhaust.scale.setScalar(1);
          p.trail.visible = true;
        }
        // --- cruise / homing phase ---
        _dir.copy(p.end).sub(p.bullet.position);
        const dist = _dir.length();
        if (dist < 0.45) {
          explode(p.end, p.correct);
          if (p.correct && p.target) {
            p.target.visible = false;
            p.target.userData.alive = false;
          } else {
            shake();
          }
          scene.remove(p.bullet);
          scene.remove(p.trail);
          p.trailGeo.dispose();
          projectiles.splice(i, 1);
        } else {
          _dir.normalize();
          p.bullet.position.addScaledVector(_dir, Math.max(0.4, p.speed * dt));
          p.bullet.quaternion.setFromUnitVectors(_fwd, _dir);
          if (p.bullet.userData.exhaust) p.bullet.userData.exhaust.scale.setScalar(1 + Math.sin(t * 40) * 0.35);
          if (p.bullet.userData.tailGlow) p.bullet.userData.tailGlow.scale.setScalar(0.5 + Math.sin(t * 40) * 0.18);
          // Update the trail: shift older points, push current
          const arr = p.trail.geometry.attributes.position.array;
          for (let k = p.trailLen - 1; k > 0; k--) {
            arr[k * 3] = arr[(k - 1) * 3];
            arr[k * 3 + 1] = arr[(k - 1) * 3 + 1];
            arr[k * 3 + 2] = arr[(k - 1) * 3 + 2];
          }
          arr[0] = p.bullet.position.x;
          arr[1] = p.bullet.position.y;
          arr[2] = p.bullet.position.z;
          p.trail.geometry.attributes.position.needsUpdate = true;
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        const u = e.userData;
        u.life += dt;
        const k = u.life / u.max;
        // core flash: quick bright pop then fast fade
        u.flash.scale.setScalar(1 + k * 3.4);
        u.flash.material.opacity = Math.max(0, 0.95 * Math.pow(1 - k, 1.6));
        // soft glow halo: swells then fades
        u.glow.scale.setScalar(1.4 + k * 4.5);
        u.glow.material.opacity = Math.max(0, 0.9 * (1 - k));
        // shockwave ring: expands fast, thins out
        u.ring.scale.setScalar(0.5 + k * 6.5);
        u.ring.material.opacity = Math.max(0, 0.85 * Math.pow(1 - k, 1.4));
        // sparks: fly out + gravity + fade
        const pp = u.pts.geometry.attributes.position.array;
        u.pVel.forEach((v, j) => {
          v.add(_grav);
          pp[j * 3] += v.x;
          pp[j * 3 + 1] += v.y;
          pp[j * 3 + 2] += v.z;
        });
        u.pts.geometry.attributes.position.needsUpdate = true;
        u.pts.material.opacity = Math.max(0, 1 - k * 1.15);
        // smoke: drift up, expand, fade late
        const sp = u.smoke.geometry.attributes.position.array;
        u.sVel.forEach((v, j) => {
          sp[j * 3] += v.x;
          sp[j * 3 + 1] += v.y;
          sp[j * 3 + 2] += v.z;
        });
        u.smoke.geometry.attributes.position.needsUpdate = true;
        u.smoke.material.opacity = Math.max(0, 0.55 * (1 - k));
        u.smoke.scale.setScalar(1 + k * 1.6);
        if (u.life >= u.max) {
          scene.remove(e);
          explosions.splice(i, 1);
        }
      }

      // Free orbit camera + cinematic cue on enemy attack + shake
      const ox = orbitR * Math.cos(orbitPhi) * Math.sin(orbitTheta);
      const oy = orbitR * Math.sin(orbitPhi);
      const oz = orbitR * Math.cos(orbitPhi) * Math.cos(orbitTheta);
      let desX = ox;
      let desY = orbitCenter.y + oy;
      let desZ = orbitCenter.z + oz;
      let lookX = orbitCenter.x;
      let lookY = orbitCenter.y;
      let lookZ = orbitCenter.z;
      if (cameraCue) {
        const a = t - cameraCue.t0;
        const k = Math.min(1, a / cameraCue.dur);
        let blend;
        if (k < 0.3) blend = k / 0.3;
        else if (k > 0.75) blend = Math.max(0, (1 - k) / 0.25);
        else blend = 1;
        desX = desX * (1 - blend) + cameraCue.pos.x * blend;
        desY = desY * (1 - blend) + cameraCue.pos.y * blend;
        desZ = desZ * (1 - blend) + cameraCue.pos.z * blend;
        lookX = lookX * (1 - blend) + cameraCue.look.x * blend;
        lookY = lookY * (1 - blend) + cameraCue.look.y * blend;
        lookZ = lookZ * (1 - blend) + cameraCue.look.z * blend;
        if (k >= 1) cameraCue = null;
      }
      const swayX = Math.sin(t * 0.5) * 0.05;
      const swayY = Math.sin(t * 0.72) * 0.04;
      let sx = 0;
      let sy = 0;
      if (shakeAmt > 0.01) {
        sx = (Math.random() - 0.5) * shakeAmt;
        sy = (Math.random() - 0.5) * shakeAmt;
        shakeAmt *= Math.pow(0.02, dt);
      } else {
        shakeAmt = 0;
      }
      camera.position.set(desX + swayX + sx, desY + swayY + sy, desZ);
      camera.lookAt(lookX, lookY, lookZ);

      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
      sharedMissileResources.forEach((r) => r.dispose?.());
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
});

export default Game3DScene;