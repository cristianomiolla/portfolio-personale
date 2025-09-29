// Three.js 3D Model Setup for Business Card
let scene, camera, renderer, model, controls;
let accentLight1, accentLight2, pointLight1, pointLight2, rimLight1, rimLight2;

function initBusinessCard() {
    const canvas = document.getElementById('model-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0.8, 3); // Camera positioned for balanced front view

    // Renderer setup - Ottimizzato per performance
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });

    // DPI support ottimizzato
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 1);

    // Rendering settings ottimizzati
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; // Aggiornamento manuale per performance
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.physicallyCorrectLights = true;

    // Advanced cinematic lighting with enhanced shadows
    const ambientLight = new THREE.AmbientLight(0x2c3e50, 0.08); // Reduced ambient for deeper shadows
    scene.add(ambientLight);

    // Main key light con shadow ottimizzate
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 100;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Cool fill light with area-like quality (reduced for more shadows)
    const fillLight1 = new THREE.DirectionalLight(0x64b5f6, 0.8);
    fillLight1.position.set(-4, 3, 4);
    scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0x81c784, 0.5);
    fillLight2.position.set(-2, 6, -1);
    scene.add(fillLight2);

    // Shadow enhancement light for standard view
    const shadowLight = new THREE.DirectionalLight(0x404040, 0.6);
    shadowLight.position.set(-8, 3, -6);
    scene.add(shadowLight);

    // Dramatic rim lighting
    rimLight1 = new THREE.DirectionalLight(0xff7043, 1.8);
    rimLight1.position.set(-6, 4, -3);
    scene.add(rimLight1);

    rimLight2 = new THREE.DirectionalLight(0xe91e63, 1.2);
    rimLight2.position.set(4, -2, -4);
    scene.add(rimLight2);

    // Point lights ottimizzate (senza shadow per performance)
    pointLight1 = new THREE.PointLight(0xffd54f, 2.2, 25, 2);
    pointLight1.position.set(3, 5, 2);
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0x9c27b0, 1.8, 18, 1.8);
    pointLight2.position.set(-3, 2, 3);
    scene.add(pointLight2);

    // Animated accent lights with more sophistication
    accentLight1 = new THREE.PointLight(0x00e5ff, 1.0, 12, 1.5); // Electric blue
    accentLight1.position.set(2, 1, 3);
    scene.add(accentLight1);

    accentLight2 = new THREE.PointLight(0xff1744, 0.8, 10, 1.2); // Bright red
    accentLight2.position.set(-2, -1, 2);
    scene.add(accentLight2);

    // Load GLB model
    const loader = new THREE.GLTFLoader();
    loader.load('assets/modello 3d.glb',
        function(gltf) {
            model = gltf.scene;
            console.log('Model loaded successfully:', model);

            // Enable shadows and enhance materials for ultra quality
            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.frustumCulled = false; // Disable frustum culling for better quality

                    // Ottimizzazione materiali
                    if (child.material) {
                        child.material.needsUpdate = true;

                        if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                            child.material.roughness = child.material.roughness || 0.4;
                            child.material.metalness = child.material.metalness || 0.1;
                        }

                        // Anisotropic filtering ottimizzato
                        const anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

                        if (child.material.map) {
                            child.material.map.anisotropy = anisotropy;
                        }
                        if (child.material.normalMap) {
                            child.material.normalMap.anisotropy = anisotropy;
                        }
                    }
                }
            });

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            console.log('Model size:', size);
            console.log('Model center:', center);

            // Center the model
            model.position.x = -center.x;
            model.position.y = -center.y;
            model.position.z = -center.z;

            // Better scaling - try different scale values
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 2.2 / maxDimension; // Increased scale
            model.scale.setScalar(scale);

            console.log('Applied scale:', scale);

            scene.add(model);
            animateBusinessCard();
        },
        function(progress) {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function(error) {
            console.error('Error loading model:', error);
        }
    );

    // Setup OrbitControls
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disable zoom to keep model size consistent
    controls.enablePan = false;  // Disable panning to keep model centered
    controls.rotateSpeed = 0.5;

    // Handle window resize
    window.addEventListener('resize', onBusinessCardResize, false);
}

function onBusinessCardResize() {
    const canvas = document.getElementById('model-canvas');
    if (!canvas || !camera || !renderer) return;

    const container = canvas.parentElement;

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

let animationFrame = 0;

function animateBusinessCard() {
    requestAnimationFrame(animateBusinessCard);

    if (controls) controls.update();

    // Ottimizzazione: aggiorna luci ogni 3 frame
    animationFrame++;
    if (animationFrame % 3 === 0) {
        const time = Date.now() * 0.001;

        if (accentLight1) {
            accentLight1.intensity = 0.8 + Math.sin(time * 1.2) * 0.4;
        }
        if (accentLight2) {
            accentLight2.intensity = 0.6 + Math.cos(time * 1.5) * 0.3;
        }
        if (pointLight1) {
            pointLight1.intensity = 1.8 + Math.sin(time * 0.65) * 0.4;
        }
        if (pointLight2) {
            pointLight2.intensity = 1.2 + Math.cos(time * 0.55) * 0.3;
        }
        if (rimLight1) {
            rimLight1.intensity = 1.6 + Math.sin(time * 0.3) * 0.2;
        }
        if (rimLight2) {
            rimLight2.intensity = 1.0 + Math.cos(time * 0.25) * 0.2;
        }
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Lazy loading - Initialize only when business card section is visible
let businessCardInitialized = false;
let visibilityObserver = null;

function initBusinessCardWhenVisible() {
    const businessCardSection = document.querySelector('.business-card-section');
    if (!businessCardSection || businessCardInitialized) return;

    visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !businessCardInitialized) {
                businessCardInitialized = true;
                console.log('Business card section visible, initializing 3D model...');
                setTimeout(initBusinessCard, 100);
                visibilityObserver.unobserve(businessCardSection);
            }
        });
    }, {
        rootMargin: '100px' // Start loading when section is 100px away from viewport
    });

    visibilityObserver.observe(businessCardSection);
}

// Cleanup function for memory management
function cleanupBusinessCard() {
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
    }
    if (scene) {
        scene.clear();
    }
    if (visibilityObserver) {
        visibilityObserver.disconnect();
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupBusinessCard);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initBusinessCardWhenVisible();
});