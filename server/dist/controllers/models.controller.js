"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModelImages = exports.downloadModelFile = exports.getModelFiles = exports.searchModels = exports.getPopularModels = void 0;
// Define the mock database for offline fallback
const MOCK_MODELS = [
    {
        id: 1,
        name: "3DBenchy - The Classic Calibration Boat",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300",
        creator: {
            name: "CreativeTools",
            public_url: "https://www.thingiverse.com/CreativeTools"
        },
        public_url: "https://www.thingiverse.com/thing:763622",
        description: "3DBenchy is a 3D model designed for testing and benchmarking 3D printers. It is a small boat that tests overhangs, bridging, details, and dimensions.",
        files: [
            {
                id: 101,
                name: "3dbenchy.stl",
                download_url: "http://localhost:5173/models/3dbenchy.stl",
                size: 160532
            }
        ]
    },
    {
        id: 2,
        name: "Chess Pawn - Elegant Modern Design",
        thumbnail: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=300",
        creator: {
            name: "ChessMaster",
            public_url: "https://www.thingiverse.com/ChessMaster"
        },
        public_url: "https://www.thingiverse.com/thing:3415201",
        description: "An elegant, modern style chess pawn designed to print quickly and calibrate smooth outer surfaces.",
        files: [
            {
                id: 201,
                name: "chess_pawn.stl",
                download_url: "http://localhost:5173/models/chess_pawn.stl",
                size: 89432
            }
        ]
    },
    {
        id: 3,
        name: "Calibration Torus / Donut Geometry",
        thumbnail: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300",
        creator: {
            name: "GeomMaker",
            public_url: "https://www.thingiverse.com/GeomMaker"
        },
        public_url: "https://www.thingiverse.com/thing:2938120",
        description: "A smooth torus shape perfect for checking infill densities, perimeter line quality, and standard extrusion rates.",
        files: [
            {
                id: 301,
                name: "torus.stl",
                download_url: "http://localhost:5173/models/torus.stl",
                size: 163452
            }
        ]
    },
    {
        id: 4,
        name: "Ribbed Medium Vase for Spiral Mode",
        thumbnail: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=300",
        creator: {
            name: "VaseArt",
            public_url: "https://www.thingiverse.com/VaseArt"
        },
        public_url: "https://www.thingiverse.com/thing:4512930",
        description: "A beautiful ribbed vase designed for spiralize outer contour (vase mode) printing with no top infill.",
        files: [
            {
                id: 401,
                name: "ribbed-vase-medium-size.stl",
                download_url: "http://localhost:5173/models/ribbed-vase-medium-size.stl",
                size: 245032
            }
        ]
    },
    {
        id: 5,
        name: "Mechanical Joint Tolerance Test",
        thumbnail: "https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?w=300",
        creator: {
            name: "MechDesigner",
            public_url: "https://www.thingiverse.com/MechDesigner"
        },
        public_url: "https://www.thingiverse.com/thing:930129",
        description: "High-precision mechanical snap joint model designed to test clearance tolerances of FDM 3D printers.",
        files: [
            {
                id: 501,
                name: "example6.stl",
                download_url: "http://localhost:5173/models/example6.stl",
                size: 198032
            }
        ]
    }
];
// Helper to check if Thingiverse token is set
const getAuthHeader = () => {
    const token = process.env.THINGIVERSE_API_TOKEN;
    if (!token)
        return null;
    return { 'Authorization': `Bearer ${token}` };
};
/**
 * GET /api/models/popular
 * Returns a list of popular models. Falls back to mocks if no token.
 */
const getPopularModels = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const headers = getAuthHeader();
    if (!headers) {
        console.log("ℹ️ getPopularModels: THINGIVERSE_API_TOKEN is missing. Returning mock models.");
        return res.status(200).json(MOCK_MODELS);
    }
    try {
        const url = `https://api.thingiverse.com/popular?page=${page}&per_page=12`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Thingiverse API responded with status ${response.status}`);
        }
        const data = await response.json();
        // Map Thingiverse response to our clean client schema
        const formatted = data.map(thing => ({
            id: thing.id,
            name: thing.name,
            thumbnail: thing.thumbnail,
            creator: {
                name: thing.creator?.name || "Unknown Creator",
                public_url: thing.creator?.public_url || ""
            },
            public_url: thing.public_url,
            description: thing.description || ""
        }));
        return res.status(200).json(formatted);
    }
    catch (error) {
        console.error("Error fetching popular models from Thingiverse:", error.message);
        return res.status(200).json(MOCK_MODELS); // Fallback on failure
    }
};
exports.getPopularModels = getPopularModels;
/**
 * GET /api/models/search
 * Searches for models by query string. Falls back to mocks if no token.
 */
const searchModels = async (req, res) => {
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const headers = getAuthHeader();
    if (!query) {
        return res.status(200).json([]);
    }
    if (!headers) {
        console.log(`ℹ️ searchModels: Search for '${query}' (Mock Filter applied).`);
        const filtered = MOCK_MODELS.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase()));
        return res.status(200).json(filtered);
    }
    try {
        const url = `https://api.thingiverse.com/search/${encodeURIComponent(query)}?page=${page}&per_page=12`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Thingiverse API responded with status ${response.status}`);
        }
        const data = await response.json();
        const hits = data.hits || data || [];
        const formatted = hits.map(thing => ({
            id: thing.id,
            name: thing.name,
            thumbnail: thing.thumbnail,
            creator: {
                name: thing.creator?.name || "Unknown Creator",
                public_url: thing.creator?.public_url || ""
            },
            public_url: thing.public_url,
            description: thing.description || ""
        }));
        return res.status(200).json(formatted);
    }
    catch (error) {
        console.error(`Error searching models for '${query}':`, error.message);
        // Return mock results as fallback
        const filtered = MOCK_MODELS.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.description.toLowerCase().includes(query.toLowerCase()));
        return res.status(200).json(filtered);
    }
};
exports.searchModels = searchModels;
/**
 * GET /api/models/files/:id
 * Fetches file listings for a specific Thing. Falls back to mocks if no token.
 */
const getModelFiles = async (req, res) => {
    const thingId = parseInt(req.params.id);
    const headers = getAuthHeader();
    if (isNaN(thingId)) {
        return res.status(400).json({ error: "Invalid model ID" });
    }
    // Check mock database first
    const mockMatch = MOCK_MODELS.find(m => m.id === thingId);
    if (!headers || mockMatch) {
        if (mockMatch) {
            return res.status(200).json(mockMatch.files);
        }
        return res.status(404).json({ error: "Model files not found" });
    }
    try {
        const url = `https://api.thingiverse.com/things/${thingId}/files`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Thingiverse API responded with status ${response.status}`);
        }
        const data = await response.json();
        const formatted = data.map(file => ({
            id: file.id,
            name: file.name,
            download_url: file.download_url,
            size: file.size
        }));
        return res.status(200).json(formatted);
    }
    catch (error) {
        console.error(`Error fetching files for Thing ${thingId}:`, error.message);
        return res.status(404).json({ error: "Could not retrieve model files" });
    }
};
exports.getModelFiles = getModelFiles;
/**
 * GET /api/models/download
 * Downloads a file from the Thingiverse CDN/API url and streams it back to the client.
 */
const downloadModelFile = async (req, res) => {
    const downloadUrl = req.query.url;
    const headers = getAuthHeader();
    if (!downloadUrl) {
        return res.status(400).json({ error: "Download url query parameter is required" });
    }
    try {
        console.log(`Downloading file from: ${downloadUrl}`);
        // If it's a localhost file (mock data), fetch it directly or pipe it
        const fetchHeaders = {};
        if (downloadUrl.startsWith("https://api.thingiverse.com") && headers) {
            fetchHeaders['Authorization'] = headers.Authorization;
        }
        const response = await fetch(downloadUrl, { headers: fetchHeaders });
        if (!response.ok) {
            throw new Error(`Failed to fetch remote file, status ${response.status}`);
        }
        // Set headers to stream binary data
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
            res.setHeader('Content-Disposition', contentDisposition);
        }
        else {
            res.setHeader('Content-Disposition', 'attachment; filename="model.stl"');
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return res.status(200).send(buffer);
    }
    catch (error) {
        console.error("Error downloading model file proxy request:", error.message);
        return res.status(500).json({ error: "Failed to download model file through proxy server" });
    }
};
exports.downloadModelFile = downloadModelFile;
/**
 * GET /api/models/images/:id
 * Fetches all images for a specific Thing. Falls back to mock values if no token.
 */
const getModelImages = async (req, res) => {
    const thingId = parseInt(req.params.id);
    const headers = getAuthHeader();
    if (isNaN(thingId)) {
        return res.status(400).json({ error: "Invalid model ID" });
    }
    // Check mock database first
    const mockMatch = MOCK_MODELS.find(m => m.id === thingId);
    if (!headers || mockMatch) {
        if (mockMatch) {
            // Return a set of mock images using different parameters
            return res.status(200).json([
                { id: 1, url: mockMatch.thumbnail },
                { id: 2, url: mockMatch.thumbnail + "&q=80&fm=jpg&crop=entropy" }
            ]);
        }
        return res.status(200).json([]);
    }
    try {
        const url = `https://api.thingiverse.com/things/${thingId}/images`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Thingiverse API responded with status ${response.status}`);
        }
        const data = await response.json();
        const formatted = data.map((img, index) => {
            const sizes = img.sizes || [];
            // Find a large or medium image size
            const largeSize = sizes.find((s) => s.size === 'large') ||
                sizes.find((s) => s.size === 'medium') ||
                sizes[0];
            return {
                id: img.id || index,
                url: largeSize ? largeSize.url : img.url || ''
            };
        });
        return res.status(200).json(formatted);
    }
    catch (error) {
        console.error(`Error fetching images for Thing ${thingId}:`, error.message);
        return res.status(200).json([]);
    }
};
exports.getModelImages = getModelImages;
