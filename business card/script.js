// Three.js 3D Model Setup
let scene, camera, renderer, model, controls;
let accentLight1, accentLight2, pointLight1, pointLight2, rimLight1, rimLight2;

function init() {
    const canvas = document.getElementById('model-canvas');
    const container = canvas.parentElement;

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0.8, 3); // Camera positioned for balanced front view

    // Renderer setup - Maximum quality configuration
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false,
        preserveDrawingBuffer: false
    });

    // Ultra high DPI support for crisp rendering
    const pixelRatio = window.devicePixelRatio || 1;
    renderer.setPixelRatio(Math.max(pixelRatio, 4)); // Increased to 4x for maximum quality

    // Render at higher internal resolution then scale down (supersampling)
    const renderWidth = container.offsetWidth * 3; // Increased multiplier
    const renderHeight = container.offsetHeight * 3;
    renderer.setSize(renderWidth, renderHeight, false);
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
    renderer.setClearColor(0x000000, 1);

    // Maximum rendering quality settings
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Slightly increased for better contrast
    renderer.physicallyCorrectLights = true;
    renderer.gammaFactor = 2.2;

    // Advanced cinematic lighting with enhanced shadows
    const ambientLight = new THREE.AmbientLight(0x2c3e50, 0.08); // Reduced ambient for deeper shadows
    scene.add(ambientLight);

    // Main key light with enhanced shadows for standard position
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(6, 10, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 8192;  // Ultra high resolution shadows
    keyLight.shadow.mapSize.height = 8192;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 100;
    keyLight.shadow.camera.left = -15;
    keyLight.shadow.camera.right = 15;
    keyLight.shadow.camera.top = 15;
    keyLight.shadow.camera.bottom = -15;
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.normalBias = 0.05;
    keyLight.shadow.radius = 8;
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

    // Volumetric-style point lights
    pointLight1 = new THREE.PointLight(0xffd54f, 2.0, 20, 2);
    pointLight1.position.set(3, 5, 2);
    pointLight1.castShadow = true;
    pointLight1.shadow.mapSize.width = 2048;
    pointLight1.shadow.mapSize.height = 2048;
    scene.add(pointLight1);

    pointLight2 = new THREE.PointLight(0x9c27b0, 1.5, 15, 1.8);
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
    loader.load('Punk_Vibes_0928090414_generate.glb',
        function(gltf) {
            model = gltf.scene;
            console.log('Model loaded successfully:', model);

            // Enable shadows and enhance materials for maximum quality
            model.traverse(function(child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Enhance material properties for maximum quality
                    if (child.material) {
                        child.material.envMapIntensity = 1;
                        child.material.needsUpdate = true;

                        // Enable anisotropic filtering for textures
                        if (child.material.map) {
                            child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                            child.material.map.generateMipmaps = true;
                            child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                            child.material.map.magFilter = THREE.LinearFilter;
                        }

                        // Enhance normal maps if present
                        if (child.material.normalMap) {
                            child.material.normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        }

                        // Enhance roughness maps if present
                        if (child.material.roughnessMap) {
                            child.material.roughnessMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        }

                        // Enhance metalness maps if present
                        if (child.material.metalnessMap) {
                            child.material.metalnessMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
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
            animate();
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
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const canvas = document.getElementById('model-canvas');
    const container = canvas.parentElement;

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    // Maintain maximum quality on resize
    const pixelRatio = window.devicePixelRatio || 1;
    renderer.setPixelRatio(Math.max(pixelRatio, 4)); // Force minimum 4x resolution

    // Render at higher internal resolution then scale down (supersampling)
    const renderWidth = container.offsetWidth * 3; // Increased multiplier
    const renderHeight = container.offsetHeight * 3;
    renderer.setSize(renderWidth, renderHeight, false);
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = container.offsetHeight + 'px';
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Advanced lighting animations for cinematic effect
    const time = Date.now() * 0.001;
    const slowTime = time * 0.5;
    const fastTime = time * 2;

    // Animated accent lights with complex patterns
    if (accentLight1) {
        accentLight1.intensity = 0.8 + Math.sin(time * 1.2) * 0.4 + Math.cos(time * 2.1) * 0.2;
        accentLight1.position.x = 2 + Math.sin(time * 0.8) * 0.8;
        accentLight1.position.y = 1 + Math.cos(time * 0.6) * 0.4;
    }
    if (accentLight2) {
        accentLight2.intensity = 0.6 + Math.cos(time * 1.5) * 0.3 + Math.sin(time * 1.8) * 0.15;
        accentLight2.position.z = 2 + Math.cos(time * 0.7) * 0.6;
        accentLight2.position.x = -2 + Math.sin(time * 0.9) * 0.5;
    }

    // Animated volumetric point lights
    if (pointLight1) {
        pointLight1.intensity = 1.8 + Math.sin(slowTime * 1.3) * 0.6;
        pointLight1.position.y = 5 + Math.cos(slowTime * 0.8) * 1.2;
    }
    if (pointLight2) {
        pointLight2.intensity = 1.2 + Math.cos(slowTime * 1.1) * 0.5;
        pointLight2.position.x = -3 + Math.sin(slowTime * 0.9) * 0.8;
    }

    // Subtle rim light animation
    if (rimLight1) {
        rimLight1.intensity = 1.6 + Math.sin(fastTime * 0.3) * 0.4;
    }
    if (rimLight2) {
        rimLight2.intensity = 1.0 + Math.cos(fastTime * 0.25) * 0.3;
    }

    renderer.render(scene, camera);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);