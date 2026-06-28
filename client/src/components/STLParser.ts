export interface STLModelData {
  positions: Float32Array;
  normals: Float32Array;
  volume: number; // cm³
  surfaceArea: number; // cm²
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
    width: number;
    height: number;
    depth: number;
  };
  triangleCount: number;
}

export function parseSTL(buffer: ArrayBuffer): STLModelData {
  // Check if binary STL
  if (isBinarySTL(buffer)) {
    return parseBinarySTL(buffer);
  } else {
    return parseAsciiSTL(buffer);
  }
}

function isBinarySTL(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;
  const reader = new DataView(buffer);
  const triangleCount = reader.getUint32(80, true);
  // A binary STL file must be exactly 84 + (triangleCount * 50) bytes
  return buffer.byteLength === 84 + triangleCount * 50;
}

function parseBinarySTL(buffer: ArrayBuffer): STLModelData {
  const reader = new DataView(buffer);
  const triangleCount = reader.getUint32(80, true);

  const positions = new Float32Array(triangleCount * 9);
  const normals = new Float32Array(triangleCount * 9);

  let offset = 84;
  let totalVolume = 0;
  let totalArea = 0;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < triangleCount; i++) {
    if (offset + 50 > buffer.byteLength) break;

    // Normal vector
    const nx = reader.getFloat32(offset, true);
    const ny = reader.getFloat32(offset + 4, true);
    const nz = reader.getFloat32(offset + 8, true);

    // Vertex 1
    const v1x = reader.getFloat32(offset + 12, true);
    const v1y = reader.getFloat32(offset + 16, true);
    const v1z = reader.getFloat32(offset + 20, true);

    // Vertex 2
    const v2x = reader.getFloat32(offset + 24, true);
    const v2y = reader.getFloat32(offset + 28, true);
    const v2z = reader.getFloat32(offset + 32, true);

    // Vertex 3
    const v3x = reader.getFloat32(offset + 36, true);
    const v3y = reader.getFloat32(offset + 40, true);
    const v3z = reader.getFloat32(offset + 44, true);

    offset += 50; // 48 bytes for vectors + 2 bytes for attribute byte count

    const pIdx = i * 9;
    positions[pIdx] = v1x;
    positions[pIdx + 1] = v1y;
    positions[pIdx + 2] = v1z;
    positions[pIdx + 3] = v2x;
    positions[pIdx + 4] = v2y;
    positions[pIdx + 5] = v2z;
    positions[pIdx + 6] = v3x;
    positions[pIdx + 7] = v3y;
    positions[pIdx + 8] = v3z;

    // Standard triangle normals or compute them if normal is zero
    let finalNx = nx;
    let finalNy = ny;
    let finalNz = nz;
    
    // Cross product to get area and actual normal if normal is invalid
    const ax = v2x - v1x, ay = v2y - v1y, az = v2z - v1z;
    const bx = v3x - v1x, by = v3y - v1y, bz = v3z - v1z;
    const cx = ay * bz - az * by;
    const cy = az * bx - ax * bz;
    const cz = ax * by - ay * bx;
    const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
    
    if (len > 0) {
      totalArea += 0.5 * len;
      if (nx === 0 && ny === 0 && nz === 0) {
        finalNx = cx / len;
        finalNy = cy / len;
        finalNz = cz / len;
      }
    }

    // Set normal for all 3 vertices
    for (let j = 0; j < 3; j++) {
      const nIdx = i * 9 + j * 3;
      normals[nIdx] = finalNx;
      normals[nIdx + 1] = finalNy;
      normals[nIdx + 2] = finalNz;
    }

    // Accumulate signed tetrahedron volume
    // V = (v1 . (v2 x v3)) / 6
    const signedVol = (
      -v1z * v2y * v3x + v1y * v2z * v3x + v1z * v2x * v3y -
      v1x * v2z * v3y - v1y * v2x * v3z + v1x * v2y * v3z
    ) / 6.0;
    totalVolume += signedVol;

    // Track bounding box
    minX = Math.min(minX, v1x, v2x, v3x);
    maxX = Math.max(maxX, v1x, v2x, v3x);
    minY = Math.min(minY, v1y, v2y, v3y);
    maxY = Math.max(maxY, v1y, v2y, v3y);
    minZ = Math.min(minZ, v1z, v2z, v3z);
    maxZ = Math.max(maxZ, v1z, v2z, v3z);
  }

  // Convert volume from mm³ to cm³
  const volumeCm3 = Math.max(0, totalVolume / 1000.0);
  // Convert area from mm² to cm²
  const areaCm2 = totalArea / 100.0;

  return {
    positions,
    normals,
    volume: Number(volumeCm3.toFixed(2)),
    surfaceArea: Number(areaCm2.toFixed(2)),
    boundingBox: {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      width: Number(Math.max(0, maxX - minX).toFixed(1)),
      height: Number(Math.max(0, maxY - minY).toFixed(1)),
      depth: Number(Math.max(0, maxZ - minZ).toFixed(1)),
    },
    triangleCount,
  };
}

function parseAsciiSTL(buffer: ArrayBuffer): STLModelData {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(buffer);

  const lines = text.split('\n');
  const tempPositions: number[] = [];
  const tempNormals: number[] = [];

  let currentNormal = [0, 0, 0];
  let faceVertices: number[][] = [];

  let totalVolume = 0;
  let totalArea = 0;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/\s+/);
    if (parts[0] === 'facet' && parts[1] === 'normal') {
      currentNormal = [
        parseFloat(parts[2]) || 0,
        parseFloat(parts[3]) || 0,
        parseFloat(parts[4]) || 0,
      ];
      faceVertices = [];
    } else if (parts[0] === 'vertex') {
      const vx = parseFloat(parts[1]) || 0;
      const vy = parseFloat(parts[2]) || 0;
      const vz = parseFloat(parts[3]) || 0;
      faceVertices.push([vx, vy, vz]);
    } else if (parts[0] === 'endfacet') {
      if (faceVertices.length >= 3) {
        const v1 = faceVertices[0];
        const v2 = faceVertices[1];
        const v3 = faceVertices[2];

        // Push positions
        tempPositions.push(...v1, ...v2, ...v3);

        // Compute normal if the parsed normal is empty/invalid
        let nx = currentNormal[0];
        let ny = currentNormal[1];
        let nz = currentNormal[2];

        const ax = v2[0] - v1[0], ay = v2[1] - v1[1], az = v2[2] - v1[2];
        const bx = v3[0] - v1[0], by = v3[1] - v1[1], bz = v3[2] - v1[2];
        const cx = ay * bz - az * by;
        const cy = az * bx - ax * bz;
        const cz = ax * by - ay * bx;
        const len = Math.sqrt(cx * cx + cy * cy + cz * cz);
        
        if (len > 0) {
          totalArea += 0.5 * len;
          if (nx === 0 && ny === 0 && nz === 0) {
            nx = cx / len;
            ny = cy / len;
            nz = cz / len;
          }
        }

        // Push normals for 3 vertices
        tempNormals.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);

        // Accumulate signed tetrahedron volume
        const signedVol = (
          -v1[2] * v2[1] * v3[0] + v1[1] * v2[2] * v3[0] + v1[2] * v2[0] * v3[1] -
          v1[0] * v2[2] * v3[1] - v1[1] * v2[0] * v3[2] + v1[0] * v2[1] * v3[2]
        ) / 6.0;
        totalVolume += signedVol;

        // Track bounding box
        for (const v of [v1, v2, v3]) {
          minX = Math.min(minX, v[0]);
          maxX = Math.max(maxX, v[0]);
          minY = Math.min(minY, v[1]);
          maxY = Math.max(maxY, v[1]);
          minZ = Math.min(minZ, v[2]);
          maxZ = Math.max(maxZ, v[2]);
        }
      }
    }
  }

  const positions = new Float32Array(tempPositions);
  const normals = new Float32Array(tempNormals);
  const triangleCount = positions.length / 9;

  const volumeCm3 = Math.max(0, totalVolume / 1000.0);
  const areaCm2 = totalArea / 100.0;

  return {
    positions,
    normals,
    volume: Number(volumeCm3.toFixed(2)),
    surfaceArea: Number(areaCm2.toFixed(2)),
    boundingBox: {
      min: { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY, z: minZ === Infinity ? 0 : minZ },
      max: { x: maxX === -Infinity ? 0 : maxX, y: maxY === -Infinity ? 0 : maxY, z: maxZ === -Infinity ? 0 : maxZ },
      width: Number(Math.max(0, maxX - minX).toFixed(1)),
      height: Number(Math.max(0, maxY - minY).toFixed(1)),
      depth: Number(Math.max(0, maxZ - minZ).toFixed(1)),
    },
    triangleCount,
  };
}

export function parseSTLAsync(buffer: ArrayBuffer): Promise<STLModelData> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(new URL('./stl.worker.ts', import.meta.url), { type: 'module' });
      
      worker.onmessage = (e) => {
        if (e.data.success) {
          resolve(e.data.data);
        } else {
          reject(new Error(e.data.error));
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      // Copy the buffer to worker so it remains valid in main thread if reused (e.g. mock File creation)
      worker.postMessage(buffer);
    } catch (err) {
      // Fallback to synchronous parsing if web worker creation fails in some old browsers
      try {
        const result = parseSTL(buffer);
        resolve(result);
      } catch (syncErr) {
        reject(syncErr);
      }
    }
  });
}

