// LevelTree.jsx
// NOTE: Single-file version with NO features removed — only enhancements added to match backend fields.
// Backend fields: name, role, email, phone, department, image, level
// Enhancements:
//  - Add Node form now includes email, phone, department
//  - Edit Node modal includes email, phone, department
//  - Node detail modal shows email, phone, department
//  - Node cards (NodeBox) show department badge
//  - Small client-side validation (non-blocking UI msg)
//  - Optional search/filter (non-breaking; if unused, everything works the same)
//  - Kept drag & drop, level renaming (local), CRUD, and all existing styles intact

import React, { useState, useEffect, useMemo } from "react";
import { User, MoreVertical, Edit3, Trash2, Mail, Phone, Building2, Search } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

/* ---------------------------------------------
 * Utility helpers (non-breaking, for UX/validation)
 * --------------------------------------------*/
const isValidEmail = (email) => {
  if (!email) return true; // optional field – only validate if present
  // simple RFC5322-ish check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};
const isValidPhone = (phone) => {
  if (!phone) return true; // optional
  // digits, +, -, spaces, parentheses allowed
  return /^[0-9+()\-\s]{6,20}$/.test(phone.trim());
};

/* ---------------------------------------------
 * NodeBox — unchanged structure, only shows department badge if present
 * --------------------------------------------*/
const NodeBox = ({ node, onDragStart, onClick, canDrag, isAdmin, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      draggable={canDrag}
      onDragStart={canDrag ? (e) => onDragStart(e, node._id) : undefined}
      onClick={() => onClick(node)}
      layout
      whileHover={{ scale: 1.05 }}
      className="min-w-[120px] max-w-[180px] bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl text-black flex flex-col items-center justify-center p-3 m-2 shadow-xl cursor-pointer relative group"
    >
      {isAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 text-gray-600 hover:text-gray-900 rounded"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-300 z-20 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 flex-shrink-0 overflow-hidden">
        {node.image ? (
          <img
            src={node.image}
            alt={node.name}
            className="w-full h-full rounded-full border-2 border-white object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-white" />
        )}
      </div>

      <div className="text-center">
        <h3 className="text-sm font-semibold truncate max-w-[140px]">{node.name}</h3>
        <p className="text-xs italic text-gray-600 truncate max-w-[140px]">{node.role}</p>
      </div>

      {node.department && (
        <div className="mt-2 text-[10px] px-2 py-0.5 bg-white/70 text-gray-700 rounded-full flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{node.department}</span>
        </div>
      )}
    </motion.div>
  );
};

/* ---------------------------------------------
 * LevelBox — unchanged behavior, reuses NodeBox
 * --------------------------------------------*/
const LevelBox = ({
  level,
  levelName,
  isEditing,
  onLevelNameDoubleClick,
  onLevelNameChange,
  onLevelNameBlur,
  onDrop,
  onDragOver,
  onDragStart,
  onNodeClick,
  nodes,
  canEditLevelName,
  canDrag,
  currentUserRole,
  onEditNode,
  onDeleteNode,
  isDragging,
}) => {
  if (!nodes.length && !isDragging) return null;
  const isAdmin = currentUserRole === "admin";

  return (
    <div
      id={`level-${level}`}
      onDragOver={canDrag ? onDragOver : undefined}
      onDrop={canDrag ? (e) => onDrop(e, level) : undefined}
      className="w-full border border-gray-300 rounded-xl p-6 m-4 bg-gray-50 dark:bg-gray-900 shadow-inner min-h-[160px]"
    >
      {isEditing && canEditLevelName ? (
        <input
          type="text"
          value={levelName}
          onChange={(e) => onLevelNameChange(level, e.target.value)}
          onBlur={() => onLevelNameBlur(level)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onLevelNameBlur(level);
          }}
          autoFocus
          className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-400 focus:outline-none bg-transparent"
        />
      ) : (
        <h2
          className={`text-xl font-semibold text-center text-gray-700 dark:text-gray-200 mb-4 ${
            canEditLevelName ? "cursor-pointer" : ""
          }`}
          onDoubleClick={canEditLevelName ? () => onLevelNameDoubleClick(level) : undefined}
        >
          {levelName}
        </h2>
      )}

      <div className="flex flex-wrap justify-center">
        {nodes.map((node) => (
          <NodeBox
            key={node._id}
            node={node}
            onDragStart={onDragStart}
            onClick={onNodeClick}
            canDrag={canDrag}
            isAdmin={isAdmin}
            onEdit={onEditNode}
            onDelete={onDeleteNode}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------------------
 * LevelTree — main container
 * --------------------------------------------*/
const LevelTree = () => {
  const [currentUserRole] = useState("admin"); // "admin" | "citizen"  (kept as-is)
  const [nodes, setNodes] = useState([]);
  const [levels, setLevels] = useState([1, 2, 3]);
  const [levelNames, setLevelNames] = useState({ 1: "Executive Board", 2: "Management", 3: "Staff" });
  const [editingLevel, setEditingLevel] = useState(null);

  // Form (Add)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    department: "",
    image: "",
    level: 1,
  });
  const [newLevelName, setNewLevelName] = useState("");

  // Edit / Delete modal
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // UX: simple validation feedback on Add form
  const [formHint, setFormHint] = useState("");

  // UX: optional search (non-breaking)
  const [search, setSearch] = useState("");

  // Fetch nodes from backend
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/nodes");
        setNodes(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNodes();
  }, []);

  /* ----------------------
   * Level name editing
   * ----------------------*/
  const handleLevelNameDoubleClick = (level) => setEditingLevel(level);
  const handleLevelNameChange = (level, value) => setLevelNames((prev) => ({ ...prev, [level]: value }));
  const handleLevelNameBlur = () => setEditingLevel(null);

  /* ----------------------
   * Add Form — change
   * ----------------------*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    // level is number
    setFormData((prev) => ({ ...prev, [name]: name === "level" ? parseInt(value) : value }));
    if (name === "email" || name === "phone") {
      setFormHint(""); // clear hint on typing
    }
  };

  /* ----------------------
   * Add Form — submit
   * ----------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    // soft validation (non-blocking): just show hint if invalid
    if (!isValidEmail(formData.email)) {
      setFormHint("Invalid email format.");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setFormHint("Invalid phone format.");
      return;
    }

    try {
      let finalLevel = formData.level;
      let updatedLevels = [...levels];
      let updatedLevelNames = { ...levelNames };

      if (formData.level === 0 && newLevelName.trim()) {
        const newLevelNum = Math.max(...levels) + 1;
        updatedLevels.push(newLevelNum);
        updatedLevelNames[newLevelNum] = newLevelName.trim();
        finalLevel = newLevelNum;
        setLevels(updatedLevels);
        setLevelNames(updatedLevelNames);
      }

      const res = await axios.post("http://localhost:5000/api/nodes", {
        ...formData,
        level: finalLevel,
      });

      setNodes((prev) => [...prev, res.data]);
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        department: "",
        image: "",
        level: 1,
      });
      setNewLevelName("");
      setShowForm(false);
      setFormHint("");
    } catch (err) {
      console.error(err);
      setFormHint("Server error while adding node.");
    }
  };

  /* ----------------------
   * Drag & Drop between levels
   * ----------------------*/
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("nodeId", id);
    setIsDragging(true);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (e, newLevel) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData("nodeId");
    try {
      const node = nodes.find((n) => n._id === nodeId);
      if (!node) return;
      const res = await axios.put(`http://localhost:5000/api/nodes/${nodeId}`, { ...node, level: newLevel });
      setNodes((prev) => prev.map((n) => (n._id === nodeId ? res.data : n)));
    } catch (err) {
      console.error(err);
    }
    setIsDragging(false);
  };

  /* ----------------------
   * Editing an existing node
   * ----------------------*/
  const handleEditNode = async (e) => {
    e.preventDefault();
    if (!selectedNode) return;

    // soft validation for email/phone while editing
    if (!isValidEmail(selectedNode.email)) {
      // optional: you can show a small alert — we will keep consistent with add-form behavior:
      return;
    }
    if (!isValidPhone(selectedNode.phone)) {
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/nodes/${selectedNode._id}`, selectedNode);
      setNodes((prev) => prev.map((n) => (n._id === res.data._id ? res.data : n)));
      setIsEditingNode(false);
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------------------
   * Delete node
   * ----------------------*/
  const confirmDeleteNode = (node) => setDeleteConfirm(node);

  const handleDeleteNode = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`http://localhost:5000/api/nodes/${deleteConfirm._id}`);
      setNodes((prev) => prev.filter((n) => n._id !== deleteConfirm._id));
      setDeleteConfirm(null);
      setSelectedNode(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ----------------------
   * Optional: client-side search
   * ----------------------*/
  const filteredNodes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((n) => {
      const fields = [
        n.name || "",
        n.role || "",
        n.email || "",
        n.phone || "",
        n.department || "",
        String(n.level || ""),
      ].map((x) => x.toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [nodes, search]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen relative overflow-x-hidden">
      {/* Add Node button */}
      {currentUserRole === "admin" && (
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-white/80 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 shadow">
            <Search className="w-4 h-4 mr-1 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full shadow-lg"
          >
            ➕ Add Node
          </button>
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800 dark:text-gray-200">
        8Bit Organization
      </h1>

      {/* Add Node Form — UPDATED to include email, phone, department */}
      {showForm && currentUserRole === "admin" && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
          <div className="relative bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <button
              className="absolute top-3 right-4 text-gray-500 dark:text-gray-300 hover:text-red-500 text-xl font-bold"
              onClick={() => {
                setShowForm(false);
                setFormHint("");
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700 dark:text-gray-200">
              Add New Node
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  name="name"
                  placeholder="Name *"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <input
                  name="role"
                  placeholder="Role *"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <div className="col-span-1 sm:col-span-2">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white ${
                      formData.email && !isValidEmail(formData.email) ? "border-red-400" : ""
                    }`}
                  />
                </div>
                <input
                  name="phone"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white ${
                    formData.phone && !isValidPhone(formData.phone) ? "border-red-400" : ""
                  }`}
                />
                <input
                  name="department"
                  placeholder="Department (optional)"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
                <div className="col-span-1 sm:col-span-2">
                  <input
                    name="image"
                    placeholder="Image URL (optional)"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {levelNames[lvl]} (Level {lvl})
                  </option>
                ))}
                <option value={0}>➕ Add New Level</option>
              </select>

              {formData.level === 0 && (
                <input
                  placeholder="New Level Name"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              )}

              {formHint && (
                <p className="text-sm text-red-500 -mt-2">{formHint}</p>
              )}

              <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">
                ✅ Add Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Organization Chart (with optional filtered nodes) */}
      {levels.map((level) => (
        <LevelBox
          key={level}
          level={level}
          levelName={levelNames[level]}
          isEditing={editingLevel === level}
          onLevelNameDoubleClick={handleLevelNameDoubleClick}
          onLevelNameChange={handleLevelNameChange}
          onLevelNameBlur={handleLevelNameBlur}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onNodeClick={(node) => setSelectedNode(node)}
          isDragging={isDragging}
          nodes={filteredNodes.filter((n) => n.level === level)}
          canEditLevelName={currentUserRole === "admin"}
          canDrag={currentUserRole === "admin"}
          currentUserRole={currentUserRole}
          onEditNode={(node) => {
            setSelectedNode(node);
            setIsEditingNode(true);
          }}
          onDeleteNode={confirmDeleteNode}
        />
      ))}

      {/* Node Detail / Edit / Delete Modal */}
      {(selectedNode || deleteConfirm) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          {/* Detail / Edit */}
          {selectedNode && !deleteConfirm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md relative">
              <button
                className="absolute top-3 right-4 text-gray-500 hover:text-red-500 dark:text-gray-300 text-xl font-bold"
                onClick={() => {
                  setSelectedNode(null);
                  setIsEditingNode(false);
                }}
                aria-label="Close"
              >
                ×
              </button>

              {!isEditingNode ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 mb-4 shadow-md overflow-hidden">
                    {selectedNode.image ? (
                      <img
                        src={selectedNode.image}
                        alt={selectedNode.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-1 text-gray-700 dark:text-gray-200">
                    {selectedNode.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 italic">{selectedNode.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {levelNames[selectedNode.level]} (Level {selectedNode.level})
                  </p>

                  <div className="w-full mt-4 space-y-2 text-sm">
                    {selectedNode.department && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Building2 className="w-4 h-4" />
                        <span className="truncate">{selectedNode.department}</span>
                      </div>
                    )}
                    {selectedNode.email && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${selectedNode.email}`}
                          className="underline break-all"
                        >
                          {selectedNode.email}
                        </a>
                      </div>
                    )}
                    {selectedNode.phone && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${selectedNode.phone}`} className="underline">
                          {selectedNode.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {currentUserRole === "admin" && (
                    <div className="flex justify-around mt-6 w-full">
                      <button
                        onClick={() => setIsEditingNode(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteNode(selectedNode)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEditNode} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={selectedNode.name || ""}
                      onChange={(e) => setSelectedNode((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                      placeholder="Name"
                      required
                    />
                    <input
                      type="text"
                      value={selectedNode.role || ""}
                      onChange={(e) => setSelectedNode((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                      placeholder="Role"
                      required
                    />
                    <div className="col-span-1 sm:col-span-2">
                      <input
                        type="email"
                        value={selectedNode.email || ""}
                        onChange={(e) => setSelectedNode((prev) => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                        placeholder="Email (optional)"
                      />
                    </div>
                    <input
                      type="text"
                      value={selectedNode.phone || ""}
                      onChange={(e) => setSelectedNode((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                      placeholder="Phone (optional)"
                    />
                    <input
                      type="text"
                      value={selectedNode.department || ""}
                      onChange={(e) => setSelectedNode((prev) => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                      placeholder="Department (optional)"
                    />
                    <div className="col-span-1 sm:col-span-2">
                      <input
                        type="text"
                        value={selectedNode.image || ""}
                        onChange={(e) => setSelectedNode((prev) => ({ ...prev, image: e.target.value }))}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                        placeholder="Image URL (optional)"
                      />
                    </div>
                  </div>

                  <select
                    value={selectedNode.level || 1}
                    onChange={(e) =>
                      setSelectedNode((prev) => ({ ...prev, level: parseInt(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {levelNames[lvl]} (Level {lvl})
                      </option>
                    ))}
                  </select>

                  <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">
                    ✅ Save Changes
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Delete Confirmation */}
          {deleteConfirm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
              <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">
                Are you sure you want to delete {deleteConfirm.name}?
              </h2>
              <div className="flex justify-around">
                <button
                  onClick={handleDeleteNode}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
                >
                  🗑 Yes
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow"
                >
                  ❌ No
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile search (since top-right search is hidden on small screens) */}
      <div className="sm:hidden mt-4 mb-2 flex items-center gap-2">
        <div className="flex items-center bg-white/80 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full px-3 py-1 shadow w-full">
          <Search className="w-4 h-4 mr-1 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LevelTree;
