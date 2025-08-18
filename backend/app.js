import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

// MongoDB connect
mongoose
  .connect("mongodb://127.0.0.1:27017/orgtree", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// Schemas
const LevelSchema = new mongoose.Schema({
  level: Number,
  name: String,
});
const NodeSchema = new mongoose.Schema({
  name: String,
  role: String,
  image: String,
  level: Number,
});

const Level = mongoose.model("Level", LevelSchema);
const Node = mongoose.model("Node", NodeSchema);

const app = express();
app.use(cors());
app.use(bodyParser.json());

/** LEVEL ROUTES */
app.get("/api/levels", async (req, res) => {
  const levels = await Level.find();
  res.json(levels);
});

app.post("/api/levels", async (req, res) => {
  const { level, name } = req.body;
  const newLevel = new Level({ level, name });
  await newLevel.save();
  res.json(newLevel);
});

/** NODE ROUTES */
app.get("/api/nodes", async (req, res) => {
  const nodes = await Node.find();
  res.json(nodes);
});

app.post("/api/nodes", async (req, res) => {
  const node = new Node(req.body);
  await node.save();
  res.json(node);
});

app.put("/api/nodes/:id", async (req, res) => {
  const updated = await Node.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete("/api/nodes/:id", async (req, res) => {
  await Node.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
