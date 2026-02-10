import { Router } from "express";
import { getRepos } from "./endpoints/getRepos.js";

const router = Router();

router.get("/", getRepos);

export default router;
