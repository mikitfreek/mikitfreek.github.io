import * as THREE from './assets/build/three.module.js';

import { OrbitControls } from './assets/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './assets/jsm/loaders/GLTFLoader.js';
import { LightProbeGenerator } from './assets/jsm/lights/LightProbeGenerator.js';
import { Water } from './assets/jsm/objects/Water2.js';

var virtualScene;
var VirtualScene = Class.extend({
    // Class constructor
    init: function () {
        'use strict';
        // Create a scene, a camera, a light and a WebGL renderer with Three.JS
        this.scene = new THREE.Scene();
        this.gltfLoader = new GLTFLoader();
        this.camera = new THREE.PerspectiveCamera(44, 1, 1, 10000);
        this.scene.add(this.camera);
        this.light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        //this.light.position.set(-5,9, -0);
        this.light.position.set(-1,1, -1);
        this.scene.add(this.light);
        this.scene.fog = new THREE.FogExp2(0xdddddd,0.0003);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.outputEncoding = THREE.GammaEncoding;//THREE.sRGBEncoding;
        this.renderer.gammaFactor = 1.1;
        // Define the container for the renderer
        this.container = jQuery('#game');
        // Create the user's character
        // this.user = new Character({
        //     color: 0x7A43B6
        // });
        
        this.user = new Sailboat({
            //color: 0x7A43B6
        });
        this.scene.add(this.user.mesh);
        this.enemy = new Enemyboat({
            //color: 0x7A43B6
        });
        this.scene.add(this.enemy.mesh);
        //this.scene.add(this.user.boat);
        
        // light probe
		this.lightProbe = new THREE.LightProbe();
        this.scene.add( this.lightProbe );
        // envmap
        const genCubeUrls = function ( prefix, postfix ) {
            return [
                prefix + 'px' + postfix, prefix + 'nx' + postfix,
                prefix + 'py' + postfix, prefix + 'ny' + postfix,
                prefix + 'pz' + postfix, prefix + 'nz' + postfix
            ];
        };
        this.urls = genCubeUrls( 'assets/textures/cube/sky/', '.jpg' );
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.cubeTextureLoader.load( this.urls, (cubeTexture) => {
            cubeTexture.encoding = THREE.sRGBEncoding;
            this.scene.background = cubeTexture;
            this.lightProbe.copy( LightProbeGenerator.fromCubeTexture(cubeTexture) );
            //const geometry = new THREE.SphereGeometry( 5, 64, 32 );
            //    const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );
            // const ground = new THREE.PlaneGeometry(15000, 15000),
            //       materialWater = new THREE.MeshStandardMaterial( {
            //     color: 0x007890,//00ACBD,
            //     metalness: 0.4,
            //     roughness: 0.8,
            //     envMap: cubeTexture,
            //     envMapIntensity: 1,
            //     opacity: 1, 
            //     transparent: true
            // } );
            // Set and add the ground
            // this.ground = new THREE.Mesh(ground, materialWater);
            // this.ground.rotation.x = -Math.PI / 2;
            // this.scene.add(this.ground);
            // water
            const params = {
                color: '#00ACBD',
                scale: 16,
                flowX: 0.3,
                flowY: 0.3
            };
            const waterGeometry = new THREE.PlaneGeometry( 9000, 9000 );
            this.water = new Water( waterGeometry, {
                color: params.color,
                scale: params.scale,
                flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
                textureWidth: 1024,
                textureHeight: 1024
            } );
            this.water.position.y = 1;
            this.water.rotation.x = Math.PI * - 0.5;
            this.scene.add(this.water);
        } );

        

        // Create the "world" : a 3D representation of the place we'll be putting our character in
        this.world = new World({
            //color: 0x0061bd
        });
        this.scene.add(this.world.mesh);
        //this.degFocus;
        // Define the size of the renderer
        this.setAspect();
        // Insert the renderer in the container
        this.container.prepend(this.renderer.domElement);
        // Set the camera to look at our user's character
        this.setFocus(this.user.mesh);
        // Start the events handlers
        this.setControls();
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        //this.controls.addEventListener( 'change', animate );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        //this.controls.enableRotate = false;
        //this.controls.autoRotate = true;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        //this.controls.maxPolarAngle = Math.PI / 2;
        // this.controls.mouseButtons = {
        //         LEFT: THREE.MOUSE.ROTATE,
        //         MIDDLE: THREE.MOUSE.DOLLY,
        //         RIGHT: THREE.MOUSE.PAN
        // }
    },
    // Event handlers
    setControls: function () {
        'use strict';
        // Within jQuery's methods, we won't be able to access "this"
        var user = this.user,
            // State of the different controls
            controls = {
                left: false,
                up: false,
                right: false,
                down: false
            };
        // When the user presses a key 
        jQuery(document).keydown(function (e) {
            var prevent = true;
            // Update the state of the attached control to "true"
            switch (e.keyCode) {
                case 65: //37
                    controls.left = true;
                    break;
                case 87: //38
                    controls.up = true;
                    break;
                case 68: //39
                    controls.right = true;
                    break;
                case 83: //40
                    controls.down = true;
                    break;
                default:
                    prevent = false;
            }
            // Avoid the browser to react unexpectedly
            if (prevent) {
                e.preventDefault();
            } else {
                return;
            }
            // Update the character's direction
            user.setDirection(controls);
        });
        // When the user releases a key
        jQuery(document).keyup(function (e) {
            var prevent = true;
            // Update the state of the attached control to "false"
            switch (e.keyCode) {
                case 65:
                    controls.left = false;
                    break;
                case 87:
                    controls.up = false;
                    break;
                case 68:
                    controls.right = false;
                    break;
                case 83:
                    controls.down = false;
                    break;
                default:
                    prevent = false;
            }
            // Avoid the browser to react unexpectedly
            if (prevent) {
                e.preventDefault();
            } else {
                return;
            }
            // Update the character's direction
            user.setDirection(controls);
        });
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
        var w = this.container.width(),
            // Fit the initial visible area's height
            h = jQuery(window).height() - this.container.offset().top; // - 20
        // Update the renderer and the camera
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    },
    // Updating the camera to follow and look at a given Object3D / Mesh
    setFocus: function (object) {
        'use strict';
        this.zoomFocus = 256*2;
        this.degFocus = 128;
        //this.camera.position.set(object.position.x, object.position.y + 128, object.position.z - 256);
        this.camera.position.set(object.position.x + this.degFocus, object.position.y + this.zoomFocus, object.position.z - this.zoomFocus);
        //this.camera.position.set( 20, 20, 20 );
        this.camera.lookAt(object.position);
    },
    // Set obstacles to interact with
    getFocus: function () {
        'use strict';
        return this.degFocus;
    },
    // Update and draw the scene
    frame: function () {
        'use strict';
        // Run a new step of the user's motions
        this.user.motion(this.user.controls);
        // Set the camera to look at our user's character
        this.setFocus(this.user.mesh);
        // And draw !
        this.renderer.render(this.scene, this.camera);
    }
});

var World = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the different geometries composing the room
        var ground = new THREE.PlaneGeometry(9000, 9000),
            height = 128,
            walls = [
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height),
                new THREE.PlaneGeometry(ground.height, height),
                new THREE.PlaneGeometry(ground.width, height)
            ],
            obstacles = [
                //new THREE.BoxGeometry(64, 64, 64)
            ],
            // inWall = new THREE.BoxGeometry( 64, 64, 12),
            // inWalls = [],
            // Set the material, the "skin"
            material = new THREE.MeshToonMaterial(args),
            //materialWater = new THREE.MeshPhongMaterial({ color: 0x00ACBD, metalness: 0, roughness: 0, envMap: cubeTexture, envMapIntensity: 1, opacity: 0.5, transparent: true }),
            i;
        //walls
        // inWalls.length = 0;//32;
        // for (i = 0; i < inWalls.length; i += 1) {
        //     obstacles.push(inWall);
        // }
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();

        // 3D Model
        this.gltfLoader = new GLTFLoader();
        this.coliseum = 'assets/models/Coliseum/Coliseum.gltf';
        this.gltfLoader.load(this.coliseum, (gltf) => {
            this.obj = gltf.scene;
            this.obj.scale.set(9,9,9);
            this.obj.position.y = -695;
            this.mesh.add(this.obj);
        });
        
        // Grid
        // this.geometryGrid = new THREE.PlaneBufferGeometry(9000, 9000, 1000, 1000);
        // this.materialGrid = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, wireframe: true, wireframeLinewidth: "30", opacity: 0.12, transparent: true });
        // this.grid = new THREE.Mesh(this.geometryGrid, this.materialGrid);
        // this.grid.rotation.order = 'YXZ';
        // this.grid.rotation.y = - Math.PI / 2;
        // this.grid.rotation.x = - Math.PI / 2;
        // this.mesh.add(this.grid);

        // Set and add the ground
        // this.ground = new THREE.Mesh(ground, materialWater);
        // this.ground.rotation.x = -Math.PI / 2;
        // this.mesh.add(this.ground);

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
        //this.obstacles[0].position.set(0, 32, 128);
        //this.obstacles[1].position.set(0, 32, 256);
        //this.obstacles[2].position.set(64, 32, 256);
        // cd walls
        /*for (i = 0; i <= inWalls.length; i += 1) {
            if(i<8)           this.obstacles[i+1].position.set( -(224 - (64 * i )), 32, 256 );
            if(i<16 && i>=8){ this.obstacles[i+1].position.set( 256, 32, (224 - (64 * (i - 8))) ); 
                              this.obstacles[i+1].rotation.y = -Math.PI / 2; }
            if(i<24 && i>=16) this.obstacles[i+1].position.set( (224 - (64 * (i - 16))), 32, -256);
            if(i<32 && i>=24){this.obstacles[i+1].position.set( -256, 32, - (224 - (64 * (i - 24))) ); 
                              this.obstacles[i+1].rotation.y = Math.PI / 2; }
        }*/
    },
    // Set obstacles to interact with
    getObstacles: function () {
        'use strict';
        return this.obstacles.concat(this.walls);
    }
});

var Character = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';

        // Set the different geometries composing the humanoid
        var head = new THREE.BoxGeometry(10, 10, 10),
            neck = new THREE.BoxGeometry(5, 5, 5),
            body = new THREE.BoxGeometry(14, 16, 8),
            hand = new THREE.BoxGeometry(3, 20, 3),
            foot = new THREE.BoxGeometry(5, 20, 5),
            nose = new THREE.SphereGeometry(1, 3, 1),
            // Set the material, the "skin"
            material = new THREE.MeshLambertMaterial(args);
        // Set the character modelisation object
        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 48;
        // Set and add its head
        this.head = new THREE.Mesh(head, material);
        this.head.position.z = 1;
        this.head.position.y = 0;
        this.mesh.add(this.head);
        // Set and add its neck
        this.neck = new THREE.Mesh(neck, material);
        this.neck.position.y = -7;
        this.neck.position.z = 0.5;
        this.mesh.add(this.neck);
        // Set and add its body 
        this.body = new THREE.Mesh(body, material);
        this.body.position.y = -17;
        this.body.position.z = -0.1;
        this.mesh.add(this.body);
        // Set and add its hands
        this.hands = {
            left: new THREE.Mesh(hand, material),
            right: new THREE.Mesh(hand, material)
        };
        this.hands.left.position.x = 9;
        this.hands.left.position.y = -19;
        this.hands.left.position.z = -2;
        this.hands.right.position.x = -9;
        this.hands.right.position.y = -19;
        this.hands.left.position.z = -2;
        this.mesh.add(this.hands.left);
        this.mesh.add(this.hands.right);
        // Set and add its feet
        this.feet = {
            left: new THREE.Mesh(foot, material),
            right: new THREE.Mesh(foot, material)
        };
        this.feet.left.position.x = 4;
        this.feet.left.position.y = -35;
        //this.feet.left.rotation.x = Math.PI / 4;
        this.feet.right.position.x = -4;
        this.feet.right.position.y = -35;
        //this.feet.right.rotation.y = Math.PI / 4;
        this.mesh.add(this.feet.left);
        this.mesh.add(this.feet.right);
        // Set and add its nose
        this.nose = new THREE.Mesh(nose, material);
        this.nose.position.y = 0;
        this.nose.position.z = 6;
        this.mesh.add(this.nose);

        // Set the vector of the current motion
        this.direction = new THREE.Vector3(0, 0, 0);
        // Set the current animation step
        this.step = 0;
        // Set the rays : one vector for every potential direction
        this.rays = [
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(-1, 0, -1),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 1)
        ];
        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();
    },
    // Test and avoid collisions
    collision: function () {
        'use strict';
        var collisions, i,
            // Maximum distance from the origin before we consider collision
            distance = 24,
            // Get the obstacles array from our world
            obstacles = virtualScene.world.getObstacles();
        // For each ray
        //edit
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
                    this.direction.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
                    this.direction.setZ(0);
                }
                if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
                    this.direction.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
                    this.direction.setX(0);
                }
            }
        }
        //endEdit
        /*
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
                    this.direction.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
                    this.direction.setZ(0);
                }
                if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
                    this.direction.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
                    this.direction.setX(0);
                }
            }
        }
        */
    },
    // Update the direction of the current motion
    setDirection: function (controls) {
        'use strict';
        // Either left or right, and either up or down (no jump or dive (on the Y axis), so far ...)
        var x = controls.left ? 1 : controls.right ? -1 : 0,
            y = 0,
            z = controls.up ? 1 : controls.down ? -1 : 0;
        // fix for camera rotate position
        let deg = virtualScene.getFocus() / 256;
        //console.log(virtualScene.getFocus());
        //x += controls.up ? -deg : controls.down ? deg : 0;
        //z += controls.left ? deg : controls.right ? -deg : 0;
        this.direction.set(x, y, z);
    },
    // Process the character motions
    motion: function () {
        'use strict';
        // Update the directions if we intersect with an obstacle
        this.collision();
        // If we're not static
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // Move the character
            this.move();
            return true;
        }
        /*/ (if any)
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // And, only if we're not colliding with an obstacle or a wall ...
            if (this.collide()) {
                return false;
            }
            // ... we move the character
            this.move();
            return true;
        }*/ //old
    },
    // Rotate the character
    rotate: function () {
        'use strict';
        // Set the direction's angle, and the difference between it and our Object3D's current rotation
        var angle = Math.atan2(this.direction.x, this.direction.z),
            difference = angle - this.mesh.rotation.y;
        // If we're doing more than a 180°
        if (Math.abs(difference) > Math.PI) {
            // We proceed to a direct 360° rotation in the opposite way
            if (difference > 0) {
                this.mesh.rotation.y += 2 * Math.PI;
            } else {
                this.mesh.rotation.y -= 2 * Math.PI;
            }
            // And we set a new smarter (because shorter) difference
            difference = angle - this.mesh.rotation.y;
            // In short : we make sure not to turn "left" to go "right"
        }
        // Now if we haven't reached our target angle
        if (difference !== 0) {
            // We slightly get closer to it
            this.mesh.rotation.y += difference / 4;
        }
    },
    move: function () {
        'use strict';
        // We update our Object3D's position from our "direction"
        this.mesh.position.x += this.direction.x * ((this.direction.z === 0) ? 4 : Math.sqrt(2));
        this.mesh.position.z += this.direction.z * ((this.direction.x === 0) ? 4 : Math.sqrt(2));
        // Now let's use Sine and Cosine curves, using our "step" property ...
        this.step += 1 / 4;
        // ... to slightly move our feet
        this.feet.left.position.setZ(Math.sin(this.step - (Math.PI / 2)) * 2);
        this.feet.right.position.setZ((Math.cos(this.step) * 2));
        this.feet.left.rotation.x = Math.cos(this.step) / 4;//+ (Math.PI / 2)
        this.feet.right.rotation.x = Math.sin(this.step - (Math.PI / 2)) / 4; //feet (Math.sin(this.step) + (Math.PI / 2)) / 4;
        //hands
        this.hands.left.position.setZ(Math.cos(this.step + (Math.PI)) * 1);
        this.hands.right.position.setZ(Math.sin(this.step + (Math.PI / 2)) * 1);
        this.hands.left.rotation.x = Math.cos(this.step) / 16;
        this.hands.right.rotation.x = Math.sin(this.step - (Math.PI / 2)) / 16;
        this.hands.left.rotation.z = Math.cos(this.step) / 42;
        this.hands.right.rotation.z = Math.cos(this.step) / 36;
        //head
        this.head.rotation.z = Math.cos(this.step - (Math.PI / 2)) / 64;
        //body
        this.body.rotation.z = Math.cos(this.step) / 42;
    },
    /*collide: function () {
        'use strict';
        // INSERT SOME MAGIC HERE
        return false;
    }*/
});

var Sailboat = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // obstacles = virtualScene.world.getObstacles();

        // 3D Model
        this.gltfLoader = new GLTFLoader();
        this.mesh = new THREE.Object3D();
        this.sailboat = 'assets/models/sailboat/model.gltf';
        this.gltfLoader.load(this.sailboat, (gltf) => {
            this.obj = gltf.scene;
            this.obj.scale.set(120,120,120);
            this.obj.position.y = -86;
            this.obj.position.x = 48;
            this.obj.position.z = 35;
            this.obj.rotation.y = 2.4;
            this.obj.rotation.x = -0.05; //sink
            this.mesh.add(this.obj);
        });

        // Set the vector of the current motion
        this.direction = new THREE.Vector3(0, 0, 0);
        // Set the current animation step
        this.step = 0;
        // Set the rays : one vector for every potential direction
        this.rays = [
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(-1, 0, -1),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 1)
        ];
        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();
    },
    // Test and avoid collisions
    collision: function () {
        'use strict';
        var collisions, i,
            // Maximum distance from the origin before we consider collision
            distance = 24,
            // Get the obstacles array from our world
            obstacles = virtualScene.world.getObstacles();
        // For each ray
        //edit
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
                    this.direction.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
                    this.direction.setZ(0);
                }
                if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
                    this.direction.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
                    this.direction.setX(0);
                }
            }
        }
        //endEdit
        /*
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
                    this.direction.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
                    this.direction.setZ(0);
                }
                if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
                    this.direction.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
                    this.direction.setX(0);
                }
            }
        }
        */
    },
    // Update the direction of the current motion
    setDirection: function (controls) {
        'use strict';
        // Either left or right, and either up or down (no jump or dive (on the Y axis), so far ...)
        var x = controls.left ? 1 : controls.right ? -1 : 0,
            y = 0,
            z = controls.up ? 1 : controls.down ? -1 : 0;
        // fix for camera rotate position
        let deg = virtualScene.getFocus() / 256;
        //console.log(virtualScene.getFocus());
        //x += controls.up ? -deg : controls.down ? deg : 0;
        //z += controls.left ? deg : controls.right ? -deg : 0;
        this.direction.set(x, y, z);
    },
    // Process the character motions
    motion: function () {
        'use strict';
        // Update the directions if we intersect with an obstacle
        this.collision();
        // If we're not static
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // Move the character
            if (this.direction.x !== 0 || this.direction.z !== 0) this.move();
            return true;
        }
        /*/ (if any)
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // And, only if we're not colliding with an obstacle or a wall ...
            if (this.collide()) {
                return false;
            }
            // ... we move the character
            this.move();
            return true;
        }*/ //old
    },
    // Rotate the character
    rotate: function () {
        'use strict';
        // Set the direction's angle, and the difference between it and our Object3D's current rotation
        var angle = Math.atan2(this.direction.x, this.direction.z),
            difference = angle - this.mesh.rotation.y;
        // If we're doing more than a 180°
        if (Math.abs(difference) > Math.PI) {
            // We proceed to a direct 360° rotation in the opposite way
            if (difference > 0) {
                this.mesh.rotation.y += 2 * Math.PI;
            } else {
                this.mesh.rotation.y -= 2 * Math.PI;
            }
            // And we set a new smarter (because shorter) difference
            difference = angle - this.mesh.rotation.y;
            // In short : we make sure not to turn "left" to go "right"
        }
        // Now if we haven't reached our target angle
        if (difference !== 0) {
            // We slightly get closer to it
            //this.mesh.rotation.y += Math.log(1 + difference) / 128;
            this.mesh.rotation.y += difference / 128;
        }
    },
    move: function () {
        'use strict';
        // We update our Object3D's position from our "dwwirecaaation"
        let vel = 0.001 + Math.log(1 + (this.step/10));
        this.mesh.position.x += this.direction.x * ((this.direction.z === 0) ? Math.sqrt(vel) : vel/1.5);//Math.sqrt(vel));
        this.mesh.position.z += this.direction.z * ((this.direction.x === 0) ? Math.sqrt(vel) : vel/1.5);//Math.sqrt(vel));
        // Now let's use Sine and Cosine curves, using our "step" property ...
        this.step += 1 / 4;
        /*// ... to slightly move our feet
        this.feet.left.position.setZ(Math.sin(this.step - (Math.PI / 2)) * 2);
        this.feet.right.position.setZ((Math.cos(this.step) * 2));
        this.feet.left.rotation.x = Math.cos(this.step) / 4;//+ (Math.PI / 2)
        this.feet.right.rotation.x = Math.sin(this.step - (Math.PI / 2)) / 4; //feet (Math.sin(this.step) + (Math.PI / 2)) / 4;
        //hands
        this.hands.left.position.setZ(Math.cos(this.step + (Math.PI)) * 1);
        this.hands.right.position.setZ(Math.sin(this.step + (Math.PI / 2)) * 1);
        this.hands.left.rotation.x = Math.cos(this.step) / 16;
        this.hands.right.rotation.x = Math.sin(this.step - (Math.PI / 2)) / 16;
        this.hands.left.rotation.z = Math.cos(this.step) / 42;
        this.hands.right.rotation.z = Math.cos(this.step) / 36;
        //head
        this.head.rotation.z = Math.cos(this.step - (Math.PI / 2)) / 64;
        //body
        this.body.rotation.z = Math.cos(this.step) / 42;*/
    },
    /*collide: function () {
        'use strict';
        // INSERT SOME MAGIC HERE
        return false;
    }*/
});

var Enemyboat = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // obstacles = virtualScene.world.getObstacles();

        // 3D Model
        this.gltfLoader = new GLTFLoader();
        this.mesh = new THREE.Object3D();
        this.sailboat = 'assets/models/sailboat/model.gltf';
        this.gltfLoader.load(this.sailboat, (gltf) => {
            this.obj = gltf.scene;
            this.obj.scale.set(120,120,120);
            this.obj.position.y = -86;
            this.obj.position.x = 48;
            this.obj.position.z = 35;
            this.obj.rotation.y = 2.4;
            this.obj.rotation.x = -0.05; //sink
            this.mesh.add(this.obj);
        });
        this.mesh.position.x = 180;
        // Set the vector of the current motion
        this.direction = new THREE.Vector3(0, 0, 0);
        // Set the current animation step
        this.step = 0;
        // Set the rays : one vector for every potential direction
        this.rays = [
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(0, 0, -1),
            new THREE.Vector3(-1, 0, -1),
            new THREE.Vector3(-1, 0, 0),
            new THREE.Vector3(-1, 0, 1)
        ];
        // And the "RayCaster", able to test for intersections
        this.caster = new THREE.Raycaster();
    },
    // Test and avoid collisions
    collision: function () {
        'use strict';
        var collisions, i,
            // Maximum distance from the origin before we consider collision
            distance = 24,
            // Get the obstacles array from our world
            obstacles = virtualScene.world.getObstacles();
        // For each ray
        //edit
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
                    this.direction.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
                    this.direction.setZ(0);
                }
                if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
                    this.direction.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
                    this.direction.setX(0);
                }
            }
        }
        //endEdit
        /*
        for (i = 0; i < this.rays.length; i += 1) {
            // We reset the raycaster to this direction
            this.caster.set(this.mesh.position, this.rays[i]);
            // Test if we intersect with any obstacle mesh
            collisions = this.caster.intersectObjects(obstacles);
            // And disable that direction if we do
            if (collisions.length > 0 && collisions[0].distance <= distance) {
                // Yep, this.rays[i] gives us : 0 => up, 1 => up-left, 2 => left, ...
                if ((i === 0 || i === 1 || i === 7) && this.direction.z === 1) {
                    this.direction.setZ(0);
                } else if ((i === 3 || i === 4 || i === 5) && this.direction.z === -1) {
                    this.direction.setZ(0);
                }
                if ((i === 1 || i === 2 || i === 3) && this.direction.x === 1) {
                    this.direction.setX(0);
                } else if ((i === 5 || i === 6 || i === 7) && this.direction.x === -1) {
                    this.direction.setX(0);
                }
            }
        }
        */
    },
    // Update the direction of the current motion
    setDirection: function (controls) {
        'use strict';
        // Either left or right, and either up or down (no jump or dive (on the Y axis), so far ...)
        var x = controls.left ? 1 : controls.right ? -1 : 0,
            y = 0,
            z = controls.up ? 1 : controls.down ? -1 : 0;
        // fix for camera rotate position
        let deg = virtualScene.getFocus() / 256;
        //console.log(virtualScene.getFocus());
        //x += controls.up ? -deg : controls.down ? deg : 0;
        //z += controls.left ? deg : controls.right ? -deg : 0;
        this.direction.set(x, y, z);
    },
    // Process the character motions
    motion: function () {
        'use strict';
        // Update the directions if we intersect with an obstacle
        this.collision();
        // If we're not static
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // Move the character
            if (this.direction.x !== 0 || this.direction.z !== 0) this.move();
            return true;
        }
        /*/ (if any)
        if (this.direction.x !== 0 || this.direction.z !== 0) {
            // Rotate the character
            this.rotate();
            // And, only if we're not colliding with an obstacle or a wall ...
            if (this.collide()) {
                return false;
            }
            // ... we move the character
            this.move();
            return true;
        }*/ //old
    },
    // Rotate the character
    rotate: function () {
        'use strict';
        // Set the direction's angle, and the difference between it and our Object3D's current rotation
        var angle = Math.atan2(this.direction.x, this.direction.z),
            difference = angle - this.mesh.rotation.y;
        // If we're doing more than a 180°
        if (Math.abs(difference) > Math.PI) {
            // We proceed to a direct 360° rotation in the opposite way
            if (difference > 0) {
                this.mesh.rotation.y += 2 * Math.PI;
            } else {
                this.mesh.rotation.y -= 2 * Math.PI;
            }
            // And we set a new smarter (because shorter) difference
            difference = angle - this.mesh.rotation.y;
            // In short : we make sure not to turn "left" to go "right"
        }
        // Now if we haven't reached our target angle
        if (difference !== 0) {
            // We slightly get closer to it
            //this.mesh.rotation.y += Math.log(1 + difference) / 128;
            this.mesh.rotation.y += difference / 128;
        }
    },
    move: function () {
        'use strict';
        // We update our Object3D's position from our "dwwirecaaation"
        let vel = 0.001 + Math.log(1 + (this.step/10));
        this.mesh.position.x += this.direction.x * ((this.direction.z === 0) ? Math.sqrt(vel) : vel/1.5);//Math.sqrt(vel));
        this.mesh.position.z += this.direction.z * ((this.direction.x === 0) ? Math.sqrt(vel) : vel/1.5);//Math.sqrt(vel));
        // Now let's use Sine and Cosine curves, using our "step" property ...
        this.step += 1 / 4;
        /*// ... to slightly move our feet
        this.feet.left.position.setZ(Math.sin(this.step - (Math.PI / 2)) * 2);
        this.feet.right.position.setZ((Math.cos(this.step) * 2));
        this.feet.left.rotation.x = Math.cos(this.step) / 4;//+ (Math.PI / 2)
        this.feet.right.rotation.x = Math.sin(this.step - (Math.PI / 2)) / 4; //feet (Math.sin(this.step) + (Math.PI / 2)) / 4;
        //hands
        this.hands.left.position.setZ(Math.cos(this.step + (Math.PI)) * 1);
        this.hands.right.position.setZ(Math.sin(this.step + (Math.PI / 2)) * 1);
        this.hands.left.rotation.x = Math.cos(this.step) / 16;
        this.hands.right.rotation.x = Math.sin(this.step - (Math.PI / 2)) / 16;
        this.hands.left.rotation.z = Math.cos(this.step) / 42;
        this.hands.right.rotation.z = Math.cos(this.step) / 36;
        //head
        this.head.rotation.z = Math.cos(this.step - (Math.PI / 2)) / 64;
        //body
        this.body.rotation.z = Math.cos(this.step) / 42;*/
    },
    /*collide: function () {
        'use strict';
        // INSERT SOME MAGIC HERE
        return false;
    }*/
});

virtualScene = new VirtualScene();
function animate() {
    requestAnimationFrame(animate);
    virtualScene.frame();
}
animate();