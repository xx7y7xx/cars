import _ from 'lodash';
// import { Scene, PerspectiveCamera, BoxGeometry, MeshNormalMaterial, Mesh, WebGLRenderer } from 'three';
import * as THREE from 'three';

import './style.css';
import Icon from './icon.png';
import GLTFLoader from './GLTFLoader';
import OrbitControls from './OrbitControls';

window.THREE = THREE;

// THREE.GLTFLoader = GLTFLoader;
// THREE.OrbitControls = OrbitControls;

// const scene = new Scene();

var camera, scene, renderer, light;
var geometry, material, mesh, controls;

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.z = 1;

  controls = new OrbitControls(camera);
  controls.target.set(0, -0.2, -0.2);
  controls.update();

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

  scene = new THREE.Scene();
  scene.background = envMap;
  window.scene = scene;

  light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
  light.position.set(0, 1, 0);
  scene.add(light);

  // model
  var loader = new GLTFLoader();
  loader.load('car.gltf', function(gltf) {
    gltf.scene.traverse(function(child) {
      if (child.isMesh) {
        child.material.envMap = envMap;
      }
    });
    scene.add(gltf.scene);
  });

  geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  material = new THREE.MeshNormalMaterial();

  mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);

  mesh.rotation.x += 0.01;
  mesh.rotation.y += 0.02;

  renderer.render(scene, camera);
}
