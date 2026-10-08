import * as THREE from 'three';

// Source cutout is 744 x 1296 px. Joint positions below are measured on it.
const IMG_W = 744;
const IMG_H = 1296;
const JOINTS = {
  root: { x: 372, y: 1296 },
  hips: { x: 372, y: 950 },
  chest: { x: 300, y: 600 },
  neck: { x: 210, y: 265 },
  tassel: { x: 95, y: 132 },
};
// Vertical skin bands (px from top): [start, end] of each blend.
const BLEND = { headChest: [235, 300], chestHips: [520, 800], hipsRoot: [1050, 1296] };

const smooth = (a, b, v) => {
  const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

function buildSkinAttributes(geometry, toPx) {
  const pos = geometry.attributes.position;
  const indices = [];
  const weights = [];
  // bone order: 0 root, 1 hips, 2 chest, 3 head
  for (let i = 0; i < pos.count; i++) {
    const py = toPx(pos.getY(i));
    let w = [0, 0, 0, 0];
    if (py <= BLEND.headChest[0]) w = [0, 0, 0, 1];
    else if (py <= BLEND.headChest[1]) {
      const t = smooth(...BLEND.headChest, py);
      w = [0, 0, t, 1 - t];
    } else if (py <= BLEND.chestHips[0]) w = [0, 0, 1, 0];
    else if (py <= BLEND.chestHips[1]) {
      const t = smooth(...BLEND.chestHips, py);
      w = [0, t, 1 - t, 0];
    } else if (py <= BLEND.hipsRoot[0]) w = [0, 1, 0, 0];
    else {
      const t = smooth(...BLEND.hipsRoot, py);
      w = [t, 1 - t, 0, 0];
    }
    indices.push(0, 1, 2, 3);
    weights.push(...w);
  }
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
}

function buildTassel(scale) {
  const group = new THREE.Group();
  const gold = new THREE.MeshBasicMaterial({ color: '#e7a92a' });
  const ink = new THREE.MeshBasicMaterial({ color: '#1b0a17' });
  const cordLen = 150 * scale;
  const cord = new THREE.Mesh(new THREE.PlaneGeometry(7 * scale, cordLen), gold);
  cord.position.y = -cordLen / 2;
  const cordLine = new THREE.Mesh(new THREE.PlaneGeometry(11 * scale, cordLen), ink);
  cordLine.position.set(0, -cordLen / 2, -0.001);
  const knot = new THREE.Mesh(new THREE.CircleGeometry(9 * scale, 12), gold);
  knot.position.y = -cordLen;
  const fringe = new THREE.Shape();
  const fw = 22 * scale;
  const fh = 70 * scale;
  fringe.moveTo(-fw * 0.35, 0);
  fringe.lineTo(fw * 0.35, 0);
  fringe.lineTo(fw * 0.55, -fh);
  fringe.lineTo(-fw * 0.55, -fh);
  const fringeMesh = new THREE.Mesh(new THREE.ShapeGeometry(fringe), gold);
  fringeMesh.position.y = -cordLen - 4 * scale;
  const fringeLine = new THREE.Mesh(new THREE.ShapeGeometry(fringe), ink);
  fringeLine.scale.set(1.25, 1.06, 1);
  fringeLine.position.set(0, -cordLen - 2 * scale, -0.001);
  group.add(cordLine, cord, fringeLine, fringeMesh, knot);
  group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return group;
}

// Crisp cutout: full anisotropy, trilinear mips with a slight negative bias so
// the figure stays sharp when the camera pulls back, premultiplied alpha so
// the cut edge has no bright fringe against the sky.
function prepareTexture(texture, renderer) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer?.capabilities.getMaxAnisotropy() ?? 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.premultiplyAlpha = true;
  return texture;
}

export async function createMascot(url, worldHeight, renderer) {
  const texture = prepareTexture(await new THREE.TextureLoader().loadAsync(url), renderer);

  const s = worldHeight / IMG_H;
  const worldWidth = IMG_W * s;
  const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight, 10, 64);
  const toWorld = (px, py) => new THREE.Vector3((px - IMG_W / 2) * s, (IMG_H / 2 - py) * s, 0);
  const toPx = (y) => IMG_H / 2 - y / s;
  buildSkinAttributes(geometry, toPx);

  // warm grade so the figure sits inside the scene's light instead of on top of it
  const material = new THREE.MeshBasicMaterial({ map: texture, color: '#f0d9bf', transparent: true, alphaTest: 0.04, premultipliedAlpha: true });
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.frustumCulled = false;
  // cast a silhouette shadow (alpha-tested), not a rectangle
  mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: texture, alphaTest: 0.5 });

  // bone chain; each bone is positioned relative to its parent
  const abs = Object.fromEntries(Object.entries(JOINTS).map(([k, j]) => [k, toWorld(j.x, j.y)]));
  const root = new THREE.Bone();
  const hips = new THREE.Bone();
  const chest = new THREE.Bone();
  const head = new THREE.Bone();
  root.position.copy(abs.root);
  hips.position.copy(abs.hips).sub(abs.root);
  chest.position.copy(abs.chest).sub(abs.hips);
  head.position.copy(abs.neck).sub(abs.chest);
  root.add(hips);
  hips.add(chest);
  chest.add(head);
  mesh.add(root);
  mesh.updateMatrixWorld(true);
  mesh.bind(new THREE.Skeleton([root, hips, chest, head]));

  // tassel hangs from the cap brim and swings on its own spring "bone"
  const tasselPivot = new THREE.Group();
  tasselPivot.position.copy(abs.tassel).sub(abs.neck);
  tasselPivot.position.z = 0.01;
  tasselPivot.add(buildTassel(s));
  head.add(tasselPivot);

  // contact shadow on the slab
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.MeshBasicMaterial({ color: '#23206b', transparent: true, opacity: 0.55 }),
  );
  shadow.scale.set(worldWidth * 0.42, 0.22, 1);
  shadow.position.set(worldWidth * 0.05, -worldHeight / 2 + 0.25, -0.02);
  shadow.visible = false; // the clouds receive his real shadow now

  const group = new THREE.Group();
  group.add(shadow, mesh);

  const rest = {
    head: head.position.clone(),
    root: root.position.clone(),
  };

  return {
    group,
    bones: { root, hips, chest, head },
    tasselPivot,
    shadow,
    rest,
    material,
  };
}
