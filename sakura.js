// Preset Gallery Photos & Mid-Autumn Wishes
const presetGallery = [
    {
        url: "./img/n1.jpg", // Đường dẫn tới ảnh trong thư mục images
        caption: "Bánh ngọt, trăng xinh, lòng bình yên."
    },
    {
        url: "./img/n2.jpg",
        caption: "🥮 Có bánh, có trăng, có cả niềm vui."
    },
    {
        url: "./img/n3.jpg",
        caption: "🥮 Trăng tròn, bánh ngọt, lòng cũng vui."
    },
    {
        url: "./img/n4.jpg",
        caption: "Một mùa trăng thật bình yên."
    },
    {
        url: "./img/n5.jpg",
        caption: "🌙 Trăng xinh, người cũng xinh."
    },
    {
        url: "./img/n6.jpg",
        caption: "Chúc một đêm trăng thật dịu dàng."
    },
    {
        url: "./img/n7.jpg",
        caption: "Hằng Nga ước chỉ có Cuội, còn ước nguyện đêm nay của e là có câu trả lời từ c"
    },
    {
        url: "./img/n8.jpg",
        caption: "🌙 Gửi chút dịu dàng theo ánh trăng."
    },
    {
        url: "./img/n9.jpg",
        caption: "Có trăng, có bánh, có yêu thương."
    },
    {
        url: "./img/n10.jpg",
        caption: "🌙 Một đêm trăng, ngàn điều đáng yêu."
    }

];
// Three.js Global Variables
let scene, camera, renderer;
let treeGroup;
let particleCanopy, particleGeometry;
let floatingLanterns = [];
let firefliesMesh;
let raycaster, mouse;

// Interactive Drag, Pinch & Zoom State
let isPointerDown = false;
let pointerStartX = 0;
let pointerStartY = 0;
let targetRotationY = 0;
let targetRotationX = 0;
let dragDistance = 0;

// Camera Zoom Variables (Thích ứng linh hoạt cả PC & Mobile)
const isMobileDevice = window.innerWidth < 768;
let cameraDistance = isMobileDevice ? 19.5 : 15.5;
let targetCameraDistance = cameraDistance;
const MIN_ZOOM = 7;
const MAX_ZOOM = 40;

// Multi-touch pinch tracking
let initialPinchDistance = 0;
let initialPinchZoom = cameraDistance;

// Audio state
let isAudioPlaying = false;
let audioCtx;

function initThreeScene() {
    // 1. Create Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030108);
    scene.fog = new THREE.FogExp2(0x050212, 0.012);

    // 2. Setup Camera
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    updateCameraPosition();

    // 3. Setup WebGL Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('webgl-canvas'),
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    setupLighting();

    // TREE GROUP: Khởi tạo trước để chứa cả cây lẫn các hạt màu trắng xoay cùng
    treeGroup = new THREE.Group();
    scene.add(treeGroup);

    // CÁC HẠT TRẮNG QUANH CÂY ĐƯỢC THÊM VÀO TREEGROUP ĐỂ XOAY THEO CÂY
    createStarfieldAndWhiteParticles();

    // MẶT TRĂNG CỐ ĐỊNH: Đặt trực tiếp trong Scene nên ĐỨNG IM hoàn toàn
    createFixedGlowingMoon();

    createCompactSoilMound();

    createCherryTreeTrunkAndBranches();

    // TÁN CÂY NGUYÊN BẢN HẠT MÀU HỒNG ĐỨNG YÊN TỰ NHIÊN
    createMagentaParticleCanopy();

    createCuteWhiteRabbit();

    createInitialLanterns();

    // Setup Touch, Mouse & Zoom Listeners
    setupInteractionEvents();

    setupUIHandlers();

    animate();
}

function updateCameraPosition() {
    const isMobileNow = window.innerWidth < 768;
    const targetY = isMobileNow ? 3.5 : 3.2;
    camera.position.set(0, targetY, cameraDistance);
    camera.lookAt(0, 3.8, 0);
}

function setupLighting() {
    const ambient = new THREE.AmbientLight(0x2d1847, 1.5);
    scene.add(ambient);

    // Fixed Moon Directional Light from Upper Right Sky
    const moonLight = new THREE.DirectionalLight(0xfff5d6, 2.4);
    moonLight.position.set(15, 30, -20);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // Center Pink Glow Light
    const pinkTreeLight = new THREE.PointLight(0xff007f, 3.8, 30);
    pinkTreeLight.position.set(0, 7.5, 0);
    scene.add(pinkTreeLight);

    // Ground Highlight
    const groundLight = new THREE.PointLight(0xff9900, 1.8, 15);
    groundLight.position.set(0.5, 0, 2);
    scene.add(groundLight);
}

// CÁC HẠT ĐỐM SÁNG MÀU TRẮNG GẮN VÀO TREEGROUP NÊN SẼ XOAY THEO CÂY
function createStarfieldAndWhiteParticles() {
    const fireflyCount = 550;
    const fireflyGeo = new THREE.BufferGeometry();
    const fireflyPos = new Float32Array(fireflyCount * 3);

    for (let i = 0; i < fireflyCount; i++) {
        fireflyPos[i * 3] = (Math.random() - 0.5) * 120;
        fireflyPos[i * 3 + 1] = Math.random() * 70 - 25; // Phủ rộng không gian xung quanh cây
        fireflyPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    }

    fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPos, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.4, 'rgba(235, 245, 255, 0.85)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const fireflyTex = new THREE.CanvasTexture(canvas);
    const fireflyMat = new THREE.PointsMaterial({
        size: 1.3,
        map: fireflyTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    firefliesMesh = new THREE.Points(fireflyGeo, fireflyMat);
    treeGroup.add(firefliesMesh); // ĐÃ ĐƯỢC GẮN VÀO TREEGROUP ĐỂ XOAY CÙNG CÂY
}

// MẶT TRĂNG GẮN VÀO SCENE NÊN SẼ ĐỨNG IM KHI XOAY CÂY
function createFixedGlowingMoon() {
    const moonGroup = new THREE.Group();

    const moonGeo = new THREE.SphereGeometry(6.8, 48, 48);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffbee });
    const moonSphere = new THREE.Mesh(moonGeo, moonMat);
    moonGroup.add(moonSphere);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255, 252, 230, 0.95)');
    grad.addColorStop(0.3, 'rgba(255, 220, 150, 0.45)');
    grad.addColorStop(0.65, 'rgba(255, 100, 180, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const haloTex = new THREE.CanvasTexture(canvas);
    const haloMat = new THREE.SpriteMaterial({
        map: haloTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const haloSprite = new THREE.Sprite(haloMat);
    haloSprite.scale.set(36, 36, 1);
    moonGroup.add(haloSprite);

    moonGroup.position.set(9.0, 13.0, -25.0);
    scene.add(moonGroup); // GẮN VÀO SCENE ĐỂ ĐỨNG IM
}

function createCompactSoilMound() {
    const islandGroup = new THREE.Group();

    const topGeo = new THREE.CylinderGeometry(8.5, 8.2, 0.6, 32);
    const topMat = new THREE.MeshStandardMaterial({
        color: 0x2d2b33,
        roughness: 0.9,
        flatShading: true
    });
    const topDisk = new THREE.Mesh(topGeo, topMat);
    topDisk.position.y = -0.3;
    topDisk.receiveShadow = true;
    islandGroup.add(topDisk);

    const rockGeo = new THREE.ConeGeometry(8.2, 7.5, 24);
    const pos = rockGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const noise = (Math.sin(vx * 1.2) + Math.cos(vz * 1.2)) * 0.45;
        pos.setX(i, vx + noise * 0.3);
        pos.setZ(i, vz + noise * 0.3);
    }
    rockGeo.computeVertexNormals();

    const rockMat = new THREE.MeshStandardMaterial({
        color: 0x18161d,
        roughness: 0.95,
        metalness: 0.1,
        flatShading: true
    });
    const rockBottom = new THREE.Mesh(rockGeo, rockMat);
    rockBottom.rotation.x = Math.PI;
    rockBottom.position.y = -4.05;
    islandGroup.add(rockBottom);

    const pebbleGeo = new THREE.DodecahedronGeometry(0.35, 1);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x3a3842, roughness: 0.8, flatShading: true });

    const pebblePositions = [
        [-3.2, 0.1, 2.1], [3.5, 0.1, -1.5], [-2.5, 0.1, -3.2],
        [4.2, 0.1, 2.5], [-4.5, 0.1, -1.0], [1.8, 0.1, 3.8]
    ];

    pebblePositions.forEach(([px, py, pz]) => {
        const pebble = new THREE.Mesh(pebbleGeo, pebbleMat);
        pebble.position.set(px, py, pz);
        const scale = 0.6 + Math.random() * 0.8;
        pebble.scale.set(scale * 1.4, scale * 0.6, scale * 1.2);
        pebble.rotation.set(Math.random(), Math.random(), Math.random());
        islandGroup.add(pebble);
    });

    treeGroup.add(islandGroup);
}

function createCherryTreeTrunkAndBranches() {
    const barkMat = new THREE.MeshStandardMaterial({
        color: 0x1f0d05,
        roughness: 0.9,
        metalness: 0.1
    });

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.7, 9.5, 16);
    const trunk = new THREE.Mesh(trunkGeo, barkMat);
    trunk.position.set(0, 1.8, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const rootGeo = new THREE.CylinderGeometry(0.12, 0.32, 2.2, 8);
        const root = new THREE.Mesh(rootGeo, barkMat);
        root.position.set(Math.cos(angle) * 0.45, -2.1, Math.sin(angle) * 0.45);
        root.rotation.z = (Math.random() - 0.5) * 0.35;
        root.rotation.x = Math.cos(angle) * 0.45;
        treeGroup.add(root);
    }

    const branchesData = [
        { x: -1.8, y: 5.5, z: -0.2, rx: 0.2, rz: 0.7, rTop: 0.18, rBot: 0.36, len: 6.2 },
        { x: -3.6, y: 7.8, z: 0.3, rx: -0.2, rz: 0.85, rTop: 0.1, rBot: 0.22, len: 5.2 },
        { x: 1.8, y: 5.3, z: 0.3, rx: -0.1, rz: -0.65, rTop: 0.2, rBot: 0.38, len: 6.5 },
        { x: 3.9, y: 8.0, z: -0.5, rx: 0.3, rz: -0.7, rTop: 0.12, rBot: 0.22, len: 5.5 },
        { x: 0.2, y: 6.5, z: 1.1, rx: 0.5, rz: 0.1, rTop: 0.14, rBot: 0.28, len: 4.8 },
        { x: -0.4, y: 8.8, z: -0.4, rx: -0.3, rz: 0.2, rTop: 0.11, rBot: 0.24, len: 5.2 }
    ];

    branchesData.forEach(b => {
        const bGeo = new THREE.CylinderGeometry(b.rTop, b.rBot, b.len, 12);
        const branch = new THREE.Mesh(bGeo, barkMat);
        branch.position.set(b.x, b.y, b.z);
        branch.rotation.x = b.rx;
        branch.rotation.z = b.rz;
        branch.castShadow = true;
        treeGroup.add(branch);
    });
}

function createPinkParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(255, 105, 180, 0.95)');
    grad.addColorStop(0.65, 'rgba(255, 0, 128, 0.65)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
}

// HẠT MÀU HỒNG CỐ ĐỊNH NGUYÊN BẢN TẠO TÁN CÂY
function createMagentaParticleCanopy() {
    const particleCount = 14500;
    particleGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
        new THREE.Color(0xff007f),
        new THREE.Color(0xff1493),
        new THREE.Color(0xff3399),
        new THREE.Color(0xd80068),
        new THREE.Color(0xff80bf)
    ];

    const clusters = [
        { x: 0, y: 10.5, z: 0, rX: 11, rY: 6.5, rZ: 8.5 },
        { x: -6.5, y: 9.5, z: -0.5, rX: 7.5, rY: 5.5, rZ: 6.5 },
        { x: 7.0, y: 9.2, z: 0.5, rX: 8.5, rY: 5.8, rZ: 7.5 },
        { x: -1.5, y: 12.5, z: -0.8, rX: 7.0, rY: 5.0, rZ: 6.0 },
        { x: 2.2, y: 8.2, z: 2.8, rX: 6.5, rY: 4.5, rZ: 5.5 }
    ];

    for (let i = 0; i < particleCount; i++) {
        const c = clusters[Math.floor(Math.random() * clusters.length)];

        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(Math.random());

        const px = c.x + r * c.rX * Math.sin(phi) * Math.cos(theta);
        const py = c.y + r * c.rY * Math.sin(phi) * Math.sin(theta);
        const pz = c.z + r * c.rZ * Math.cos(phi);

        positions[i * 3] = px;
        positions[i * 3 + 1] = py;
        positions[i * 3 + 2] = pz;

        const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleTex = createPinkParticleTexture();

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.65,
        vertexColors: true,
        map: particleTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.92
    });

    particleCanopy = new THREE.Points(particleGeometry, particleMaterial);
    treeGroup.add(particleCanopy);
}

function createSingleRabbitMesh(colorHex = 0xffffff) {
    const rabbit = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.4,
        emissive: 0x222222
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x880015 });

    const bodyGeo = new THREE.SphereGeometry(0.45, 16, 16);
    bodyGeo.scale(1, 0.9, 1.1);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    body.position.y = 0.4;
    rabbit.add(body);

    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const head = new THREE.Mesh(headGeo, whiteMat);
    head.position.set(0, 0.8, 0.25);
    rabbit.add(head);

    const earGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.6, 12);
    const ear1 = new THREE.Mesh(earGeo, whiteMat);
    ear1.position.set(-0.12, 1.2, 0.2);
    ear1.rotation.z = -0.18;
    rabbit.add(ear1);

    const ear2 = new THREE.Mesh(earGeo, whiteMat);
    ear2.position.set(0.12, 1.2, 0.2);
    ear2.rotation.z = 0.18;
    rabbit.add(ear2);

    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
    eye1.position.set(-0.14, 0.88, 0.52);
    const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
    eye2.position.set(0.14, 0.88, 0.52);
    rabbit.add(eye1);
    rabbit.add(eye2);

    return rabbit;
}

function createCuteWhiteRabbit() {
    const rabbitPositions = [
        { x: -2.2, z: 1.8, rotY: Math.PI / 4, color: 0xebd9fc },
        { x: 2.5, z: -1.2, rotY: -Math.PI / 3, color: 0xffffff },
        { x: -1.2, z: -2.2, rotY: Math.PI * 0.8, color: 0xf5e6ff },
        { x: 0.8, z: 2.6, rotY: -Math.PI / 6, color: 0xffffff }
    ];

    rabbitPositions.forEach(p => {
        const rabbit = createSingleRabbitMesh(p.color);
        rabbit.position.set(p.x, 0.0, p.z);
        rabbit.rotation.y = p.rotY;
        treeGroup.add(rabbit);
    });
}

function buildSingleLanternMesh(itemData) {
    const lanternGroup = new THREE.Group();

    const bodyGeo = new THREE.CylinderGeometry(0.42, 0.35, 1.1, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xffe066,
        emissive: 0xff9900,
        emissiveIntensity: 0.85,
        roughness: 0.3,
        transparent: true,
        opacity: 0.92
    });

    const body = new THREE.Mesh(bodyGeo, bodyMat);
    lanternGroup.add(body);

    const rimGeo = new THREE.TorusGeometry(0.42, 0.03, 8, 16);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xcc8800 });
    const topRim = new THREE.Mesh(rimGeo, rimMat);
    topRim.rotation.x = Math.PI / 2;
    topRim.position.y = 0.55;
    lanternGroup.add(topRim);

    const bottomRim = new THREE.Mesh(rimGeo, rimMat);
    bottomRim.rotation.x = Math.PI / 2;
    bottomRim.position.y = -0.55;
    lanternGroup.add(bottomRim);

    const ribbonGeo = new THREE.BoxGeometry(0.18, 0.75, 0.02);
    const ribbonMat = new THREE.MeshBasicMaterial({ color: 0xdd1111 });
    const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbon.position.set(0, -0.95, 0);
    lanternGroup.add(ribbon);

    // VẦNG SÁNG / HÀO QUANG BAO QUANH ĐÈN
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const hCtx = haloCanvas.getContext('2d');
    const hGrad = hCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    hGrad.addColorStop(0, 'rgba(255, 220, 100, 0.85)');
    hGrad.addColorStop(0.35, 'rgba(255, 140, 0, 0.45)');
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.fillRect(0, 0, 128, 128);

    const haloMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(haloCanvas),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const haloSprite = new THREE.Sprite(haloMat);
    haloSprite.scale.set(3.4, 3.4, 1.0);
    lanternGroup.add(haloSprite);

    const innerLight = new THREE.PointLight(0xffaa00, 2.8, 10);
    innerLight.position.set(0, 0, 0);
    lanternGroup.add(innerLight);

    lanternGroup.userData = {
        data: itemData,
        speedY: 0.006 + Math.random() * 0.008,
        swaySpeed: 0.5 + Math.random() * 0.6,
        swayOffset: Math.random() * Math.PI * 2,
        driftX: (Math.random() - 0.5) * 0.005,
        driftZ: (Math.random() - 0.5) * 0.005
    };

    return lanternGroup;
}

function createInitialLanterns() {
    const count = 30;
    for (let i = 0; i < count; i++) {
        const sample = presetGallery[i % presetGallery.length];
        spawnLantern(sample, true);
    }
}

function spawnLantern(data, isInitial = false) {
    const lantern = buildSingleLanternMesh(data);

    const x = (Math.random() - 0.5) * 70;
    const z = (Math.random() - 0.5) * 50;
    const y = isInitial ? (Math.random() * 38 - 5) : -6;

    lantern.position.set(x, y, z);

    scene.add(lantern);
    floatingLanterns.push(lantern);
}

// SỰ KIỆN CẢM ỨNG ĐIỆN THOẠI & CHUỘT MÁY TÍNH
function setupInteractionEvents() {
    const canvas = document.getElementById('webgl-canvas');

    window.addEventListener('wheel', (e) => {
        targetCameraDistance += e.deltaY * 0.02;
        targetCameraDistance = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetCameraDistance));
    }, { passive: true });

    const onPointerDown = (e) => {
        if (e.touches && e.touches.length === 2) {
            isPointerDown = false;
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            initialPinchZoom = targetCameraDistance;
            return;
        }

        isPointerDown = true;
        pointerStartX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        pointerStartY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        dragDistance = 0;
    };

    const onPointerMove = (e) => {
        if (e.touches && e.touches.length === 2) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const currentPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            if (initialPinchDistance > 0) {
                const delta = initialPinchDistance - currentPinchDistance;
                targetCameraDistance = initialPinchZoom + delta * 0.08;
                targetCameraDistance = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetCameraDistance));
            }
            return;
        }

        if (!isPointerDown) return;

        const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

        const deltaX = currentX - pointerStartX;
        const deltaY = currentY - pointerStartY;

        dragDistance += Math.abs(deltaX) + Math.abs(deltaY);

        targetRotationY += deltaX * 0.007;
        targetRotationX += deltaY * 0.005;
        targetRotationX = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetRotationX));

        pointerStartX = currentX;
        pointerStartY = currentY;
    };

    const onPointerUp = (e) => {
        if (isPointerDown && dragDistance < 10) {
            const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
            const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;

            mouse.x = (clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(floatingLanterns, true);

            if (intersects.length > 0) {
                let target = intersects[0].object;
                while (target.parent && target.parent !== scene) {
                    target = target.parent;
                }

                if (target && target.userData && target.userData.data) {
                    openLanternModal(target.userData.data);
                    triggerSparkleBurst(intersects[0].point);
                }
            }
        }
        isPointerDown = false;
        initialPinchDistance = 0;
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    window.addEventListener('resize', onWindowResize, false);
}

function triggerSparkleBurst(pos) {
    const particleCount = 40;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = pos.x + (Math.random() - 0.5) * 2.2;
        positions[i + 1] = pos.y + (Math.random() - 0.5) * 2.2;
        positions[i + 2] = pos.z + (Math.random() - 0.5) * 2.2;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 0.8,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const pSystem = new THREE.Points(geo, mat);
    scene.add(pSystem);

    let frames = 0;
    const timer = setInterval(() => {
        frames++;
        mat.opacity -= 0.05;
        pSystem.scale.multiplyScalar(1.04);
        if (frames > 20) {
            clearInterval(timer);
            scene.remove(pSystem);
            geo.dispose();
            mat.dispose();
        }
    }, 30);
}

function openLanternModal(itemData) {
    const modal = document.getElementById('lantern-modal');
    const img = document.getElementById('modal-image');
    const caption = document.getElementById('modal-caption');

    // TỰ ĐỘNG NHẬN DIỆN DÁNG ẢNH ĐỂ CẮT CHUẨN MẶT & VỪA KHUNG
    img.onload = function () {
        if (img.naturalWidth > img.naturalHeight) {
            // Ảnh ngang: Lấy gốc cắt ở chính giữa
            img.style.objectPosition = 'center center';
        } else {
            // Ảnh dọc: Tập trung lấy nét mặt ở vị trí 20% từ trên xuống
            img.style.objectPosition = 'center 20%';
        }
    };

    img.src = itemData.url;
    caption.innerText = `"${itemData.caption}"`;

    modal.classList.remove('hidden');
}
function toggleMusic() {
    if (isAudioPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
}

function startMusic() {
    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        const playChime = () => {
            if (!isAudioPlaying) return;

            const osc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();

            const freq = notes[Math.floor(Math.random() * notes.length)];
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            noteGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
            noteGain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.25);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.8);

            osc.connect(noteGain);
            noteGain.connect(masterGain);

            osc.start();
            osc.stop(audioCtx.currentTime + 2.9);

            const nextDelay = 550 + Math.random() * 750;
            setTimeout(playChime, nextDelay);
        };

        isAudioPlaying = true;
        playChime();

        document.getElementById('music-icon').className = 'fa-solid fa-volume-high text-yellow-300 animate-pulse';
    } catch (e) {
        console.log("Audio Error:", e);
    }
}

function stopMusic() {
    isAudioPlaying = false;
    if (audioCtx) audioCtx.close();
    document.getElementById('music-icon').className = 'fa-solid fa-music text-lg';
}

function setupUIHandlers() {
    document.getElementById('music-btn').addEventListener('click', toggleMusic);

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('lantern-modal').classList.add('hidden');
    });
    document.getElementById('modal-close-action-btn').addEventListener('click', () => {
        document.getElementById('lantern-modal').classList.add('hidden');
    });
}

let clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth Camera Zoom
    cameraDistance += (targetCameraDistance - cameraDistance) * 0.1;
    updateCameraPosition();

    // Smooth rotation for treeGroup (Bao gồm cả Cây và Hạt màu trắng)
    if (!isPointerDown) {
        targetRotationY += 0.0025;
    }

    if (treeGroup) {
        treeGroup.rotation.y += (targetRotationY - treeGroup.rotation.y) * 0.08;
        treeGroup.rotation.x += (targetRotationX - treeGroup.rotation.x) * 0.08;
    }

    // Floating Lanterns Ascending Slow
    floatingLanterns.forEach((lantern) => {
        lantern.position.y += lantern.userData.speedY;
        lantern.position.x += lantern.userData.driftX + Math.sin(elapsedTime * lantern.userData.swaySpeed + lantern.userData.swayOffset) * 0.012;
        lantern.position.z += lantern.userData.driftZ + Math.cos(elapsedTime * lantern.userData.swaySpeed + lantern.userData.swayOffset) * 0.012;
        lantern.rotation.y += 0.004;

        if (lantern.position.y > 32) {
            lantern.position.y = -6;
            lantern.position.x = (Math.random() - 0.5) * 70;
            lantern.position.z = (Math.random() - 0.5) * 50;
        }
    });

    // Fireflies Local Swaying
    if (firefliesMesh) {
        firefliesMesh.rotation.y = elapsedTime * 0.015;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Tự động điều chỉnh khoảng cách camera theo kích thước màn hình điện thoại / PC
    const isMobileNow = window.innerWidth < 768;
    targetCameraDistance = isMobileNow ? 19.5 : 15.5;
}

window.onload = function () {
    initThreeScene();
};