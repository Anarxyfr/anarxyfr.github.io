// Create and set up the main container
const container = document.createElement('div');
document.body.appendChild(container);

// Create controls
const controlsDiv = document.createElement('div');
controlsDiv.id = 'controls';
controlsDiv.style.position = 'absolute';
controlsDiv.style.top = '10px';
controlsDiv.style.left = '10px';
controlsDiv.style.background = 'rgba(255, 255, 255, 0.8)';
controlsDiv.style.padding = '10px';
controlsDiv.style.borderRadius = '5px';
controlsDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
container.appendChild(controlsDiv);

// Add control elements
controlsDiv.innerHTML = `
    <h2>Controls</h2>
    <h5>By @anarxyfr on discord</h5>
    <button onclick="changeShape('cube')">Cube</button>
    <button onclick="changeShape('sphere')">Sphere</button>
    <button onclick="changeShape('cone')">Cone</button>
    <button onclick="resetZoom()">Reset Zoom</button><br><br>
    <label><input type="checkbox" id="toggleEdges" onclick="toggleEdges()" checked> Toggle Edges</label><br>
    <label><input type="checkbox" id="toggleWireframe" onclick="toggleWireframe()"> Wireframe</label>
`;

// Load Three.js library
const script = document.createElement('script');
script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
script.onload = init; // Call init function after the script loads
document.head.appendChild(script);

function init() {
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();

    // Adding lights to the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light
    directionalLight.position.set(5, 10, 7.5); // Positioning the light
    scene.add(directionalLight);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Set the size of the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create initial shape as a cube
    let currentShape = 'cube';
    let shapeMesh;
    let edges;
    let isWireframe = false;

    function createCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x0077ff, transparent: true, opacity: 0.8 });
        return new THREE.Mesh(geometry, material);
    }

    function createSphere() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x0077ff, transparent: true, opacity: 0.8 });
        return new THREE.Mesh(geometry, material);
    }

    function createCone() {
        const geometry = new THREE.ConeGeometry(0.5, 1, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x0077ff, transparent: true, opacity: 0.8 });
        return new THREE.Mesh(geometry, material);
    }

    // Function to change the shape
    window.changeShape = function(shape) {
        currentShape = shape;

        // Remove the current shape from the scene if it exists
        if (shapeMesh) {
            scene.remove(shapeMesh);
            if (edges) {
                scene.remove(edges);
            }
        }

        // Create the new shape
        switch (currentShape) {
            case 'cube':
                shapeMesh = createCube();
                break;
            case 'sphere':
                shapeMesh = createSphere();
                break;
            case 'cone':
                shapeMesh = createCone();
                break;
        }

        // Create edges for the new shape
        const edgesGeometry = new THREE.EdgesGeometry(shapeMesh.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        shapeMesh.add(edges);

        // Add the new shape to the scene
        scene.add(shapeMesh);

        // Add axes to the new shape
        const axesHelper = new THREE.AxesHelper(1);
        shapeMesh.add(axesHelper);
    };

    // Create the initial shape
    changeShape(currentShape);

    // Create a ground plane
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.rotation.x = Math.PI / 2; // Rotate the plane to be horizontal
    scene.add(groundPlane);

    // Position the camera
    camera.position.z = 5;

    // Mouse movement variables
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    // Mouse event handlers
    window.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    window.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaX = event.clientX - previousMouseX;
            const deltaY = event.clientY - previousMouseY;

            // Rotate the shape based on mouse movement
            shapeMesh.rotation.y += deltaX * 0.01;
            shapeMesh.rotation.x += deltaY * 0.01;

            // Update previous mouse position
            previousMouseX = event.clientX;
            previousMouseY = event.clientY;
        }
    });

    // Zoom functionality
    let zoomSpeed = 0.001; // Adjust zoom speed here (lower value for slower zoom)
    let targetZoom = camera.position.z;
    const initialZoom = camera.position.z; // Store initial zoom level

    window.addEventListener('wheel', (event) => {
        event.preventDefault(); // Prevent the page from scrolling
        targetZoom += event.deltaY * zoomSpeed; // Adjust target zoom based on scroll

        // Limit zoom range
        targetZoom = Math.max(1, Math.min(20, targetZoom)); // Set min and max zoom levels
    });

    // Reset zoom function
    window.resetZoom = function() {
        targetZoom = initialZoom; // Reset to initial zoom level
    };

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        camera.position.z += (targetZoom - camera.position.z) * 0.1; // Smooth transition to target zoom
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Toggle edges visibility
    window.toggleEdges = function() {
        if (edges) {
            edges.visible = !edges.visible;
        }
    };

    // Toggle wireframe
    window.toggleWireframe = function() {
        isWireframe = !isWireframe;
        shapeMesh.material.wireframe = isWireframe; // Toggle wireframe mode
    };

    // Reset rotation
    function resetRotation() {
        shapeMesh.rotation.set(0, 0, 0);
    }
}