import { Router } from "express";
import { getPublicStats, getSettings } from "../controllers/publicController.js";

const router = Router();

router.get("/stats",    getPublicStats);
router.get("/settings", getSettings);

export default router;
