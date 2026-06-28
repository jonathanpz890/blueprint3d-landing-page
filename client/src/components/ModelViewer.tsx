import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RefreshCw } from 'lucide-react';
import { type STLModelData } from './STLParser';
import { useLanguage } from '../context/LanguageContext';

interface ModelViewerProps {
  data: STLModelData;
  color: string; // Hex color string, e.g. "#FF007F"
  materialType?: 'matte' | 'glossy' | 'metallic' | 'translucent';
  autoRotate?: boolean;
  showGrid?: boolean;
  showBoundingBox?: boolean;
  showHelpText?: boolean;
  isMinimal?: boolean;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  data,
  color,
  materialType = 'glossy',
  autoRotate = false,
  showGrid = true,
  showBoundingBox = true,
  showHelpText = true,
  isMinimal = false,
}) => {
  const actualShowGrid = isMinimal ? false : showGrid;
  const actualShowBoundingBox = isMinimal ? false : showBoundingBox;
  const actualShowHelpText = isMinimal ? false : showHelpText;
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildPlateGridRef = useRef<THREE.GridHelper | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const autoRotateRef = useRef(autoRotate);
  const [isSceneLoading, setIsSceneLoading] = useState(true);
  const { language } = useLanguage();

  // Keep autoRotateRef in sync to prevent restarting the animation loop context
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Handle color & materialType updates dynamically without rebuilding the scene
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const threeColor = new THREE.Color(color);
    let newMaterial: THREE.Material;

    switch (materialType) {
      case 'matte':
        newMaterial = new THREE.MeshStandardMaterial({
          color: threeColor,
          roughness: 0.85,
          metalness: 0.1,
          flatShading: false,
        });
        break;
      case 'metallic':
        newMaterial = new THREE.MeshStandardMaterial({
          color: threeColor,
          roughness: 0.25,
          metalness: 0.9,
          flatShading: false,
        });
        break;
      case 'translucent':
        newMaterial = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          roughness: 0.2,
          transmission: 0.6,
          thickness: 1.5,
          transparent: true,
          opacity: 0.85,
        });
        break;
      case 'glossy':
      default:
        newMaterial = new THREE.MeshPhysicalMaterial({
          color: threeColor,
          roughness: 0.15,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          metalness: 0.1,
        });
        break;
    }

    const oldMaterial = mesh.material;
    mesh.material = newMaterial;

    if (oldMaterial) {
      if (Array.isArray(oldMaterial)) {
        oldMaterial.forEach((m) => m.dispose());
      } else {
        oldMaterial.dispose();
      }
    }

    // Request a single frame render to reflect changes
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [color, materialType]);

  useEffect(() => {
    // Show spinner immediately when new data arrives
    setIsSceneLoading(true);

    // Cancel any ongoing animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!containerRef.current) return;

    // Defer heavy THREE.js work so the browser can paint the loading spinner first
    const setupTimer = setTimeout(() => {
      if (!containerRef.current) return;

      // --- SCENE CREATION ---
      const scene = new THREE.Scene();
      // Beautiful pure white background matching the white card design
      if (!isMinimal) {
        scene.background = new THREE.Color('#ffffff'); 
      }
      sceneRef.current = scene;

      // --- CAMERA CREATION ---
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
      cameraRef.current = camera;

      // --- RENDERER CREATION ---
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      if (isMinimal) {
        renderer.domElement.style.cursor = 'pointer';
      }
      
      // Clear container and append canvas
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // --- GEOMETRY CREATION ---
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(data.positions.slice(), 3));
      geometry.setAttribute('normal', new THREE.BufferAttribute(data.normals.slice(), 3));
      
      // Rotate geometry to align STL Z-up (height) with Three.js Y-up
      geometry.rotateX(-Math.PI / 2);
      
      geometry.center(); // Center the geometry around its local origin
      geometry.computeBoundingSphere();
      geometry.computeBoundingBox();

      // --- INITIAL MATERIAL SETUP ---
      const threeColor = new THREE.Color(color);
      let material: THREE.Material;

      switch (materialType) {
        case 'matte':
          material = new THREE.MeshStandardMaterial({
            color: threeColor,
            roughness: 0.85,
            metalness: 0.1,
            flatShading: false,
          });
          break;
        case 'metallic':
          material = new THREE.MeshStandardMaterial({
            color: threeColor,
            roughness: 0.25,
            metalness: 0.9,
            flatShading: false,
          });
          break;
        case 'translucent':
          material = new THREE.MeshPhysicalMaterial({
            color: threeColor,
            roughness: 0.2,
            transmission: 0.6,
            thickness: 1.5,
            transparent: true,
            opacity: 0.85,
          });
          break;
        case 'glossy':
        default:
          material = new THREE.MeshPhysicalMaterial({
            color: threeColor,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            metalness: 0.1,
          });
          break;
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // --- CAD-STYLE EDGES / OUTLINE BORDER ---
      const edges = new THREE.EdgesGeometry(geometry, 20); // 20 degrees threshold angle
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: '#1e293b', // slate outline
        transparent: true,
        opacity: 0.4
      });
      const lineSegments = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(lineSegments);

      scene.add(mesh);
      meshRef.current = mesh;

      // --- BOUNDING BOX OUTLINE ---
      let boxHelper: THREE.BoxHelper | null = null;
      if (actualShowBoundingBox) {
        boxHelper = new THREE.BoxHelper(mesh, new THREE.Color('#f97316')); // Orange bounding box
        scene.add(boxHelper);
        boxHelperRef.current = boxHelper;
      }

      // --- BUILD PLATE GRID ---
      if (actualShowGrid) {
        // Place a grid representing the printer build plate just underneath the model
        const bBox = geometry.boundingBox!;
        const modelHeight = bBox.max.y - bBox.min.y;
        const gridY = -modelHeight / 2 - 0.2; // slightly below the model's bottom face

        const maxModelDim = Math.max(bBox.max.x - bBox.min.x, bBox.max.z - bBox.min.z);
        const gridSize = maxModelDim > 256 ? maxModelDim * 1.2 : 256; // Defaults to Bambu Lab P1S 256mm bed, scales up for larger models
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(
          gridSize,
          gridDivisions,
          '#f97316', // center line: orange
          '#cbd5e1'  // grids: light slate grey
        );
        gridHelper.position.y = gridY;
        scene.add(gridHelper);
        buildPlateGridRef.current = gridHelper;
      }

      // --- LIGHTING ---
      // HemisphereLight for soft realistic sky/ground lighting
      const ambientLight = new THREE.HemisphereLight('#ffffff', '#cbd5e1', 0.95);
      scene.add(ambientLight);

      // Main key light
      const dirLight1 = new THREE.DirectionalLight('#ffffff', 1.1);
      dirLight1.position.set(100, 150, 100);
      dirLight1.castShadow = true;
      dirLight1.shadow.mapSize.width = 1024;
      dirLight1.shadow.mapSize.height = 1024;
      dirLight1.shadow.camera.near = 0.5;
      dirLight1.shadow.camera.far = 500;
      const d = 100;
      dirLight1.shadow.camera.left = -d;
      dirLight1.shadow.camera.right = d;
      dirLight1.shadow.camera.top = d;
      dirLight1.shadow.camera.bottom = -d;
      scene.add(dirLight1);

      // Fill light from the opposite side to eliminate harsh dark shadows
      const dirLight2 = new THREE.DirectionalLight('#ffffff', 0.65);
      dirLight2.position.set(-100, 100, -100);
      scene.add(dirLight2);

      // Premium warm orange and gold point lights for highlights
      const pointLight = new THREE.PointLight('#f97316', 1.5, 300); // Warm orange accent light
      pointLight.position.set(-80, 50, -80);
      scene.add(pointLight);

      const pointLight2 = new THREE.PointLight('#fb923c', 1.2, 300); // Soft amber accent light
      pointLight2.position.set(80, -50, 80);
      scene.add(pointLight2);

      // --- FIT CAMERA TO MODEL ---
      const sphere = geometry.boundingSphere!;
      const radius = sphere.radius;
      const fov = camera.fov * (Math.PI / 180);
      const zoom = isMinimal ? 1.05 : 0.95; // Balanced zoom to keep models large but prevent clipping
      let cameraDistance = Math.abs(radius / Math.sin(fov / 2)) * zoom;
      
      // Fallback if model is flat/empty
      if (cameraDistance === 0 || isNaN(cameraDistance)) {
        cameraDistance = 100;
      }

      camera.position.set(cameraDistance * 0.8, cameraDistance * 0.6, cameraDistance * 0.8);
      camera.lookAt(0, 0, 0);

      // --- ORBIT CONTROLS ---
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't let users go far under the build plate
      controls.minDistance = radius * 0.5 || 5;
      controls.maxDistance = cameraDistance * 3 || 500;
      controlsRef.current = controls;

      // --- ANIMATION LOOP ---
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);

        if (autoRotateRef.current && mesh) {
          mesh.rotation.y += 0.005;
          if (boxHelperRef.current) {
            boxHelperRef.current.update(); // Keep bounding box aligned
          }
        }

        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // --- RESIZE OBSERVER ---
      const resizeObserver = new ResizeObserver(() => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (w === 0 || h === 0) return;

        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      });
      
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      // Hide loading spinner - scene is ready
      setIsSceneLoading(false);

      // --- INNER CLEANUP (runs when data prop changes or component unmounts) ---
      return () => {
        resizeObserver.disconnect();
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Dispose materials & geometry
        geometry.dispose();
        edges.dispose();
        lineMaterial.dispose();
        if (boxHelperRef.current) {
          boxHelperRef.current.dispose();
          boxHelperRef.current = null;
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
        
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }

        controls.dispose();
      };
    }, 0); // setTimeout 0 - yields to browser for paint before setup

    return () => {
      clearTimeout(setupTimer);
    };
  }, [data]);

  return (
    <div 
      className={isMinimal ? "relative w-full h-full overflow-hidden" : "relative w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] overflow-hidden model-viewer-card"}
      style={isMinimal 
        ? { backgroundColor: 'transparent', cursor: 'pointer' } 
        : { 
            backgroundColor: '#ffffff', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.02)',
            overflow: 'hidden'
          }
      }
    >
      {/* Centered loading spinner shown while THREE.js initializes */}
      {isSceneLoading && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
          style={{ backgroundColor: isMinimal ? 'rgba(255,255,255,0.7)' : '#ffffff' }}
        >
          <RefreshCw 
            className="animate-spin" 
            style={{ color: 'var(--primary)', width: '2rem', height: '2rem' }} 
          />
          <span 
            className="text-xs font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            {language === 'he' ? 'טוען מודל...' : 'Loading model...'}
          </span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" style={isMinimal ? { cursor: 'pointer' } : undefined} />
      {actualShowHelpText && (
        <div 
          className="absolute bottom-4 flex flex-col gap-1 rounded-lg backdrop-blur-md border pointer-events-none select-none"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.85)', 
            borderColor: 'rgba(0, 0, 0, 0.06)', 
            color: 'var(--text-secondary)',
            left: language === 'he' ? 'auto' : '0.75rem',
            right: language === 'he' ? '0.75rem' : 'auto',
            fontSize: '9px',
            padding: '0.35rem 0.55rem',
            lineHeight: '1.3'
          }}
        >
          {language === 'he' ? (
            <>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span> גרירה עם כפתור שמאלי: סיבוב</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}></span> גרירה עם כפתור ימני / Shift: הזזה</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span> גלילה: זום (תקריב)</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span> Left Drag: Rotate</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}></span> Right Drag / Shift Drag: Pan</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }}></span> Scroll: Zoom</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
