import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import CustomShaderMaterial from "three-custom-shader-material/vanilla"
import wobbleVertexShader from "./shaders/wobble/vertex.glsl"
import wobbleFragmentShader from "./shaders/wobble/fragment.glsl"
import GUI from 'lil-gui'






/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const rgbeLoader = new RGBELoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([

    "/environment/px.png",
    "/environment/nx.png",
    "/environment/py.png",
    "/environment/ny.png",
    "/environment/pz.png",
    "/environment/nz.png"
])
scene.environment = environmentMap
scene.background = environmentMap


/**
 * Wobble
 */

    debugObject.colorA = "#1e00ff"
    debugObject.colorB = "#37d273"

    //UNIFORMS

    const uniforms = {
        uTime: new THREE.Uniform(0),

        uPositionFrequency: new THREE.Uniform(0.5),
        uTimeFrequency: new THREE.Uniform(0.3),
        uStrength: new THREE.Uniform(0.15),

        uWarpPositionFrequency: new THREE.Uniform(0.38),
        uWarpTimeFrequency: new THREE.Uniform(0.12),
        uWarpStrength: new THREE.Uniform(1.7),
        uColorA: new THREE.Uniform(new THREE.Color(debugObject.colorA)),
        uColorB: new THREE.Uniform(new THREE.Color(debugObject.colorB))

    }







// Material
const material = new CustomShaderMaterial({

    //CSM
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader: wobbleVertexShader,
    fragmentShader: wobbleFragmentShader,
    uniforms: uniforms,
    silent: true,
    
    //MeshPhysicalMaterial
    metalness: 0,
    roughness: 0.5,
    color: '#ffffff',
    transmission: 0,
    ior: 1.5,
    thickness: 1.5,
    transparent: true,
    wireframe: false
})

const depthMaterial = new CustomShaderMaterial({

    
    baseMaterial: THREE.MeshDepthMaterial,
    vertexShader: wobbleVertexShader,
    uniforms: uniforms,

    silent: true,

    //MeshDepthMaterial

    depthPacking: THREE.RGBADepthPacking

})

// Tweaks

gui.add(uniforms.uPositionFrequency, "value").min(0).max(2).step(0.001).name("Position Frequency")
gui.add(uniforms.uTimeFrequency, "value").min(0).max(2).step(0.001).name("Time Frequency")
gui.add(uniforms.uStrength, "value").min(0).max(2).step(0.001).name("Strenght")

gui.add(uniforms.uWarpPositionFrequency, "value").min(0).max(2).step(0.001).name("Warp Position Frequency")
gui.add(uniforms.uWarpTimeFrequency, "value").min(0).max(2).step(0.001).name("Warp Time Frequency")
gui.add(uniforms.uWarpStrength, "value").min(0).max(2).step(0.001).name("Warp Strenght")

gui.addColor(debugObject,"colorA").onChange(()=>{
    uniforms.uColorA.value.set(debugObject.colorA)

})
gui.addColor(debugObject,"colorB").onChange(()=>{
    uniforms.uColorB.value.set(debugObject.colorB)

})

gui.add(material, 'metalness', 0, 1, 0.001)
gui.add(material, 'roughness', 0, 1, 0.001)
gui.add(material, 'transmission', 0, 1, 0.001)
gui.add(material, 'ior', 0, 10, 0.001)
gui.add(material, 'thickness', 0, 10, 0.001)




//MODEL

gltfLoader.load("./suzanne.glb", (gltf) => {
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            child.material = material; 
            child.receiveShadow = true;
            child.castShadow = true;
            child.customDepthMaterial = depthMaterial; 
        }
    });

    
    //gltf.scene.rotation.y = Math.PI *0.5
    scene.add(gltf.scene);

    
});





// /**
//  * Plane
//  */
// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(15, 15, 15),
//     new THREE.MeshStandardMaterial()
// )
// plane.receiveShadow = true
// plane.rotation.y = Math.PI
// plane.position.y = - 5
// plane.position.z = 5
// scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)


const directionalLight2 = new THREE.DirectionalLight('#ffffff', 3)
directionalLight2.castShadow = true
directionalLight2.shadow.mapSize.set(1024, 1024)
directionalLight2.shadow.camera.far = 15
directionalLight2.shadow.normalBias = 0.05
directionalLight2.position.set(0.115, -1.345, 2.386 )

// gui.add(directionalLight2.position, "x").min(-10).max(10).step(0.001)
// gui.add(directionalLight2.position, "y").min(-10).max(10).step(0.001)
// gui.add(directionalLight2.position, "z").min(-10).max(10).step(0.001)


scene.add(directionalLight)
scene.add(directionalLight2)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(13, - 3, - 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //MATERIALS
    uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()