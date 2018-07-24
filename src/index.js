// import { Scene, PerspectiveCamera, BoxGeometry, MeshNormalMaterial, Mesh, WebGLRenderer } from 'three';
import * as THREE from 'three';
import debugModule from 'debug';

import './style.css';
import Icon from './icon.png';
import GLTFLoader from './GLTFLoader';
import OrbitControls from './OrbitControls';
import PointerLockControls from './PointerLockControls';

import { createFloor } from './floor';
import { createBox } from './box';

const debug = debugModule('cars:index');
window.THREE = THREE;

// THREE.GLTFLoader = GLTFLoader;
// THREE.OrbitControls = OrbitControls;

// const scene = new Scene();

let renderer, camera;
var geometry, material, mesh, controls;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

let prevTime = performance.now();

init();
animate();

function init() {
  // envmap
  var path = 'background/';
  var format = '.jpg';
  var envMap = new THREE.CubeTextureLoader().load([
    path + 'posx' + format,
    path + 'negx' + format,
    path + 'posy' + format,
    path + 'negy' + format,
    path + 'posz' + format,
    path + 'negz' + format
  ]);

  // scene
  const scene = new THREE.Scene();
  scene.name = 'scene';
  scene.background = envMap;
  window.scene = scene;

  // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    100000
  );
  camera.position.z = 1;
  debug('Camera position:', camera.position);

  // (1) Create an OrbitControls
  //controls = new OrbitControls(camera);
  //controls.target.set(0, -0.2, -0.2);
  //controls.update();

  // (2) Create a PointerLockControls
  controls = new PointerLockControls(camera);
  // controls.enabled = true;
  debug('controls =', controls);
  scene.add(controls.getObject());

  // light
  const light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
  light.name = 'light';
  light.position.set(0, 1, 0);
  scene.add(light);

  // keyboard

  var onKeyDown = function(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true;
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
    }
  };
  var onKeyUp = function(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
    }
  };
  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  // model
  var loader = new GLTFLoader();
  loader.load('car.gltf', function(gltf) {
    debug('gltf =', gltf);
    gltf.scene.traverse(function(child) {
      debug('child =', child);
      if (child.isMesh) {
        debug('isMesh');
        child.material.envMap = envMap;
      }
    });

    // Change the size of this car
    gltf.scene.scale.set(30, 30, 30);
    gltf.scene.position.set(50, 5, -100);
    scene.add(gltf.scene);
  });

  // BoxGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
  geometry = new THREE.BoxGeometry(20, 20, 20); // original value: 0.2, 0.2, 0.2
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'box';
  mesh.position.set(0, 0, -100);
  debug('mesh =', mesh);
  scene.add(mesh);

  // floor
  // createFloor(scene);
  scene.add(createFloor());

  // box
  // createBox(scene);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function updateControls(
  controls,
  { moveForward, moveBackward, moveLeft, moveRight }
) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  // raycaster.ray.origin.copy(controls.getObject().position);
  // raycaster.ray.origin.y -= 10;
  // var intersections = raycaster.intersectObjects(objects);
  // var onObject = intersections.length > 0;
  const time = performance.now();
  const delta = (time - prevTime) / 200; // original value: 1000
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;
  //velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

  // 1-0 = 1  : press forward key
  // 0-1 = -1 : press backward key
  // 0-0 = 0  : other
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveLeft) - Number(moveRight);
  direction.normalize(); // this ensures consistent movements in all directions
  if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
  // if (onObject === true) {
  //   velocity.y = Math.max(0, velocity.y);
  //   canJump = true;
  // }
  controls.getObject().translateX(velocity.x * delta);
  //controls.getObject().translateY(velocity.y * delta);
  controls.getObject().translateZ(velocity.z * delta);
  // if (controls.getObject().position.y < 10) {
  //   velocity.y = 0;
  //   controls.getObject().position.y = 10;
  //   canJump = true;
  // }
  prevTime = time;
}

/**
 * animate
 * @param {DOMHighResTimeStamp} timestamp
 */
function animate(timestamp) {
  // debug('animate()', 'mesh', mesh, timestamp);
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  updateControls(controls, {
    moveForward,
    moveBackward,
    moveLeft,
    moveRight
  });

  renderer.render(scene, camera);
}
