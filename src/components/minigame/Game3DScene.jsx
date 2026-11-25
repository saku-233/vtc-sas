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
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8a93a3, metalness: 0.55, roughness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x3c434c, metalness: 0.5, roughness: 0.4 });

  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 1.7, 14), bodyMat);
  fuse.rotation.x = Math.PI / 2;
  g.add(fuse);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 14), bodyMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, -1.06);
  g.add(nose);

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x4a6fa5, metalness: 0.7, roughness: 0.1, transparent: true, opacity: 0.85 })
  );
  canopy.position.set(0, 0.09, -0.34);
  canopy.scale.set(1, 1.7, 0.7);
  g.add(canopy);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.72), bodyMat);
  wing.position.set(0, -0.02, 0.14);
  g.add(wing);

  for (const s of [-1, 1]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.34), bodyMat);
    tail.position.set(s * 0.28, 0.23, 0.56);
    tail.rotation.z = s * 0.18;
    g.add(tail);
    const stab = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.3), bodyMat);
    stab.position.set(s * 0.46, 0, 0.6);
    g.add(stab);
  }

  const glows = [];
  for (const s of [-1, 1]) {
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.28, 10), darkMat);
    eng.rotation.x = Math.PI / 2;
    eng.position.set(s * 0.18, -0.02, 0.96);
    g.add(eng);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0x99ddff }));
    glow.position.set(s * 0.18, -0.02, 1.12);
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

    scene.add(new THREE.AmbientLight(0x88aaff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    // Player F-15EX (centered, clearly visible)
    const jet = buildF15EX();
    jet.position.set(0, 0.35, 1.4);
    scene.add(jet);

    // Enemy SU-30 targets
    const targets = [];
    for (let i = 0; i < TARGET_COUNT; i++) {
      const g = buildSu30();
      g.rotation.y = Math.PI; // nose toward player
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
    for (let i = 0; i < 20; i++) {
      const x = (i - 10) * 5 + (Math.random() - 0.5) * 3;
      addPeak(x, -40 + (Math.random() - 0.5) * 8, 9 + Math.random() * 9, rockMat, 7, 9 + Math.random() * 9);
    }
    for (let i = 0; i < 12; i++) {
      const x = (i - 6) * 8 + (Math.random() - 0.5) * 4;
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

    function explode(pos, correct) {
      const exp = new THREE.Group();
      const flashColor = correct ? 0x66ff88 : 0xff4444;
      const sparkColor = correct ? 0xc8ffd8 : 0xffb24d;
      const flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 16, 16),
        new THREE.MeshBasicMaterial({ color: flashColor, transparent: true, opacity: 0.9 })
      );
      exp.add(flash);
      const pcount = 24;
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
            .multiplyScalar(0.05 + Math.random() * 0.08)
        );
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: sparkColor, size: 0.15, transparent: true, opacity: 1 }));
      exp.add(pts);
      exp.userData = { flash, pts, pVel, life: 0, max: 0.85 };
      scene.add(exp);
      explosions.push(exp);
    }

    function fireAt(i, correct) {
      const t = targets[i];
      if (!t || !t.userData.alive) return;
      const start = jet.position.clone();
      start.y += 0.1;
      const end = t.position.clone();
      const proj = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x88eeff })
      );
      proj.position.copy(start);
      proj.userData = { end, correct, target: t, index: i };
      scene.add(proj);
      projectiles.push(proj);
    }

    function reset() {
      projectiles.forEach((p) => scene.remove(p));
      projectiles.length = 0;
      explosions.forEach((e) => scene.remove(e));
      explosions.length = 0;
      targets.forEach((t) => {
        t.visible = true;
        t.userData.alive = true;
        t.position.z = TARGET_Z;
      });
    }

    function shake() {
      shakeAmt = 0.45;
    }

    apiRef.current = { fireAt, reset, shake };

    let raf;
    const clock = new THREE.Clock();
    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;

      jet.position.y = 0.35 + Math.sin(t * 1.5) * 0.05;
      jet.rotation.z = Math.sin(t * 0.8) * 0.06;
      jet.rotation.x = -0.08 + Math.sin(t * 1.2) * 0.02;
      (jet.userData.glows || []).forEach((gl) => gl.scale.setScalar(1 + Math.sin(t * 18) * 0.2));

      const sp = starGeo.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        sp[i * 3 + 2] += dt * 22;
        if (sp[i * 3 + 2] > 8) sp[i * 3 + 2] -= 48;
      }
      starGeo.attributes.position.needsUpdate = true;

      peaks.forEach((p) => {
        const nz = p.cone.position.z + dt * p.speed;
        if (nz > 14) {
          const nx = (Math.random() - 0.5) * 52;
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
        tg.position.y = tg.userData.baseY + Math.sin(t * 1.4 + tg.userData.bob) * 0.22;
        tg.rotation.roll = (tg.rotation.roll || 0) + dt * tg.userData.spin;
        tg.rotation.z = Math.sin(t * 0.6 + i) * 0.12;
        tg.rotation.y = Math.PI + Math.sin(t * 0.5 + i) * 0.08;
      });

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const dir = p.userData.end.clone().sub(p.position);
        const dist = dir.length();
        if (dist < 0.4) {
          explode(p.userData.end, p.userData.correct);
          if (p.userData.correct) {
            p.userData.target.visible = false;
            p.userData.target.userData.alive = false;
          } else {
            shake();
          }
          scene.remove(p);
          projectiles.splice(i, 1);
        } else {
          p.position.add(dir.normalize().multiplyScalar(1.4));
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.userData.life += dt;
        const k = e.userData.life / e.userData.max;
        e.userData.flash.scale.setScalar(1 + k * 5);
        e.userData.flash.material.opacity = Math.max(0, 0.9 * (1 - k));
        const pp = e.userData.pts.geometry.attributes.position.array;
        e.userData.pVel.forEach((v, j) => {
          pp[j * 3] += v.x;
          pp[j * 3 + 1] += v.y;
          pp[j * 3 + 2] += v.z;
        });
        e.userData.pts.geometry.attributes.position.needsUpdate = true;
        e.userData.pts.material.opacity = Math.max(0, 1 - k);
        if (e.userData.life >= e.userData.max) {
          scene.remove(e);
          explosions.splice(i, 1);
        }
      }

      if (shakeAmt > 0) {
        camera.position.x = (Math.random() - 0.5) * shakeAmt;
        camera.position.y = 1.35 + (Math.random() - 0.5) * shakeAmt;
        shakeAmt *= 0.85;
        if (shakeAmt < 0.01) {
          shakeAmt = 0;
          camera.position.set(0, 1.35, 5.4);
        }
      }

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
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose?.();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
          else o.material.dispose();
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" />;
});

export default Game3DScene;