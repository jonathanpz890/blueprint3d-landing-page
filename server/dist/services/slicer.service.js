"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlicerService = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
class SlicerService {
    // Path to local Bambu Studio application presets
    getSystemBblDir() {
        return path_1.default.join(os_1.default.homedir(), 'Library/Application Support/BambuStudio/system/BBL');
    }
    // Resolves preset inherits chain recursively and merges them into a single self-contained JSON object
    resolveConfig(filePath) {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        const content = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8'));
        if (content.inherits) {
            const parentName = content.inherits;
            const bblDir = this.getSystemBblDir();
            const parentPaths = [
                path_1.default.join(path_1.default.dirname(filePath), `${parentName}.json`),
                path_1.default.join(bblDir, 'process', `${parentName}.json`),
                path_1.default.join(bblDir, 'machine', `${parentName}.json`),
                path_1.default.join(bblDir, 'filament', `${parentName}.json`),
                path_1.default.join(bblDir, 'filament/P1P', `${parentName}.json`)
            ];
            let parentPath = null;
            for (const p of parentPaths) {
                if (fs_1.default.existsSync(p)) {
                    parentPath = p;
                    break;
                }
            }
            if (!parentPath) {
                throw new Error(`Parent preset "${parentName}" not found for ${filePath}`);
            }
            const parentContent = this.resolveConfig(parentPath);
            const merged = Object.assign({}, parentContent, content);
            delete merged.inherits;
            return merged;
        }
        delete content.inherits;
        return content;
    }
    // Maps input parameters to Bambu Studio JSON presets
    getPresetPaths(layerHeight, material) {
        const bblDir = this.getSystemBblDir();
        // 1. Process Preset Mapping
        let processFile = 'process/0.20mm Standard @BBL X1C.json'; // Default standard
        if (layerHeight === 0.12) {
            processFile = 'process/0.12mm High Quality @BBL X1C.json';
        }
        else if (layerHeight === 0.28) {
            processFile = 'process/0.28mm Extra Draft @BBL X1C.json';
        }
        // 2. Filament Preset Mapping
        let filamentFile = 'filament/P1P/Generic PLA @BBL P1P.json';
        if (material.toUpperCase() === 'PETG') {
            filamentFile = 'filament/P1P/Generic PETG @BBL P1P.json';
        }
        else if (material.toUpperCase() === 'TPU') {
            filamentFile = 'filament/P1P/Generic TPU @BBL P1P.json';
        }
        // 3. Machine Preset
        const machineFile = 'machine/Bambu Lab P1S 0.4 nozzle.json';
        return {
            processPath: path_1.default.join(bblDir, processFile),
            filamentPath: path_1.default.join(bblDir, filamentFile),
            machinePath: path_1.default.join(bblDir, machineFile)
        };
    }
    async sliceModel(stlFilePath, material, infill, layerHeight) {
        const presets = this.getPresetPaths(layerHeight, material);
        // Create unique temporary directory for this slice job
        const runId = (0, uuid_1.v4)();
        const tempDir = path_1.default.join(__dirname, `../../temp/jobs/${runId}`);
        fs_1.default.mkdirSync(tempDir, { recursive: true });
        const tempProcessPath = path_1.default.join(tempDir, 'process.json');
        const tempMachinePath = path_1.default.join(tempDir, 'machine.json');
        const tempFilamentPath = path_1.default.join(tempDir, 'filament.json');
        let success = false;
        try {
            // 1. Resolve and modify process preset
            const processJson = this.resolveConfig(presets.processPath);
            processJson.sparse_infill_density = `${infill}%`;
            fs_1.default.writeFileSync(tempProcessPath, JSON.stringify(processJson, null, 4));
            // 2. Resolve and modify machine preset
            const machineJson = this.resolveConfig(presets.machinePath);
            machineJson.printable_area = [
                "0x0",
                "1000x0",
                "1000x1000",
                "0x1000"
            ];
            machineJson.printable_height = "1000";
            machineJson.bed_exclude_area = [];
            machineJson.curr_bed_type = "Textured PEI Plate";
            fs_1.default.writeFileSync(tempMachinePath, JSON.stringify(machineJson, null, 4));
            // 3. Resolve and modify specific filament preset
            const filamentJson = this.resolveConfig(presets.filamentPath);
            filamentJson.compatible_printers = ["Bambu Lab P1S 0.4 nozzle"];
            fs_1.default.writeFileSync(tempFilamentPath, JSON.stringify(filamentJson, null, 4));
            // 4. Define slicing executor
            const runSlice = async () => {
                const bambuPath = process.env.BAMBU_STUDIO_PATH || '/Applications/BambuStudio.app/Contents/MacOS/BambuStudio';
                const loadSettings = `"${tempProcessPath};${tempMachinePath}"`;
                const loadFilaments = `"${tempFilamentPath}"`;
                const cmd = `"${bambuPath}" --slice 0 --arrange 1 --ensure-on-bed --load-settings ${loadSettings} --load-filaments ${loadFilaments} --outputdir "${tempDir}" "${stlFilePath}"`;
                console.log(`[SlicerService] Executing slicing command at 100% scale: ${cmd}`);
                return new Promise((resolve, reject) => {
                    (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
                        if (error) {
                            console.error('[SlicerService] CLI Error stderr:', stderr);
                            console.error('[SlicerService] CLI Error stdout:', stdout);
                            const combinedOutput = `${stdout}\n${stderr}`;
                            if (combinedOutput.includes('Nothing to be sliced') ||
                                combinedOutput.includes('no object is fully inside') ||
                                combinedOutput.includes('printable_height')) {
                                return reject(new Error('MODEL_TOO_LARGE'));
                            }
                            if (combinedOutput.includes('Loading of a model file failed') ||
                                combinedOutput.includes('empty file')) {
                                return reject(new Error('INVALID_STL_FILE'));
                            }
                            return reject(new Error(`Slicing failed with exit code ${error.code}: ${error.message}`));
                        }
                        resolve();
                    });
                });
            };
            // 4. Try to slice at 100% scale
            await runSlice();
            // 4. Parse results
            const resultPath = path_1.default.join(tempDir, 'result.json');
            if (!fs_1.default.existsSync(resultPath)) {
                throw new Error('Slicing completed but result.json was not generated.');
            }
            const resultJson = JSON.parse(fs_1.default.readFileSync(resultPath, 'utf8'));
            if (resultJson.return_code !== 0) {
                throw new Error(`Slicer reported error: ${resultJson.error_string}`);
            }
            const plate = resultJson.sliced_plates?.[0];
            if (!plate) {
                throw new Error('No plate data found in slicing results.');
            }
            const filamentData = plate.filaments?.[0];
            let weightg = filamentData ? filamentData.total_used_g : 0;
            let timeSeconds = plate.total_predication || 0;
            success = true;
            return {
                weightg: Number(weightg.toFixed(2)),
                timeSeconds: Number(timeSeconds.toFixed(1)),
                layerHeight,
                infillDensity: infill,
                material,
                fileKey: path_1.default.basename(stlFilePath)
            };
        }
        finally {
            // 5. Cleanup temp slicing directory and STL file (only delete STL file on failure)
            try {
                if (fs_1.default.existsSync(tempDir)) {
                    fs_1.default.rmSync(tempDir, { recursive: true, force: true });
                }
                if (!success && fs_1.default.existsSync(stlFilePath)) {
                    fs_1.default.unlinkSync(stlFilePath);
                }
            }
            catch (cleanupErr) {
                console.error('[SlicerService] Cleanup error:', cleanupErr);
            }
        }
    }
}
exports.SlicerService = SlicerService;
