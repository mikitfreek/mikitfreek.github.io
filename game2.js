var basicScene;
var BasicScene = Class.extend({
    // Class constructor
    init: function () {
        'use strict';
        // Create a scene, a camera, a light and a WebGL renderer with Three.JS
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
        this.scene.add(this.camera);
        this.light = new THREE.PointLight();
        this.light.position.set(-256, 256, -256);
        this.scene.add(this.light);
        this.renderer = new THREE.WebGLRenderer();
        // Define the container for the renderer
        this.container = jQuery('#basic-scene');
        // Create the user's character
        this.user = new Character({
            color: 0x7A43B6
        });
        this.scene.add(this.user.mesh);
        // Create the "world" : a 3D representation of the place we'll be putting our character in
        this.world = new World({
            color: 0xF5F5F5
        });
        this.scene.add(this.world.mesh);
        // Define the size of the renderer
        this.setAspect();
        // Insert the renderer in the container
        this.container.prepend(this.renderer.domElement);
        // Set the camera to look at our user's character
        this.setFocus(this.user.mesh);
        // Start the events handlers
        this.setControls();
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
                case 37:
                    controls.left = true;
                    break;
                case 38:
                    controls.up = true;
                    break;
                case 39:
                    controls.right = true;
                    break;
                case 40:
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
                case 37:
                    controls.left = false;
                    break;
                case 38:
                    controls.up = false;
                    break;
                case 39:
                    controls.right = false;
                    break;
                case 40:
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
            basicScene.setAspect();
        });
    },
    // Defining the renderer's size
    setAspect: function () {
        'use strict';
        // Fit the container's full width
        var w = this.container.width(),
            // Fit the initial visible area's height
            h = jQuery(window).height() - this.container.offset().top - 20;
        // Update the renderer and the camera
        this.renderer.setSize(w, h);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
    },
    // Updating the camera to follow and look at a given Object3D / Mesh
    setFocus: function (object) {
        'use strict';
        this.camera.position.set(object.position.x, object.position.y + 128, object.position.z - 256);
        this.camera.lookAt(object.position);
    },
    // Update and draw the scene
    frame: function () {
        'use strict';
        // Run a new step of the user's motions
        this.user.motion();
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
        var ground = new THREE.PlaneGeometry(512, 1024),
            height = 128,
            walls = [
                    new THREE.PlaneGeometry(ground.height, height),
                    new THREE.PlaneGeometry(ground.width, height),
                    new THREE.PlaneGeometry(ground.height, height),
                    new THREE.PlaneGeometry(ground.width, height)
            ],
            obstacles = [
                    new THREE.CubeGeometry(64, 64, 64)
            ],
            // Set the material, the "skin"
            material = new THREE.MeshLambertMaterial(args),
            i;
        // Set the "world" modelisation object
        this.mesh = new THREE.Object3D();
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
        this.obstacles[0].position.set(0, 32, 128);
    }
});
var Character = Class.extend({
    // Class constructor
    init: function (args) {
        'use strict';
        // Set the different geometries composing the humanoid
        var head = new THREE.SphereGeometry(32, 8, 8),
            hand = new THREE.SphereGeometry(8, 4, 4),
            foot = new THREE.SphereGeometry(16, 4, 4, 0, Math.PI * 2, 0, Math.PI / 2),
            nose = new THREE.SphereGeometry(4, 4, 4),
            // Set the material, the "skin"
            material = new THREE.MeshLambertMaterial(args);
        // Set the character modelisation object
        this.mesh = new THREE.Object3D();
        this.mesh.position.y = 48;
        // Set and add its head
        this.head = new THREE.Mesh(head, material);
        this.head.position.y = 0;
        this.mesh.add(this.head);
        // Set and add its hands
        this.hands = {
            left: new THREE.Mesh(hand, material),
            right: new THREE.Mesh(hand, material)
        };
        this.hands.left.position.x = -40;
        this.hands.left.position.y = -8;
        this.hands.right.position.x = 40;
        this.hands.right.position.y = -8;
        this.mesh.add(this.hands.left);
        this.mesh.add(this.hands.right);
        // Set and add its feet
        this.feet = {
            left: new THREE.Mesh(foot, material),
            right: new THREE.Mesh(foot, material)
        };
        this.feet.left.position.x = -20;
        this.feet.left.position.y = -48;
        this.feet.left.rotation.y = Math.PI / 4;
        this.feet.right.position.x = 20;
        this.feet.right.position.y = -48;
        this.feet.right.rotation.y = Math.PI / 4;
        this.mesh.add(this.feet.left);
        this.mesh.add(this.feet.right);
        // Set and add its nose
        this.nose = new THREE.Mesh(nose, material);
        this.nose.position.y = 0;
        this.nose.position.z = 32;
        this.mesh.add(this.nose);
        // Set the vector of the current motion
        this.direction = new THREE.Vector3(0, 0, 0);
        // Set the current animation step
        this.step = 0;
    },
    // Update the direction of the current motion
    setDirection: function (controls) {
        'use strict';
        // Either left or right, and either up or down (no jump or dive (on the Y axis), so far ...)
        var x = controls.left ? 1 : controls.right ? -1 : 0,
            y = 0,
            z = controls.up ? 1 : controls.down ? -1 : 0;
        this.direction.set(x, y, z);
    },
    // Process the character motions
    motion: function () {
        'use strict';
        // (if any)
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
        }
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
        this.mesh.position.x += this.direction.x * ((this.direction.z === 0) ? 4 : Math.sqrt(8));
        this.mesh.position.z += this.direction.z * ((this.direction.x === 0) ? 4 : Math.sqrt(8));
        // Now let's use Sine and Cosine curves, using our "step" property ...
        this.step += 1 / 4;
        // ... to slightly move our feet and hands
        this.feet.left.position.setZ(Math.sin(this.step) * 16);
        this.feet.right.position.setZ(Math.cos(this.step + (Math.PI / 2)) * 16);
        this.hands.left.position.setZ(Math.cos(this.step + (Math.PI / 2)) * 8);
        this.hands.right.position.setZ(Math.sin(this.step) * 8);
    },
    collide: function () {
        'use strict';
        // INSERT SOME MAGIC HERE
        return false;
    }
});
basicScene = new BasicScene();
function animate () {
    requestAnimationFrame(animate);
    basicScene.frame();
}
animate();