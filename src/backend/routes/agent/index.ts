import { Router } from "express";
import { runAgentEndpoint } from "./endpoints/runAgent.js";

const router = Router();

router.post("/run", runAgentEndpoint);

export default router;
