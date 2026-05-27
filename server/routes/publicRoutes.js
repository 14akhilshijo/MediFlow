import { Router } from "express";
import { getPublicStats, getSettings } from "../controllers/publicController.js";

const router = Router();

// No auth required — used by the public-facing client
router.get("/stats",    getPublicStats);
router.get("/settings", getSettings);

export default router;
