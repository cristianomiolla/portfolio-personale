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

    // Renderer setup - Ultra maximum quality configuration
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: true, // Enable for advanced effects
        depth: true,
        logarithmicDepthBuffer: true, // Better depth precision
        preserveDrawingBuffer: true, // Better quality
        premultipliedAlpha: false,
        precision: 'highp' // High precision
    });

    // Maximum quality DPI support
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 4); // Up to 4x for maximum quality
    renderer.setPixelRatio(pixelRatio);

    // Render at 2.5x resolution for maximum visual quality
    const renderWidth = container.offsetWidth * 2.5;
    const renderHeight = container.offsetHeight * 2.5;
    renderer.setSize(renderWidth, renderHeight, false);
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
    renderer.setClearColor(0x000000, 1);

    // Maximum quality rendering settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true; // Enable auto-update for better quality
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3; // Slightly increased exposure
    renderer.physicallyCorrectLights = true;
    renderer.gammaFactor = 2.2;

    // Additional quality enhancements
    renderer.sortObjects = true;
    renderer.autoClear = true;
    renderer.autoClearColor = true;
    renderer.autoClearDepth = true;
    renderer.autoClearStencil = true;

    // Advanced cinematic lighting with enhanced shadows
    const ambientLight = new THREE.AmbientLight(0x2c3e50, 0.08); // Reduced ambient for deeper shadows
    scene.add(ambientLight);

    // Main key light with maximum quality shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;  // Ultra high quality shadows
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 100;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.radius = 8; // Maximum soft shadow quality
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

    // Ultra quality point lights with enhanced shadows
    pointLight1 = new THREE.PointLight(0xffd54f, 2.2, 25, 2);
    pointLight1.position.set(3, 5, 2);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 2048; // High quality shadows
    pointLight1.shadow.mapSize.height = 2048;
    pointLight1.shadow.bias = -0.0001;
    pointLight1.shadow.normalBias = 0.02;
    pointLight1.shadow.radius = 6;
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0x9c27b0, 1.8, 18, 1.8);
    pointLight2.position.set(-3, 2, 3);
    pointLight2.castShadow = true; // Enable shadows for better quality
    pointLight2.shadow.mapSize.width = 1024;
    pointLight2.shadow.mapSize.height = 1024;
    pointLight2.shadow.bias = -0.0001;
    pointLight2.shadow.normalBias = 0.02;
    pointLight2.shadow.radius = 4;
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

                    // Ultra enhance material properties
                    if (child.material) {
                        // Enhanced material properties
                        child.material.envMapIntensity = 1.2;
                        child.material.needsUpdate = true;

                        // Enable high-quality material features
                        if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
                            child.material.roughness = child.material.roughness || 0.4;
                            child.material.metalness = child.material.metalness || 0.1;
                        }

                        // Maximum anisotropic filtering for all texture maps
                        const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

                        // Enhance diffuse/albedo maps
                        if (child.material.map) {
                            child.material.map.anisotropy = maxAnisotropy;
                            child.material.map.generateMipmaps = true;
                            child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.map.magFilter = THREE.LinearFilter;
                            child.material.map.wrapS = child.material.map.wrapT = THREE.RepeatWrapping;
                            child.material.map.flipY = false;
                        }

                        // Enhance normal maps
                        if (child.material.normalMap) {
                            child.material.normalMap.anisotropy = maxAnisotropy;
                            child.material.normalMap.generateMipmaps = true;
                            child.material.normalMap.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.normalMap.magFilter = THREE.LinearFilter;
                            child.material.normalScale = child.material.normalScale || new THREE.Vector2(1, 1);
                        }

                        // Enhance roughness maps
                        if (child.material.roughnessMap) {
                            child.material.roughnessMap.anisotropy = maxAnisotropy;
                            child.material.roughnessMap.generateMipmaps = true;
                            child.material.roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.roughnessMap.magFilter = THREE.LinearFilter;
                        }

                        // Enhance metalness maps
                        if (child.material.metalnessMap) {
                            child.material.metalnessMap.anisotropy = maxAnisotropy;
                            child.material.metalnessMap.generateMipmaps = true;
                            child.material.metalnessMap.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.metalnessMap.magFilter = THREE.LinearFilter;
                        }

                        // Enhance ambient occlusion maps
                        if (child.material.aoMap) {
                            child.material.aoMap.anisotropy = maxAnisotropy;
                            child.material.aoMap.generateMipmaps = true;
                            child.material.aoMap.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.aoMap.magFilter = THREE.LinearFilter;
                            child.material.aoMapIntensity = 1.0;
                        }

                        // Enhance emissive maps
                        if (child.material.emissiveMap) {
                            child.material.emissiveMap.anisotropy = maxAnisotropy;
                            child.material.emissiveMap.generateMipmaps = true;
                            child.material.emissiveMap.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.emissiveMap.magFilter = THREE.LinearFilter;
                        }

                        // Enhance displacement maps
                        if (child.material.displacementMap) {
                            child.material.displacementMap.anisotropy = maxAnisotropy;
                            child.material.displacementMap.generateMipmaps = true;
                            child.material.displacementMap.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.displacementMap.magFilter = THREE.LinearFilter;
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

    // Maintain maximum quality on resize
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 4);
    renderer.setPixelRatio(pixelRatio);

    // 2.5x resolution for maximum quality
    const renderWidth = container.offsetWidth * 2.5;
    const renderHeight = container.offsetHeight * 2.5;
    renderer.setSize(renderWidth, renderHeight, false);
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
}

let animationFrame = 0;
let needsShadowUpdate = true;

function animateBusinessCard() {
    requestAnimationFrame(animateBusinessCard);

    // Update controls
    if (controls) controls.update();

    // Optimized animations - update less frequently
    animationFrame++;
    const time = Date.now() * 0.001;
    const slowTime = time * 0.5;

    // Update lighting every 2 frames for better performance
    if (animationFrame % 2 === 0) {
        // Smooth accent light animations
        if (accentLight1) {
            accentLight1.intensity = 0.8 + Math.sin(time * 1.2) * 0.4;
            accentLight1.position.x = 2 + Math.sin(time * 0.8) * 0.5; // Reduced movement
        }
        if (accentLight2) {
            accentLight2.intensity = 0.6 + Math.cos(time * 1.5) * 0.3;
            accentLight2.position.z = 2 + Math.cos(time * 0.7) * 0.4; // Reduced movement
        }

        // Update point lights less frequently
        if (pointLight1) {
            pointLight1.intensity = 1.8 + Math.sin(slowTime * 1.3) * 0.4; // Reduced variation
        }
        if (pointLight2) {
            pointLight2.intensity = 1.2 + Math.cos(slowTime * 1.1) * 0.3; // Reduced variation
        }

        // Subtle rim light animation
        if (rimLight1) {
            rimLight1.intensity = 1.6 + Math.sin(time * 0.3) * 0.2; // Slower, less variation
        }
        if (rimLight2) {
            rimLight2.intensity = 1.0 + Math.cos(time * 0.25) * 0.2; // Slower, less variation
        }

        // Update shadows for maximum quality
        if (needsShadowUpdate && animationFrame % 5 === 0) {
            renderer.shadowMap.needsUpdate = true;
            needsShadowUpdate = false;
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