import { Router } from "express";
import { getHealth } from "./endpoints/getHealth.js";

const router = Router();

router.get("/", getHealth);

export default router;
