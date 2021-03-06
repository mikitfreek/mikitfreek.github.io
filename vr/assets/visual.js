let virtualScene;
let VirtualScene = Class.extend({
    // Class constructor
    init: function () {
        'use strict';
        // Create a scene, a camera, a light and a WebGL renderer with Three.JS
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(120, 1, 1, 1000);
        this.scene.add(this.camera);
        this.light = new THREE.PointLight();
        this.light.position.set(-256, 256, -256);
        this.scene.add(this.light);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0004);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        // Define the container for the renderer
        this.container = jQuery('#visual');
        // Create the "world" : a 3D representation
        /*this.world = new World({
            color: 0xF5F5F5
        });
        this.scene.add(this.world.mesh);*/
        //
        this.figure = new Figure({
            color: 0x05d2e0,
            wireframe: true
        },
        {
            rotx: Math.PI/16,
            roty: -Math.PI/16,
            rotz: 0
        });
        this.scene.add(this.figure.obj);
        this.figure2 = new Figure({
            color: 0x05d2e0,
            wireframe: true
        },
        {
            // posx: 0,
            rotx: Math.PI/16,
            roty: Math.PI/16,
            rotz: Math.PI/2
        });
        this.scene.add(this.figure2.obj);
        this.figure3 = new Figure({
            color: 0x05d2e0,
            wireframe: true
        },
        {
            rotx: -Math.PI/16,
            roty: Math.PI/16,
            rotz: Math.PI
        });
        this.scene.add(this.figure3.obj);
        this.figure4 = new Figure({
            color: 0x05d2e0,
            wireframe: true
        },
        {
            rotx: -Math.PI/16,
            roty: -Math.PI/16,
            rotz: (3/2)*Math.PI
        });
        this.scene.add(this.figure4.obj);
        // Define the size of the renderer
        this.setAspect();
        // Insert the renderer in the container
        this.container.prepend(this.renderer.domElement);
        // Set the camera to look at our user's character
        this.setFocus(this.figure.obj); //world.mesh
        // Start the events handlers
        this.setWindow();
    },
    // Event handlers
    setWindow: function () {
        'use strict';
        // On resize
        jQuery(window).resize(function () {
            // Redefine the size of the renderer
            virtualScene.setAspect();
        });
    },
    // Defining the renderer's size
    setAspect: function () {
        'use strict';
        // Fit the container's full width
        let w = this.container.width(),
            // Fit the initial visible area's height
            h = jQuery(window).height() - this.container.offset().top;
        // Update the renderer and the camera
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    },
    // Updating the camera to follow and look at a given Object3D / Mesh
    setFocus: function (object) {
        'use strict';
        //this.camera.position.set(object.position.x, object.position.y + 128, object.position.z - 256);
        this.camera.position.set(object.position.x, object.position.y, object.position.z - 256);
        this.camera.lookAt(object.position);
    },
    // Update and draw the scene
    frame: function () {
        'use strict';
        // Run a new step of motions
        this.figure.motion();
        // Set the camera to look at our user's character
        //this.setFocus(this.figure.obj);//this.world.mesh
        // And draw !
        this.renderer.render(this.scene, this.camera);
    }
});

let World = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the different geometries composing the room
        let ground = new THREE.PlaneGeometry(512, 512),
            height = 128,
            walls = [
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height),
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height)
            ],
            obstacles = [
                new THREE.CubeGeometry(64, 128, 64)
            ],
            // Set the material, the "skin"
            material = new THREE.MeshLambertMaterial(args),
            i;
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();

        // Grid
        this.geometryGrid1 = new THREE.PlaneBufferGeometry(1000, 1000, 100, 100);
        this.materialGrid1 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, opacity: 0.1, transparent: true });
        this.grid1 = new THREE.Mesh(this.geometryGrid1, this.materialGrid1);
        this.grid1.rotation.order = 'YXZ';
        this.grid1.rotation.y = -Math.PI / 2;
        this.grid1.rotation.x = -Math.PI / 2;
        this.mesh.add(this.grid1);

        // Set and add the ground
        this.ground = new THREE.Mesh(ground, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.mesh.add(this.ground);
        // Set and add the walls
        this.walls = [];
        for (i = 0; i < walls.length; i += 1) {
            this.walls[i] = new THREE.Mesh(walls[i], material);
            this.walls[i].position.y = height / 2;
            this.mesh.add(this.walls[i]);
        }
        this.walls[0].rotation.y = -Math.PI / 2;
        this.walls[0].position.x = ground.width / 2;
        this.walls[1].rotation.y = Math.PI;
        this.walls[1].position.z = ground.height / 2;
        this.walls[2].rotation.y = Math.PI / 2;
        this.walls[2].position.x = -ground.width / 2;
        this.walls[3].position.z = -ground.height / 2;
        // Set and add the obstacles
        this.obstacles = [];
        for (i = 0; i < obstacles.length; i += 1) {
            this.obstacles[i] = new THREE.Mesh(obstacles[i], material);
            this.mesh.add(this.obstacles[i]);
        }
        this.obstacles[0].position.set(0, 0, 0);
    }
});

let Figure = Class.extend({
    // Class constructor
    init: function (args, pos) {
        'use strict';
        // Figure
        this.container = jQuery('#visual');
        let gridSize = 50,
            windowX = jQuery(window).height() - this.container.offset().top,
            windowY = this.container.width(),
            // Set the different geometries
            geom = new THREE.ConvexGeometry(), // .Geometry() is outdated
            material2 = new THREE.MeshBasicMaterial(args), //LambertMaterial
            // Calc grid values
            gridX = Math.ceil(windowX / gridSize),
            gridY = Math.ceil(windowY / gridSize);
        this.grid = [];
        // Render grid
        for (let y = 0; y < gridY; y++) {
            let currentY = y * gridSize;
            this.grid[y] = [];

            for (let x = 0; x < gridX; x++) {
                let currentX = x * gridSize;
                this.grid[y].push(new THREE.Vector3(currentX, currentY, Math.random() * 80));
            }
        }

        // Set the current animation step
        this.step = 0;

        // Create triangle strip
        for (let y = 0; y + 1 < this.grid.length; y++) {
            let current = this.grid[y];

            for (let x = 0; x + 1 < current.length; x++) {
                let arrayPosition = ((y * (current.length  - 1)) + x) * 3,

                    // triangle
                    v1 = this.grid[y][x],
                    v2 = this.grid[y + 1][x],
                    v3 = this.grid[y][x + 1];

                geom.vertices.push(v1);
                geom.vertices.push(v2);
                geom.vertices.push(v3);

                geom.faces.push(new THREE.Face3(arrayPosition, arrayPosition + 1, arrayPosition + 2));

            }
        }
        this.obj = new THREE.Mesh(geom, material2);
        
        //this.obj.position.setX( pos.posx );
        this.obj.rotation.x = pos.rotx;
        this.obj.rotation.y = pos.roty;
        this.obj.rotation.z = pos.rotz;
    },
    // Process the figure motions
    motion: function () {
        'use strict';
        this.move();
        return true;
    },
    // Move
    move: function () {
        'use strict';
        this.step += 1 / 4;
        return true;
    },
});



virtualScene = new VirtualScene();
function animate() {
    requestAnimationFrame(animate);

    virtualScene.frame();
}
animate();