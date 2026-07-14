if (!window.THREE) console.error("Three.js non chargÃ©");
let layers = [];
const textures = [];
let loaded = 0;
let lastTime = 0;
const DEPTH_LAYERS = 5;
const IMAGES_PER_LAYER = 10;
const MAX_WIDTH = 160;
const MAX_HEIGHT = 160;
let dragActive = !1;
let lastX = 0;
let dragVelocity = 0;
let speedFactor = 1;
const LAYER_CONFIG = [{
    scale: 1.5,
    speed: 80,
    opacity: 1.0
}, {
    scale: 1.0,
    speed: 40,
    opacity: 0.85
}, {
    scale: 0.8,
    speed: 30,
    opacity: 0.7
}, {
    scale: 0.6,
    speed: 20,
    opacity: 0.55
}, {
    scale: 0.5,
    speed: 15,
    opacity: 0.4
}];
const IMAGE_PATHS = [
    'https://vivahvilla.in/img/collections/a-royal-entrance-begins-with-the-perfect-sherwani.jpg',
    'https://vivahvilla.in/img/collections/black-crown-long-indowestern.jpg',
    'https://vivahvilla.in/img/collections/black-crown-long-indo-western.jpg',
    'https://vivahvilla.in/img/collections/blue-dynasty-signature-indowestern.jpg',
    'https://vivahvilla.in/img/collections/blue-dynasty-signature-indo-western.jpg',
    'https://vivahvilla.in/img/collections/brown-reign.jpg',
    'https://vivahvilla.in/img/collections/brown-reign-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/classic-black-velvet-indowestern.jpg',
    'https://vivahvilla.in/img/collections/classic-men-s-suit.jpg',
    'https://vivahvilla.in/img/collections/coral-charm-lehnga.jpg',
    'https://vivahvilla.in/img/collections/dark-knight-elegance-indowestern.jpg',
    'https://vivahvilla.in/img/collections/dusk-bloom-indo-western.jpg',
    'https://vivahvilla.in/img/collections/elegant-red-lehenga.jpg',
    'https://vivahvilla.in/img/collections/ethereal-groom-sherwani.jpg',
    'https://vivahvilla.in/img/collections/floral-royale-indowestern.jpg',
    'https://vivahvilla.in/img/collections/heritage-reimagined.jpg',
    'https://vivahvilla.in/img/collections/heritage-reimagined-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/imperial-ivory-elegance.jpg',
    'https://vivahvilla.in/img/collections/ivory-pastel-mirror-indowestern.jpg',
    'https://vivahvilla.in/img/collections/ivory-pastel-mirror-indo-western.jpg',
    'https://vivahvilla.in/img/collections/ivory-peacock-lehenga.jpg',
    'https://vivahvilla.in/img/collections/ivory-signature-indowestern.jpg',
    'https://vivahvilla.in/img/collections/lavender-bloom-lehenga.jpg',
    'https://vivahvilla.in/img/collections/lavender-smoke-indowestern.jpg',
    'https://vivahvilla.in/img/collections/maharaja-sherwani.jpg',
    'https://vivahvilla.in/img/collections/maharani-s-legacy-lehenga.jpg',
    'https://vivahvilla.in/img/collections/maroon-modern-king.jpg',
    'https://vivahvilla.in/img/collections/maroon-modern-king-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/men-indowestern-1.jpg',
    'https://vivahvilla.in/img/collections/men-indowestern-3.jpg',
    'https://vivahvilla.in/img/collections/men-indowestern-4.jpg',
    'https://vivahvilla.in/img/collections/men-jodhpuri-1.jpg',
    'https://vivahvilla.in/img/collections/men-jodhpuri-2.jpg',
    'https://vivahvilla.in/img/collections/men-sherwani-1.jpg',
    'https://vivahvilla.in/img/collections/men-suit-1.jpg',
    'https://vivahvilla.in/img/collections/metallic-blush-fusion-indowestern.jpg',
    'https://vivahvilla.in/img/collections/midnight-blue-grace.jpg',
    'https://vivahvilla.in/img/collections/midnight-blue-grace-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/midnight-cavalier.jpg',
    'https://vivahvilla.in/img/collections/midnight-cavalier-indowestern.jpg',
    'https://vivahvilla.in/img/collections/midnight-majesty-lehnga.jpg',
    'https://vivahvilla.in/img/collections/mirror-bloom-fusion-indowestern.jpg',
    'https://vivahvilla.in/img/collections/mirror-bloom-fusion-indo-western.jpg',
    'https://vivahvilla.in/img/collections/modern-asymmetric-fusion-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/modern-floral-tux-style-indowestern.jpg',
    'https://vivahvilla.in/img/collections/multicolored-mosaic-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/navy-blue-beats-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/neelmayur-royale-indowestern.jpg',
    'https://vivahvilla.in/img/collections/neelmayur-royale-indo-western.jpg',
    'https://vivahvilla.in/img/collections/ocean-dusk-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/ocean-dusk-long-indo-western.jpg',
    'https://vivahvilla.in/img/collections/rajsi-peacock-heritage-indowestern.jpg',
    'https://vivahvilla.in/img/collections/rajsi-peacock-heritage-indo-western.jpg',
    'https://vivahvilla.in/img/collections/rajwadi-peacock-koti-kurta-set.jpg',
    'https://vivahvilla.in/img/collections/rajwadi-peacock-koti-set.jpg',
    'https://vivahvilla.in/img/collections/regal-cream-sherwani.jpg',
    'https://vivahvilla.in/img/collections/royal-azure.jpg',
    'https://vivahvilla.in/img/collections/royal-azure-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/royal-azure-peacock-indowestern.jpg',
    'https://vivahvilla.in/img/collections/royal-plumage.jpg',
    'https://vivahvilla.in/img/collections/royal-plumage-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/royal-reflection-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/royal-sapphire-drape-indowestern.jpg',
    'https://vivahvilla.in/img/collections/royal-white-long-indowestern.jpg',
    'https://vivahvilla.in/img/collections/royal-white-long-indo-western.jpg',
    'https://vivahvilla.in/img/collections/shadow-prince-indowestern.jpg',
    'https://vivahvilla.in/img/collections/shahi-ashva-indowestern.jpg',
    'https://vivahvilla.in/img/collections/shahi-ashva-indo-western.jpg',
    'https://vivahvilla.in/img/collections/shahi-ganesh-koti-kurta.jpg',
    'https://vivahvilla.in/img/collections/shahi-noir-indowestern.jpg',
    'https://vivahvilla.in/img/collections/shahi-noir-indo-western.jpg',
    'https://vivahvilla.in/img/collections/shahi-peacock-indowestern.jpg',
    'https://vivahvilla.in/img/collections/shahi-peacock-indo-western.jpg',
    'https://vivahvilla.in/img/collections/signature-of-sovereignty-indowestern.jpg',
    'https://vivahvilla.in/img/collections/stealth-luxury-indowestern.jpg',
    'https://vivahvilla.in/img/collections/stealth-luxury-indo-western.jpg',
    'https://vivahvilla.in/img/collections/the-crown-prince.jpg',
    'https://vivahvilla.in/img/collections/the-crown-prince-sherwani.jpg',
    'https://vivahvilla.in/img/collections/the-golden-fable.jpg',
    'https://vivahvilla.in/img/collections/the-golden-fable-indowestern.jpg',
    'https://vivahvilla.in/img/collections/the-maharaja-sherwani.jpg',
    'https://vivahvilla.in/img/collections/the-midnight-groom.jpg',
    'https://vivahvilla.in/img/collections/the-midnight-groom-indowestern.jpg',
    'https://vivahvilla.in/img/collections/the-peacock-prince.jpg',
    'https://vivahvilla.in/img/collections/the-royal-tapestry.jpg',
    'https://vivahvilla.in/img/collections/the-royal-tapestry-indowestern.jpg',
    'https://vivahvilla.in/img/collections/the-royal-wine-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/the-signature-of-sovereignty.jpg',
    'https://vivahvilla.in/img/collections/the-white-sovereign.jpg',
    'https://vivahvilla.in/img/collections/the-white-sovereign-jodhpuri.jpg',
    'https://vivahvilla.in/img/collections/wine-emperor-indowestern.jpg',
    'https://vivahvilla.in/img/collections/women-choli-1.jpg',
    'https://vivahvilla.in/img/collections/women-choli-2.jpg',
    'https://vivahvilla.in/img/collections/women-choli-3.jpg',
    'https://vivahvilla.in/img/collections/women-choli-4.jpg',
    'https://vivahvilla.in/img/collections/women-choli-5.jpg',
    'https://vivahvilla.in/img/collections/women-lehenga-1.jpg',
    'https://vivahvilla.in/img/collections/women-lehenga-2.jpg',
    'https://vivahvilla.in/img/collections/women-lehenga-3.jpg',
    'https://vivahvilla.in/img/collections/women-lehenga-4.jpg',
    'https://vivahvilla.in/img/collections/women-lehenga-5.jpg',
    'https://vivahvilla.in/img/collections/women-lehenga-6.jpg',
    'https://vivahvilla.in/img/collections/woven-legacy.jpg',
    'https://vivahvilla.in/img/collections/woven-legacy-koti-kurta.jpg'
];
let shuffledImages = [];
let currentImageIndex = 0;
console.log("&Toc on codepen - https://codepen.io/ol-ivier");

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

function getNextRandomImage() {
    if (currentImageIndex >= shuffledImages.length) {
        shuffledImages = shuffleArray(IMAGE_PATHS);
        currentImageIndex = 0
    }
    const image = shuffledImages[currentImageIndex];
    currentImageIndex++;
    return image
}
const container = document.getElementById("container");
const loadingEl = document.getElementById("loading");
const uiEl = document.getElementById("ui");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: !0,
    alpha: !0,
    powerPreference: "high-performance"
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);
let camera;

function rand(min, max) {
    return Math.random() * (max - min) + min
}

function fallbackTexture(layer) {
    const c = document.createElement("canvas");
    c.width = MAX_WIDTH;
    c.height = MAX_HEIGHT;
    const ctx = c.getContext("2d");
    ctx.fillStyle = ["#4a6572", "#344955", "#232f34", "#1c2529", "#0f1518"][layer];
    ctx.fillRect(0, 0, c.width, c.height);
    return new THREE.CanvasTexture(c)
}
for (let l = 0; l < DEPTH_LAYERS; l++) {
    layers[l] = []
}

function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    if (!camera) {
        camera = new THREE.OrthographicCamera(0, w, h, 0, -1000, 1000);
        camera.position.z = 10
    } else {
        camera.right = w;
        camera.top = h;
        camera.updateProjectionMatrix()
    }
    for (const layer of layers) {
        if (!layer) continue;
        for (const s of layer) {
            scene.remove(s);
            if (s.material.map) s.material.map.dispose();
            s.material.dispose();
            s.geometry.dispose()
        }
    }
    layers = [];
    for (let l = 0; l < DEPTH_LAYERS; l++) layers[l] = [];
    if (textures.length === DEPTH_LAYERS * IMAGES_PER_LAYER) fillViewport();
}
window.addEventListener("resize", resize);
resize();
const loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous";
const TOTAL = DEPTH_LAYERS * IMAGES_PER_LAYER;

function loadAll() {
    shuffledImages = shuffleArray(IMAGE_PATHS);
    currentImageIndex = 0;
    for (let l = 0; l < DEPTH_LAYERS; l++) {
        for (let i = 0; i < IMAGES_PER_LAYER; i++) {
            const path = getNextRandomImage();
            loader.load(path, tex => onLoaded(tex), undefined, () => onLoaded(fallbackTexture(l)))
        }
    }
}

function onLoaded(tex) {
    textures.push(tex);
    loaded++;
    loadingEl.textContent = `Chargement ${Math.round((loaded/TOTAL)*100)}%`;
    if (loaded === TOTAL) initSprites();
}

function initSprites() {
    fillViewport();
    loadingEl.style.display = "none";
    uiEl.style.display = "block";
    lastTime = performance.now();
    animate()
}

function addSprite(layerIndex, startX) {
    const cfg = LAYER_CONFIG[layerIndex];
    const texIndex = Math.floor(Math.random() * textures.length);
    const texture = textures[texIndex] || fallbackTexture(layerIndex);
    const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: !0,
        opacity: cfg.opacity
    });
    const sprite = new THREE.Sprite(mat);
    const image = texture.image;
    let width = MAX_WIDTH;
    let height = MAX_HEIGHT;
    if (image && image.width && image.height) {
        const ratio = image.width / image.height;
        if (ratio > 1) {
            width = MAX_WIDTH;
            height = MAX_WIDTH / ratio
        } else {
            height = MAX_HEIGHT;
            width = MAX_HEIGHT * ratio
        }
    }
    const sizeVar = rand(0.85, 1.15);
    const w = width * cfg.scale * sizeVar;
    const h = height * cfg.scale * sizeVar;
    const spacing = w * rand(0.5, 0.9);
    sprite.scale.set(w, h, 1);
    sprite.position.set(startX + w / 2 + spacing, rand(h / 2, container.clientHeight - h / 2), -layerIndex * 50);
    const speedVariation = rand(0.45, 1.15);
    sprite.userData = {
        speed: cfg.speed * speedVariation,
        width: w,
        height: h,
        seed: rand(0, 1000),
        baseY: sprite.position.y,
        opacity: cfg.opacity
    };
    layers[layerIndex].push(sprite);
    scene.add(sprite);
    return sprite
}

function cleanupSprites() {
    const w = container.clientWidth;
    const bufferZone = w * 0.5;
    for (let l = 0; l < DEPTH_LAYERS; l++) {
        if (!layers[l] || layers[l].length === 0) continue;
        const sprites = layers[l];
        const maxSprites = IMAGES_PER_LAYER + 3;
        if (sprites.length > maxSprites) {
            for (let i = sprites.length - 1; i >= 0; i--) {
                const s = sprites[i];
                const ud = s.userData;
                let shouldRemove = !1;
                if (speedFactor > 0) {
                    shouldRemove = (s.position.x - ud.width / 2) > (w + bufferZone)
                } else if (speedFactor < 0) {
                    shouldRemove = (s.position.x + ud.width / 2) < (-bufferZone)
                }
                if (shouldRemove) {
                    scene.remove(s);
                    if (s.material.map) s.material.map.dispose();
                    s.material.dispose();
                    sprites.splice(i, 1);
                    if (sprites.length <= maxSprites) break
                }
            }
        }
    }
}

function fillViewport() {
    const w = container.clientWidth;
    for (let l = 0; l < DEPTH_LAYERS; l++) {
        let sprites = layers[l];
        if (!sprites) continue;
        let rightMost = sprites.length > 0 ? Math.max(...sprites.map(s => s.position.x + s.userData.width / 2)) : -container.clientWidth * 1.2;
        while (rightMost < w) {
            addSprite(l, rightMost);
            sprites = layers[l];
            rightMost = Math.max(...sprites.map(s => s.position.x + s.userData.width / 2))
        }
    }
}

function animate() {
    const now = performance.now();
    const dt = Math.min(40, now - lastTime) / 1000;
    lastTime = now;
    const w = container.clientWidth;
    dragVelocity *= 0.92;
    speedFactor = dragVelocity !== 0 ? Math.sign(dragVelocity) : speedFactor;
    if (Math.random() < 0.01) {
        cleanupSprites()
    }
    for (const sprites of layers) {
        if (!sprites || !sprites.length) continue;
        for (const s of sprites) {
            const ud = s.userData;
            s.position.x += ud.speed * speedFactor * dt;
            if (speedFactor > 0 && s.position.x - ud.width / 2 > w) {
                s.position.x = -ud.width / 2 - rand(0, ud.width)
            } else if (speedFactor < 0 && s.position.x + ud.width / 2 < 0) {
                s.position.x = w + ud.width / 2 + rand(0, ud.width)
            }
            const pulse = 1 + Math.sin(now * 0.001 + ud.seed) * 0.015;
            s.scale.x = ud.width * pulse;
            s.scale.y = ud.height * pulse;
            s.position.y = ud.baseY + Math.sin(now * 0.001 + ud.seed) * 5;
            s.material.opacity = ud.opacity
        }
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate)
}
loadAll();

function getX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX
}
container.addEventListener("mousedown", e => {
    dragActive = !0;
    lastX = getX(e)
});
container.addEventListener("mousemove", e => {
    if (!dragActive) return;
    const x = getX(e);
    const dx = x - lastX;
    lastX = x;
    dragVelocity = dx * 0.02
});
window.addEventListener("mouseup", () => {
    dragActive = !1
});
container.addEventListener("touchstart", e => {
    dragActive = !0;
    lastX = getX(e)
}, {
    passive: !0
});
container.addEventListener("touchmove", e => {
    if (!dragActive) return;
    const x = getX(e);
    const dx = x - lastX;
    lastX = x;
    dragVelocity = dx * 0.02
}, {
    passive: !0
});
window.addEventListener("touchend", () => {
    dragActive = !1
});
container.addEventListener("wheel", e => {
    e.preventDefault();
    const wheelDelta = Math.sign(e.deltaY);
    const direction = wheelDelta > 0 ? 1 : -1;
    const acceleration = 0.8;
    speedFactor = direction * (Math.abs(speedFactor) + acceleration);
    const maxSpeed = 5;
    const sign = Math.sign(speedFactor);
    const absSpeed = Math.min(maxSpeed, Math.abs(speedFactor));
    speedFactor = sign * absSpeed;
    dragVelocity = 0;
    cleanupSprites()
}, {
    passive: !1
});
container.addEventListener("wheel", e => e.preventDefault(), {
    passive: !1
})