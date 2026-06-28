import { parseSTL } from './STLParser';

const ctx: any = self;

ctx.onmessage = (e: MessageEvent<ArrayBuffer>) => {
  try {
    const buffer = e.data;
    const result = parseSTL(buffer);
    // Send the result back, transferring the heavy float arrays
    ctx.postMessage(
      { success: true, data: result },
      [result.positions.buffer, result.normals.buffer]
    );
  } catch (error: any) {
    ctx.postMessage({ success: false, error: error.message || 'Failed to parse STL' });
  }
};

