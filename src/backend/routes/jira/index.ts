import { Router } from "express";
import { getTickets } from "./endpoints/getTickets.js";
import { getTicketByKey } from "./endpoints/getTicketByKey.js";

const router = Router();

router.get("/tickets", getTickets);
router.get("/tickets/:key", getTicketByKey);

export default router;
