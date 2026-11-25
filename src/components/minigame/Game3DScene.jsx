import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

const TARGET_COUNT = 4;
const TARGET_Z = -13;
const TARGET_X = [-4.8, -1.6, 1.6, 4.8];

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
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText(letter, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
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
    scene.fog = new THREE.Fog(0x0a1a30, 16, 38);

    const bgCanvas = document.createElement("canvas");
    bgCanvas.width = 16;
    bgCanvas.height = 256;
    const bctx = bgCanvas.getContext("2d");
    const grad = bctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#16306a");
    grad.addColorStop(0.55, "#2a5a90");
    grad.addColorStop(1, "#08111f");
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, 16, 256);
    scene.background = new THREE.CanvasTexture(bgCanvas);

    const camera = new THREE.PerspectiveCamera(62, width / height, 0.1, 120);
    camera.position.set(0, 2.4, 7.5);
    camera.lookAt(0, 0, -6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x88aaff, 0.65));
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(3, 6, 4);
    scene.add(dir);

    // Player jet
    const jetMat = new THREE.MeshStandardMaterial({ color: 0x265e53, metalness: 0.45, roughness: 0.4 });
    const jet = new THREE.Group();
    const bodyGeo = new THREE.ConeGeometry(0.3, 1.5, 12);
    bodyGeo.rotateX(-Math.PI / 2);
    jet.add(new THREE.Mesh(bodyGeo, jetMat));
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.5), jetMat);
    wing.position.set(0, -0.05, 0.12);
    jet.add(wing);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.28), jetMat);
    tail.position.set(0, 0.02, 0.65);
    tail.rotation.x = 0.25;
    jet.add(tail);
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x66ddff, metalness: 0.7, roughness: 0.1, transparent: true, opacity: 0.85 })
    );
    cockpit.position.set(0, 0.13, 0.05);
    jet.add(cockpit);
    const engineGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x66ddff })
    );
    engineGlow.position.set(0, 0, 0.78);
    jet.add(engineGlow);
    jet.position.set(0, -1.25, 3.4);
    scene.add(jet);

    // Enemy targets
    const targets = [];
    for (let i = 0; i < TARGET_COUNT; i++) {
      const g = new THREE.Group();
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.44, 0),
        new THREE.MeshStandardMaterial({ color: 0xff5544, emissive: 0x551111, metalness: 0.5, roughness: 0.3 })
      );
      g.add(core);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.64, 0.03, 8, 28),
        new THREE.MeshBasicMaterial({ color: 0xffb077 })
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: makeLabelTexture(String.fromCharCode(65 + i), "#ffe2b0"), transparent: true })
      );
      sprite.position.set(0, 0.95, 0);
      sprite.scale.set(0.85, 0.85, 0.85);
      g.add(sprite);
      g.position.set(TARGET_X[i], 0.4 + Math.sin(i) * 0.15, TARGET_Z);
      g.userData = { baseY: g.position.y, alive: true, spin: 0.5 + i * 0.05, ring };
      targets.push(g);
      scene.add(g);
    }

    // Streaming starfield
    const starCount = 450;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 44;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      starPos[i * 3 + 2] = -Math.random() * 44 - 2;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xbbddff, size: 0.09, transparent: true, opacity: 0.85 }));
    scene.add(stars);

    const projectiles = [];
    const explosions = [];
    let shakeAmt = 0;

    function explode(pos, correct) {
      const exp = new THREE.Group();
      const flashColor = correct ? 0x66ff88 : 0xff4444;
      const sparkColor = correct ? 0xc8ffd8 : 0xffb24d;
      const flash = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 16, 16),
        new THREE.MeshBasicMaterial({ color: flashColor, transparent: true, opacity: 0.9 })
      );
      exp.add(flash);
      const pcount = 20;
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
            .multiplyScalar(0.05 + Math.random() * 0.07)
        );
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
      const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: sparkColor, size: 0.14, transparent: true, opacity: 1 }));
      exp.add(pts);
      exp.userData = { flash, pts, pVel, life: 0, max: 0.85 };
      scene.add(exp);
      explosions.push(exp);
    }

    function fireAt(i, correct) {
      const t = targets[i];
      if (!t || !t.userData.alive) return;
      const start = jet.position.clone();
      start.y += 0.18;
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

      jet.position.y = -1.25 + Math.sin(t * 1.5) * 0.06;
      jet.rotation.z = Math.sin(t * 0.8) * 0.05;
      jet.rotation.x = -0.1 + Math.sin(t * 1.2) * 0.02;
      engineGlow.scale.setScalar(1 + Math.sin(t * 18) * 0.18);

      const sp = starGeo.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        sp[i * 3 + 2] += dt * 9;
        if (sp[i * 3 + 2] > 8) sp[i * 3 + 2] -= 46;
      }
      starGeo.attributes.position.needsUpdate = true;

      targets.forEach((tg, i) => {
        if (!tg.userData.alive) return;
        tg.position.y = tg.userData.baseY + Math.sin(t * 1.5 + i) * 0.18;
        tg.rotation.y += dt * tg.userData.spin;
        tg.userData.ring.rotation.z += dt * 0.6;
      });

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        const dir = p.userData.end.clone().sub(p.position);
        const dist = dir.length();
        if (dist < 0.35) {
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
          p.position.add(dir.normalize().multiplyScalar(1.3));
        }
      }

      for (let i = explosions.length - 1; i >= 0; i--) {
        const e = explosions[i];
        e.userData.life += dt;
        const k = e.userData.life / e.userData.max;
        e.userData.flash.scale.setScalar(1 + k * 4.5);
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
        camera.position.y = 2.4 + (Math.random() - 0.5) * shakeAmt;
        shakeAmt *= 0.85;
        if (shakeAmt < 0.01) {
          shakeAmt = 0;
          camera.position.set(0, 2.4, 7.5);
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