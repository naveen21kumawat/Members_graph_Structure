import Node from "../models/Node.js";

// Get all nodes
export const getNodes = async (req, res) => {
  try {
    const nodes = await Node.find({});
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add new node
export const addNode = async (req, res) => {
  try {
    const { name, role, email, phone, department, image, level } = req.body;
    const newNode = new Node({ name, role, email, phone, department, image, level });
    await newNode.save();
    res.status(201).json(newNode);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update node
export const updateNode = async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });

    const { name, role, email, phone, department, image, level } = req.body;
    node.name = name || node.name;
    node.role = role || node.role;
    node.email = email || node.email;
    node.phone = phone || node.phone;
    node.department = department || node.department;
    node.image = image || node.image;
    node.level = level || node.level;

    await node.save();
    res.json(node);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete node
export const deleteNode = async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) return res.status(404).json({ message: "Node not found" });

    await node.remove();
    res.json({ message: "Node deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
