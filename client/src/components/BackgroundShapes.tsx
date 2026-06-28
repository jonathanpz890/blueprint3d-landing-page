import React, { useEffect, useRef } from 'react';

interface Shape3D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  r: number;
  type: 'cube' | 'tetrahedron' | 'octahedron' | 'sphere' | 'prism';
  color: [number, number, number]; // [r, g, b]
  a: number;
  psx: number;
  psy: number;
}

const SHAPES_TEMPLATES = {
  cube: {
    vertices: [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ]
  },
  tetrahedron: {
    vertices: [
      [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]
    ],
    edges: [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
    ]
  },
  octahedron: {
    vertices: [
      [0, -1.414, 0], [0, 1.414, 0], [-1, 0, -1], [1, 0, -1], [1, 0, 1], [-1, 0, 1]
    ],
    edges: [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 3], [3, 4], [4, 5], [5, 2]
    ]
  },
  sphere: (() => {
    const vertices: number[][] = [];
    const edges: number[][] = [];
    const segments = 12;
    for (let k = 0; k < segments; k++) {
      const a = (Math.PI * 2 * k) / segments;
      vertices.push([Math.cos(a), Math.sin(a), 0]);
      edges.push([k, (k + 1) % segments]);
    }
    const startYZ = vertices.length;
    for (let k = 0; k < segments; k++) {
      const a = (Math.PI * 2 * k) / segments;
      vertices.push([0, Math.cos(a), Math.sin(a)]);
      edges.push([startYZ + k, startYZ + ((k + 1) % segments)]);
    }
    const startXZ = vertices.length;
    for (let k = 0; k < segments; k++) {
      const a = (Math.PI * 2 * k) / segments;
      vertices.push([Math.cos(a), 0, Math.sin(a)]);
      edges.push([startXZ + k, startXZ + ((k + 1) % segments)]);
    }
    return { vertices, edges };
  })(),
  prism: {
    vertices: [
      [1, 0, -1], [-0.5, 0.866, -1], [-0.5, -0.866, -1],
      [1, 0, 1], [-0.5, 0.866, 1], [-0.5, -0.866, 1]
    ],
    edges: [
      [0, 1], [1, 2], [2, 0],
      [3, 4], [4, 5], [5, 3],
      [0, 3], [1, 4], [2, 5]
    ]
  }
};

function rotate3D(x: number, y: number, z: number, ax: number, ay: number, az: number): [number, number, number] {
  // Rotate around X axis
  const cosX = Math.cos(ax), sinX = Math.sin(ax);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  // Rotate around Y axis
  const cosY = Math.cos(ay), sinY = Math.sin(ay);
  const x2 = x * cosY + z1 * sinY;
  const z2 = -x * sinY + z1 * cosY;

  // Rotate around Z axis
  const cosZ = Math.cos(az), sinZ = Math.sin(az);
  const x3 = x2 * cosZ - y1 * sinZ;
  const y3 = x2 * sinZ + y1 * cosZ;

  return [x3, y3, z2];
}

export const BackgroundShapes: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0;
    let shapes: Shape3D[] = [];

    // Orange: rgb(249, 115, 22), Blue: rgb(37, 99, 235)
    const COLORS: [number, number, number][] = [[249, 115, 22], [37, 99, 235]];
    const TYPES: Array<keyof typeof SHAPES_TEMPLATES> = ['cube', 'tetrahedron', 'octahedron', 'sphere', 'prism'];
    const MAX_V = 0.8, DAMP = 0.995, DRIFT = 0.02;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const initShapes = (currentW: number, currentH: number) => {
      const isMobile = currentW <= 768;
      const count = Math.max(8, Math.floor(currentH / (isMobile ? 150 : 100)));
      shapes = Array.from({ length: count }, (_, i) => {
        const r = isMobile ? rand(15, 40) : rand(30, 80);
        const color = pick(COLORS);
        const band = currentH / count;
        const bandCenter = band * (i + 0.5);
        const y = Math.max(r, Math.min(currentH - r, bandCenter + rand(-band * 0.4, band * 0.4)));

        return {
          x: rand(r, currentW - r),
          y,
          vx: rand(0.2, MAX_V) * (Math.random() < 0.5 ? 1 : -1),
          vy: rand(0.2, MAX_V) * (Math.random() < 0.5 ? 1 : -1),
          rotX: rand(0, Math.PI * 2),
          rotY: rand(0, Math.PI * 2),
          rotZ: rand(0, Math.PI * 2),
          spinX: rand(-0.015, 0.015),
          spinY: rand(-0.015, 0.015),
          spinZ: rand(-0.015, 0.015),
          r,
          type: pick(TYPES),
          color,
          a: rand(0.08, 0.18),
          psx: rand(-0.08, 0.08),
          psy: rand(-0.25, 0.25)
        };
      });
    };

    const adjustShapes = (newW: number, newH: number) => {
      const isMobile = newW <= 768;
      const targetCount = Math.max(8, Math.floor(newH / (isMobile ? 150 : 100)));

      // Scale existing shapes' coordinates first (if W and H are set)
      if (W > 0 && H > 0) {
        const scaleX = newW / W;
        const scaleY = newH / H;
        for (const s of shapes) {
          s.x = Math.max(s.r, Math.min(newW - s.r, s.x * scaleX));
          s.y = Math.max(s.r, Math.min(newH - s.r, s.y * scaleY));
        }
      }

      if (shapes.length === 0) {
        initShapes(newW, newH);
        return;
      }

      if (shapes.length < targetCount) {
        const toAdd = targetCount - shapes.length;
        for (let i = 0; i < toAdd; i++) {
          const r = isMobile ? rand(15, 40) : rand(30, 80);
          const color = pick(COLORS);
          shapes.push({
            x: rand(r, newW - r),
            y: rand(r, newH - r),
            vx: rand(0.2, MAX_V) * (Math.random() < 0.5 ? 1 : -1),
            vy: rand(0.2, MAX_V) * (Math.random() < 0.5 ? 1 : -1),
            rotX: rand(0, Math.PI * 2),
            rotY: rand(0, Math.PI * 2),
            rotZ: rand(0, Math.PI * 2),
            spinX: rand(-0.015, 0.015),
            spinY: rand(-0.015, 0.015),
            spinZ: rand(-0.015, 0.015),
            r,
            type: pick(TYPES),
            color,
            a: rand(0.08, 0.18),
            psx: rand(-0.08, 0.08),
            psy: rand(-0.25, 0.25)
          });
        }
      } else if (shapes.length > targetCount) {
        shapes = shapes.slice(0, targetCount);
      }
    };

    const getTargetHeight = () => {
      const wrapper = document.querySelector('.flex-grow-wrapper');
      if (wrapper) {
        return Math.max(wrapper.scrollHeight, window.innerHeight);
      }
      return Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
    };

    const handleResize = () => {
      if (!canvas) return;
      const newW = window.innerWidth;
      const newH = getTargetHeight();
      if (newW !== W || newH !== H) {
        adjustShapes(newW, newH);
        W = canvas.width = newW;
        H = canvas.height = newH;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    const wrapper = document.querySelector('.flex-grow-wrapper');
    if (wrapper) {
      resizeObserver.observe(wrapper);
    } else if (document.body) {
      resizeObserver.observe(document.body);
    }

    const colliding = new Map<string, 'bump' | 'pass'>();
    let mouseClientX = -9999, mouseClientY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseClientX = e.clientX;
      mouseClientY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseClientX = -9999;
      mouseClientY = -9999;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    function update() {
      const mx = mouseClientX === -9999 ? -9999 : mouseClientX + window.scrollX;
      const my = mouseClientY === -9999 ? -9999 : mouseClientY + window.scrollY;

      for (let i = 0; i < shapes.length; i++) {
        const s = shapes[i];
        s.vx += (Math.random() - 0.5) * DRIFT;
        s.vy += (Math.random() - 0.5) * DRIFT;
        const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (spd > MAX_V) {
          s.vx = (s.vx / spd) * MAX_V;
          s.vy = (s.vy / spd) * MAX_V;
        }
        s.vx *= DAMP;
        s.vy *= DAMP;
        s.x += s.vx;
        s.y += s.vy;
        s.rotX += s.spinX;
        s.rotY += s.spinY;
        s.rotZ += s.spinZ;

        // Boundary collision
        if (s.x - s.r < 0) {
          s.x = s.r;
          s.vx = Math.abs(s.vx);
        }
        if (s.x + s.r > W) {
          s.x = W - s.r;
          s.vx = -Math.abs(s.vx);
        }
        if (s.y - s.r < 0) {
          s.y = s.r;
          s.vy = Math.abs(s.vy);
        }
        if (s.y + s.r > H) {
          s.y = H - s.r;
          s.vy = -Math.abs(s.vy);
        }

        // Mouse avoidance
        const scrollDelta = window.scrollY;
        const rx = s.x + scrollDelta * s.psx;
        const ry = s.y + scrollDelta * s.psy;
        const cdx = rx - mx, cdy = ry - my;
        const cdst = Math.sqrt(cdx * cdx + cdy * cdy);
        const reach = s.r + 100;
        if (cdst < reach && cdst > 0.01) {
          const strength = (1 - cdst / reach) * 0.04;
          s.vx += (cdx / cdst) * strength;
          s.vy += (cdy / cdst) * strength;
        }

        // Collision between shapes
        for (let j = i + 1; j < shapes.length; j++) {
          const t = shapes[j];
          const dx = t.x - s.x, dy = t.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minD = s.r + t.r;
          const key = `${i}_${j}`;
          if (dist < minD && dist > 0.01) {
            if (!colliding.has(key)) {
              colliding.set(key, Math.random() < 0.5 ? 'bump' : 'pass');
            }
            if (colliding.get(key) === 'bump') {
              const nx = dx / dist, ny = dy / dist;
              const overlap = minD - dist;
              s.x -= nx * overlap * 0.5;
              s.y -= ny * overlap * 0.5;
              t.x += nx * overlap * 0.5;
              t.y += ny * overlap * 0.5;
              const relV = (s.vx - t.vx) * nx + (s.vy - t.vy) * ny;
              if (relV > 0) {
                s.vx -= relV * nx;
                s.vy -= relV * ny;
                t.vx += relV * nx;
                t.vy += relV * ny;
              }
            }
          } else {
            colliding.delete(key);
          }
        }
      }
    }

    function draw() {
      if (!ctx) return;
      const scrollDelta = window.scrollY;
      ctx.clearRect(0, 0, W, H);

      for (const s of shapes) {
        const { x, y, r, rotX, rotY, rotZ, type, color, a, psx, psy } = s;
        const rx = x + scrollDelta * psx;
        const ry = y + scrollDelta * psy;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${a})`;
        ctx.lineWidth = 5.5; // Thicker lines as requested

        const template = SHAPES_TEMPLATES[type];
        const projectedVertices: [number, number][] = [];
        const focalLength = 200;

        // Project 3D vertices
        for (const vertex of template.vertices) {
          const scaledX = vertex[0] * r;
          const scaledY = vertex[1] * r;
          const scaledZ = vertex[2] * r;

          const [rx3d, ry3d, rz3d] = rotate3D(scaledX, scaledY, scaledZ, rotX, rotY, rotZ);
          
          // Perspective projection
          const scale = focalLength / (rz3d + focalLength);
          const px = rx3d * scale;
          const py = ry3d * scale;
          projectedVertices.push([px, py]);
        }

        // Draw edges
        ctx.beginPath();
        for (const edge of template.edges) {
          const p1 = projectedVertices[edge[0]];
          const p2 = projectedVertices[edge[1]];
          ctx.moveTo(p1[0], p1[1]);
          ctx.lineTo(p2[0], p2[1]);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    let running = true;
    (function loop() {
      if (!running) return;
      update();
      draw();
      requestAnimationFrame(loop);
    })();

    return () => {
      running = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};
