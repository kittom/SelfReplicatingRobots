import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Grid {
  constructor(worldBounds) {
    this.worldBounds = worldBounds;
    this.init();
    
  }

  init() {
    // Setup basic scene elements
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcfcfcf);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.addLighting();
    this.addGridAndBoxes();
    this.addEventListeners();

    this.camera.position.set(0, Math.max(this.worldBounds.x, this.worldBounds.z), 0);
    this.animate();
  }
// set up the lighting 
  addLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    this.scene.add(dirLight);
  }
// Create grid layout
  addGridAndBoxes() {
    for (let x = 0; x < this.worldBounds.x; x++) {
      for (let z = 0; z < this.worldBounds.z; z++) {
        const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
        const material = new THREE.MeshStandardMaterial({ color: 0xffcfcf });
        const cube = new THREE.Mesh(geometry, material);
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.scene.add(cube);
        cube.position.x = x - this.worldBounds.x/2;
        cube.position.z = z - this.worldBounds.z/2;
        cube.name = "Grid"
      }
    }

    // const grid = new THREE.GridHelper(10);
    // this.scene.add(grid);
  }
  getPlaceholderPosition(){
    // Normalize mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Find intersected objects
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    let intersect;

    if (intersects[0] === undefined){
        // console.log('Undefined')
        return undefined}
    if (intersects[0].object.name === "Placeholder_Cube"){
        intersect = intersects[1]
    } else {
        intersect = intersects[0]
    }

    if (intersect.object.geometry.type === 'BoxGeometry'){
        // console.log(intersect.object.geometry.type)

        const worldNormal = intersect.face.normal.clone();
        // console.log("Initial normal: ", worldNormal);

        const objectWorldDir = new THREE.Vector3();
        intersect.object.getWorldDirection(objectWorldDir);
        // console.log("Object world direction: ", objectWorldDir);

        worldNormal.round();
        // console.log("Final normal: ", worldNormal);


        if (intersect.object.name === "Grid"){
            // console.log(worldNormal)

                return ({x:intersect.object.position.x, y:intersect.object.position.y + 1, z:intersect.object.position.z})
            
        }
        else {
            if (worldNormal.y === 1) {
                // console.log('Top face hit');
                if (intersect.object.position.y + 1 <= this.worldBounds.y){
                    return ({x:intersect.object.position.x, y:intersect.object.position.y + 1, z:intersect.object.position.z})
                }
            } else if (worldNormal.y === -1) {
                // console.log('Bottom face hit');
                return ({x:intersect.object.position.x, y:intersect.object.position.y - 1, z:intersect.object.position.z})
            } else if (worldNormal.x === 1) {
                console.log('Right face hit');
                if (intersect.object.position.x + 1 < this.worldBounds.x/2){
                    return ({x:intersect.object.position.x + 1, y:intersect.object.position.y, z:intersect.object.position.z})
    
                }
            } else if (worldNormal.x === -1) {
                // console.log('Left face hit');
                if (intersect.object.position.x -1 > this.worldBounds.x/2){
                    return ({x:intersect.object.position.x - 1, y:intersect.object.position.y, z:intersect.object.position.z})
    
                }
            } else if (worldNormal.z === 1) {
                // console.log('Front face hit');
                if (intersect.object.position.z + 1 < this.worldBounds.x/2){
                    return ({x:intersect.object.position.x, y:intersect.object.position.y, z:intersect.object.position.z + 1})
    
                }
            } else if (worldNormal.z === -1) {
                // console.log('Back face hit');
                if (intersect.object.position.z - 1 > this.worldBounds.x/2){
                    return ({x:intersect.object.position.x, y:intersect.object.position.y, z:intersect.object.position.z - 1})
    
                }
            };
            
        }

        // Determine the clicked face based on the normal

    }
}

  addEventListeners() {
    window.addEventListener('click', this.onMouseClick.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  }

    onMouseClick(event) {
        const position = this.getPlaceholderPosition()
        if (position !== undefined) {
            const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
            const material = new THREE.MeshStandardMaterial({
                color: 0x00ff00, // red
                transparent: true,
                opacity: 0.4 // 50% transparent
            });
            const cube = new THREE.Mesh(geometry, material)
            
            this.scene.add(cube)
            cube.name = "newCube"
            console.log(position)
            cube.position.set(position.x, position.y, position.z)
        }
}


    onMouseMove(event){
        this.removeCubesByName("Placeholder_Cube")
        const position = this.getPlaceholderPosition()
        if (position !== undefined){
            const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
            const material = new THREE.MeshStandardMaterial({
                color: 0xff0000, // red
                transparent: true,
                opacity: 0.2 // 50% transparent
            });
            const cube = new THREE.Mesh(geometry, material)
            
            this.scene.add(cube)
            cube.name = "Placeholder_Cube"
            // console.log(position)
            cube.position.set(position.x, position.y, position.z)
        }

}

    removeCubesByName(name) {
        const objectsToRemove = [];
    
        // Collect all the objects to remove in objectsToRemove array
        this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === name) {
            objectsToRemove.push(child);
        }
        });
    
        // Remove collected objects
        for (const object of objectsToRemove) {
        this.scene.remove(object);
        }
    }
    


    animate() {
        
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
  }
}

new Grid({x:10, y:10, z:10});
