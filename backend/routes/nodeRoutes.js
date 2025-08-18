import express from "express";
import { getNodes, addNode, updateNode, deleteNode } from "../controllers/nodeController.js";

const router = express.Router();

router.get("/", getNodes);
router.post("/", addNode);
router.put("/:id", updateNode);
router.delete("/:id", deleteNode);

export default router;
