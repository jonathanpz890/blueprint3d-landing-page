"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_controller_1 = require("../controllers/models.controller");
const router = (0, express_1.Router)();
// Routes for models proxy and catalog explorer
router.get('/popular', models_controller_1.getPopularModels);
router.get('/search', models_controller_1.searchModels);
router.get('/files/:id', models_controller_1.getModelFiles);
router.get('/images/:id', models_controller_1.getModelImages);
router.get('/download', models_controller_1.downloadModelFile);
exports.default = router;
