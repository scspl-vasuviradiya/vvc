//const MES_IMAGES = [];
const COLLECTIONS_JSON_URL = "../collections.json";
const FALLBACK_IMAGE_PATHS = [
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
async function loadImagePaths() {
    try {
        const response = await fetch(COLLECTIONS_JSON_URL, {
            cache: "no-store"
        });
        if (!response.ok) throw new Error(`collections.json HTTP ${response.status}`);
        const collections = await response.json();
        if (Array.isArray(collections)) {
            const paths = collections.map(item => item && item.img).filter(Boolean).map(normalizeCollectionImagePath);
            if (paths.length) return paths
        }
    } catch (error) {
        console.warn("Using fallback image list", error)
    }
    return FALLBACK_IMAGE_PATHS
}
console.log("&Toc on codepen - https://codepen.io/ol-ivier");
class InfinitePortraitGallery {
    constructor() {
        this.canvas = document.createElement("canvas"), document.body.appendChild(this.canvas), this.gl = this.canvas.getContext("webgl"), this.gl ? (this.images = [], this.textures = [], this.imageWidth = 100, this.imageHeight = 100, this.gap = 20, this.viewOffset = {
            x: 0,
            y: 0
        }, this.drag = {
            isDragging: !1,
            lastX: 0,
            lastY: 0,
            velocityX: 0,
            velocityY: 0
        }, this.inertia = .95, this.bulgeStrength = .6, this.bulgeRadius = 1.5, this.adjustedBulgeRadius = this.bulgeRadius, this.resizeCanvas(), window.addEventListener("resize", (() => this.resizeCanvas())), this.init(), this.loadPortraitImages(), this.setupEventListeners(), this.animate()) : alert("WebGL non supporté")
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth, this.canvas.height = window.innerHeight;
        const t = Math.sqrt(Math.pow(this.canvas.width / Math.min(this.canvas.width, this.canvas.height), 2) + Math.pow(this.canvas.height / Math.min(this.canvas.width, this.canvas.height), 2));
        this.adjustedBulgeRadius = Math.max(this.bulgeRadius, .6 * t * 1.2), this.gl && this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    }
    init() {
        const vsSource = `
        attribute vec2 aPosition;
        attribute vec2 aTexCoord;
        varying vec2 vTexCoord;
        uniform vec2 uResolution;
        uniform vec2 uOffset;
        uniform float uRotation;
        uniform vec2 uImagePosition;
        uniform float uBulgeStrength;
        uniform float uBulgeRadius;

        vec2 applyBulgeEffect(vec2 pos){
            vec2 normalizedPos = pos / uResolution;
            vec2 center = vec2(0.5,0.5);
            vec2 delta = normalizedPos - center;

            // CORRECTION ASPECT
            float aspect = uResolution.x / uResolution.y;
            delta.x *= aspect;

            float dist = length(delta);

            if(dist < uBulgeRadius){
                float t = dist / uBulgeRadius;
                float z = sqrt(1.5 - t*t); // projection sphérique
                delta *= 0.35 + uBulgeStrength * z;
                delta.x /= aspect;

                normalizedPos = center + delta;
                pos = normalizedPos * uResolution;
            }
            return pos;
        }

        void main(){
            vec2 pos = aPosition * vec2(${this.imageWidth},${this.imageHeight});
            pos += uImagePosition;
            pos -= uOffset;

            vec2 center = uImagePosition + vec2(${this.imageWidth/2},${this.imageHeight/2}) - uOffset;
            pos -= center;
            float cosR = cos(uRotation);
            float sinR = sin(uRotation);
            pos = vec2(pos.x*cosR - pos.y*sinR, pos.x*sinR + pos.y*cosR);
            pos += center;

            pos = applyBulgeEffect(pos);

            vec2 clip = pos / uResolution * 2.0 - 1.0;
            gl_Position = vec4(clip,0.0,1.0);
            vTexCoord = aTexCoord;
        }
        `;

        const fsSource = `
        precision mediump float;
        varying vec2 vTexCoord;
        uniform sampler2D uSampler;
        void main(){
            vec2 uv = vec2(vTexCoord.x,1.0-vTexCoord.y);
            vec4 color = texture2D(uSampler, uv);
            if(color.a<0.01) discard;
            gl_FragColor = color;
        }
        `;

        this.program = this.createProgram(vsSource, fsSource);

        const SUBDIV = 24;
        const positions = [];
        const texCoords = [];
        const indices = [];
        for(let y=0;y<=SUBDIV;y++){
            for(let x=0;x<=SUBDIV;x++){
                positions.push(x/SUBDIV, y/SUBDIV);
                texCoords.push(x/SUBDIV, y/SUBDIV);
            }
        }
        for(let y=0;y<SUBDIV;y++){
            for(let x=0;x<SUBDIV;x++){
                const i = y*(SUBDIV+1)+x;
                indices.push(i,i+1,i+SUBDIV+1,i+1,i+SUBDIV+2,i+SUBDIV+1);
            }
        }
        this.indexCount = indices.length;

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(positions),this.gl.STATIC_DRAW);

        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(texCoords),this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),this.gl.STATIC_DRAW);

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);
    }
    async loadPortraitImages() {
    const loadingElement = document.querySelector(".loading");
    const imagesFromServer = await loadImagePaths();
    const imagesToLoad = imagesFromServer && imagesFromServer.length > 0 ? imagesFromServer : this.getDefaultImages();
    const totalImages = Math.max(50, imagesToLoad.length);
    
    const loadPromises = [];
    
    for (let i = 0; i < totalImages; i++) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        const promise = new Promise((resolve) => {
            img.onload = () => {
                this.images.push(img);
                this.textures.push(this.createTexture(img));
                resolve();
            };
            img.onerror = () => {
                resolve();
            };
            
            if (imagesFromServer && imagesFromServer.length > 0) {
                img.src = imagesToLoad[i % imagesToLoad.length];
            } else {
                const defaultIds = [1011, 1015, 1018, 1020, 1023, 1025, 1029, 1031, 1033, 1035];
                img.src = `https://picsum.photos/id/${defaultIds[i % defaultIds.length]}/${this.imageWidth}/${this.imageHeight}`;
            }
        });
        
        loadPromises.push(promise);
        
        if (loadingElement) {
            promise.then(() => {
                const percent = Math.round((this.images.length / totalImages) * 100);
                loadingElement.textContent = `Chargement... ${percent}%`;
            });
        }
    }
    
    await Promise.all(loadPromises);
    
    if (loadingElement) loadingElement.style.display = "none";
}
    getDefaultImages() {
        return [1011, 1015, 1018, 1020, 1023, 1025, 1029, 1031, 1033, 1035, 1036, 1038, 1040, 1043, 1045, 1047, 1049, 1051, 1053, 1055, 1057, 1059, 1060, 1062, 1065, 1067, 1069, 1071, 1074, 1076, 1078, 1080, 1082, 1084, 1086, 1088, 1090, 1092, 1094, 1096, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].map((t => `https://picsum.photos/id/${t}/${this.imageWidth}/${this.imageHeight}`))
    }
    createTexture(t) {
        const s = this.gl.createTexture();
        return this.gl.bindTexture(this.gl.TEXTURE_2D, s), this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, t), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR), this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR), s
    }
    getVisibleTiles() {
        const t = [],
            s = this.imageWidth + this.gap,
            i = this.imageHeight + this.gap,
            e = this.viewOffset.x - this.canvas.width,
            a = this.viewOffset.x + 2 * this.canvas.width,
            h = this.viewOffset.y - this.canvas.height,
            o = this.viewOffset.y + 2 * this.canvas.height,
            n = Math.ceil(this.images.length / 10);
        for (let g = Math.floor(h / i) - 1; g <= Math.ceil(o / i) + 1; g++)
            for (let h = Math.floor(e / s) - 1; h <= Math.ceil(a / s) + 1; h++) {
                const e = ((h % n + n) % n + (g % 10 + 10) % 10 * n) % this.images.length;
                t.push({
                    x: h * s,
                    y: g * i,
                    imageIndex: e
                })
            }
        return t
    }
    render() {
        if (!this.program || 0 === this.images.length) return;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height), this.gl.clearColor(.08, .08, .1, 1), this.gl.clear(this.gl.COLOR_BUFFER_BIT), this.gl.useProgram(this.program);
        const t = this.gl.getAttribLocation(this.program, "aPosition");
        this.gl.enableVertexAttribArray(t), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer), this.gl.vertexAttribPointer(t, 2, this.gl.FLOAT, !1, 0, 0);
        const s = this.gl.getAttribLocation(this.program, "aTexCoord");
        this.gl.enableVertexAttribArray(s), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer), this.gl.vertexAttribPointer(s, 2, this.gl.FLOAT, !1, 0, 0), this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        const i = this.gl.getUniformLocation(this.program, "uResolution");
        this.gl.uniform2f(i, this.canvas.width, this.canvas.height);
        const e = this.gl.getUniformLocation(this.program, "uOffset"),
            a = this.gl.getUniformLocation(this.program, "uImagePosition"),
            h = this.gl.getUniformLocation(this.program, "uSampler"),
            o = this.gl.getUniformLocation(this.program, "uBulgeStrength"),
            n = this.gl.getUniformLocation(this.program, "uBulgeRadius");
        this.gl.uniform1f(o, this.bulgeStrength), this.gl.uniform1f(n, this.adjustedBulgeRadius);
        const g = this.getVisibleTiles();
      
        for (const t of g) this.gl.uniform2f(e, this.viewOffset.x, this.viewOffset.y), this.gl.uniform2f(a, t.x, t.y), this.gl.activeTexture(this.gl.TEXTURE0), this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[t.imageIndex]), this.gl.uniform1i(h, 0), this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0)
    }
    handleClick(t, s) {
        const i = t + this.viewOffset.x,
            e = s + this.viewOffset.y,
            a = this.getVisibleTiles();
        for (const t of a)
            if (i >= t.x && i <= t.x + this.imageWidth && e >= t.y && e <= t.y + this.imageHeight) return void console.log("📸 Image cliquée", t.imageIndex, t.x, t.y)
    }
    setupEventListeners() {
        this.canvas.addEventListener("mousedown", (t => {
            this.drag.isDragging = !0, this.drag.lastX = t.clientX, this.drag.lastY = t.clientY
        })), window.addEventListener("mousemove", (t => {
            if (!this.drag.isDragging) return;
            const s = t.clientX - this.drag.lastX,
                i = t.clientY - this.drag.lastY;
            this.drag.velocityX = .3 * s + .7 * this.drag.velocityX, this.drag.velocityY = .3 * i + .7 * this.drag.velocityY, this.viewOffset.x -= this.drag.velocityX, this.viewOffset.y -= this.drag.velocityY, this.drag.lastX = t.clientX, this.drag.lastY = t.clientY
        })), window.addEventListener("mouseup", (() => {
            this.drag.isDragging = !1
        })), this.canvas.addEventListener("touchstart", (t => {
            t.preventDefault(), this.drag.isDragging = !0, this.drag.lastX = t.touches[0].clientX, this.drag.lastY = t.touches[0].clientY
        })), window.addEventListener("touchmove", (t => {
            if (!this.drag.isDragging) return;
            t.preventDefault();
            const s = t.touches[0].clientX - this.drag.lastX,
                i = t.touches[0].clientY - this.drag.lastY;
            this.drag.velocityX = .3 * s + .7 * this.drag.velocityX, this.drag.velocityY = .3 * i + .7 * this.drag.velocityY, this.viewOffset.x -= this.drag.velocityX, this.viewOffset.y -= this.drag.velocityY, this.drag.lastX = t.touches[0].clientX, this.drag.lastY = t.touches[0].clientY
        })), window.addEventListener("touchend", (() => {
            this.drag.isDragging = !1
        })), this.canvas.addEventListener("click", (t => {
            const s = this.canvas.getBoundingClientRect();
            this.handleClick(t.clientX - s.left, t.clientY - s.top)
        })), this.canvas.addEventListener("wheel", (t => {
            t.preventDefault(), this.drag.velocityX += .3 * t.deltaX, this.drag.velocityY += .3 * t.deltaY
        })), window.addEventListener("keydown", (t => {
            switch (t.key) {
                case "+":
                case "=":
                    this.bulgeStrength = Math.min(1, this.bulgeStrength + .1);
                    break;
                case "-":
                case "_":
                    this.bulgeStrength = Math.max(.48, this.bulgeStrength - .1);
                    break;
                case "ArrowLeft": this.bulgeRadius = Math.max(.1, this.bulgeRadius - .05), this.resizeCanvas();
                    break;
                case "ArrowRight": this.bulgeRadius = Math.min(3, this.bulgeRadius + .05), this.resizeCanvas()
            }
        }))
    }
    animate() {
        this.drag.isDragging || (this.viewOffset.x -= this.drag.velocityX, this.viewOffset.y -= this.drag.velocityY, this.drag.velocityX *= this.inertia, this.drag.velocityY *= this.inertia, Math.abs(this.drag.velocityX) < .1 && (this.drag.velocityX = 0), Math.abs(this.drag.velocityY) < .1 && (this.drag.velocityY = 0)), this.render(), requestAnimationFrame((() => this.animate()))
    }
    createProgram(t, s) {
        const i = this.loadShader(this.gl.VERTEX_SHADER, t),
            e = this.loadShader(this.gl.FRAGMENT_SHADER, s),
            a = this.gl.createProgram();
        return this.gl.attachShader(a, i), this.gl.attachShader(a, e), this.gl.linkProgram(a), this.gl.getProgramParameter(a, this.gl.LINK_STATUS) ? a : (console.error("Erreur programme:", this.gl.getProgramInfoLog(a)), null)
    }
    loadShader(t, s) {
        const i = this.gl.createShader(t);
        return this.gl.shaderSource(i, s), this.gl.compileShader(i), this.gl.getShaderParameter(i, this.gl.COMPILE_STATUS) ? i : (console.error("Erreur shader:", this.gl.getShaderInfoLog(i)), this.gl.deleteShader(i), null)
    }
}
document.addEventListener("DOMContentLoaded", (() => {
    new InfinitePortraitGallery
}));