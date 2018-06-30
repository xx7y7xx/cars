import * as THREE from 'three';
import debugModule from 'debug';

const debug = debugModule('cars:box');
const color = new THREE.Color();

/**
 * @return {THREE.Mesh}
 */
export const createBox = scene => {
  // objects
  let boxGeometry = new THREE.BoxBufferGeometry(20, 20, 20);
  boxGeometry = boxGeometry.toNonIndexed(); // ensure each face has unique vertices
  const count = boxGeometry.attributes.position.count;
  const colors = [];
  for (var i = 0; i < count; i++) {
    color.setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    colors.push(color.r, color.g, color.b);
  }
  boxGeometry.addAttribute(
    'color',
    new THREE.Float32BufferAttribute(colors, 3)
  );
  for (var i = 0; i < 500; i++) {
    var boxMaterial = new THREE.MeshPhongMaterial({
      specular: 0xffffff,
      flatShading: true,
      vertexColors: THREE.VertexColors
    });
    boxMaterial.color.setHSL(
      Math.random() * 0.2 + 0.5,
      0.75,
      Math.random() * 0.25 + 0.75
    );
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.x = Math.floor(Math.random() * 20 - 10) * 20;
    box.position.y = Math.floor(Math.random() * 20) * 20 + 10;
    box.position.z = Math.floor(Math.random() * 20 - 10) * 20;
    scene.add(box);
    // objects.push(box);
  }
};
