// Scene
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight, d = 20;
const camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xffffff, 0);
renderer.set
document.body.appendChild( renderer.domElement );

// Camera
// method 1 - use lookAt (better performace)
//camera.position.set( 20, 20, 20 );
//camera.lookAt( scene.position );
// method 2 - set the x-component of rotation
camera.position.set( 20, 20, 20 );
camera.rotation.order = 'YXZ';
camera.rotation.y = - Math.PI / 4;
camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );

// Controls
let posX = 0, posZ = 3, posY = 0;

controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls.addEventListener( 'change', animate );
controls.enableRotate = false;
controls.enableZoom = true;
controls.enablePan = true;
controls.maxPolarAngle = Math.PI / 2;


// Objects

//cube2
const geometry2 = new THREE.BoxGeometry( 2, 6, 2 );
const material2 = new THREE.MeshNormalMaterial();
cube2 = new THREE.Mesh( geometry2, material2 );
cube2.position.set(posX, posZ, posY);
scene.add( cube2 );

// Ambient
scene.add( new THREE.AmbientLight( 0x444444 ) );

// Light
const light = new THREE.PointLight( 0xffffff, 0.8 );
light.position.set( 0, 50, 50 );
scene.add( light );

// Axes
//scene.add( new THREE.AxesHelper( 40 ) );

// Grid
const geometryGrid = new THREE.PlaneBufferGeometry( 100, 100, 10, 10 );
const materialGrid = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe: true, opacity: 0.15, transparent: true } );
const grid = new THREE.Mesh( geometryGrid, materialGrid );
grid.rotation.order = 'YXZ';
grid.rotation.y = - Math.PI / 2;
grid.rotation.x = - Math.PI / 2;
scene.add( grid );

// animate
function animate () {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}
animate();