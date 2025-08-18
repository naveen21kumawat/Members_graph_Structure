// LevelTree.jsx
import React, { useState } from "react";

const NodeBox = ({ node, onDragStart, onClick, canDrag }) => (
  <div
    id={node.id}
    draggable={canDrag}
    onDragStart={canDrag ? (e) => onDragStart(e, node.id) : undefined}
    onClick={() => onClick(node)}
    className="min-w-[120px] max-w-[150px] bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl text-black flex flex-col items-center justify-center p-3 m-2 shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
  >
    <img
      src={node.image}
      alt={node.name}
      className="w-14 h-14 rounded-full border-4 border-white mb-2 shadow-md object-cover"
    />
    <div className="font-bold text-sm text-center">{node.name}</div>
    <div className="text-xs italic text-gray-600">{node.role}</div>
  </div>
);

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
  isDragging,
  nodes,
  canEditLevelName,
  canDrag,
}) => {
  if (!nodes.length && !isDragging) return null;

  return (
    <div
      id={`level-${level}`}
      onDragOver={canDrag ? onDragOver : undefined}
      onDrop={canDrag ? (e) => onDrop(e, level) : undefined}
      className="w-full border border-gray-300 rounded-xl p-6 m-4 bg-gray-50 shadow-inner min-h-[160px]"
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
          className="text-xl font-semibold text-center text-gray-700 mb-4 border-b border-gray-400 focus:outline-none bg-transparent"
        />
      ) : (
        <h2
          className={`text-xl font-semibold text-center text-gray-700 mb-4 ${
            canEditLevelName ? "cursor-pointer" : ""
          }`}
          onDoubleClick={
            canEditLevelName ? () => onLevelNameDoubleClick(level) : undefined
          }
        >
          {levelName}
        </h2>
      )}

      <div className="flex flex-wrap justify-center">
        {nodes.map((node) => (
          <NodeBox
            key={node.id}
            node={node}
            onDragStart={onDragStart}
            onClick={onNodeClick}
            canDrag={canDrag}
          />
        ))}
      </div>
    </div>
  );
};

const LevelTree = () => {
  const [currentUserRole] = useState("admin"); // "admin" | "citizen"

  const [nodes, setNodes] = useState([
    {
      id: "A1",
      name: "Alice",
      role: "CEO",
      image:
        "https://i.pinimg.com/736x/2d/95/e5/2d95e5886fc4c65a6778b5fee94a7d59.jpg",
      level: 1,
    },
    {
      id: "A2",
      name: "Bob",
      role: "CTO",
      image: "https://via.placeholder.com/50",
      level: 1,
    },
    {
      id: "B1",
      name: "Charlie",
      role: "Manager",
      image: "https://via.placeholder.com/50",
      level: 2,
    },
    {
      id: "B2",
      name: "Dana",
      role: "Designer",
      image: "https://via.placeholder.com/50",
      level: 2,
    },
  ]);

  const [levels, setLevels] = useState([1, 2, 3]);
  const [levelNames, setLevelNames] = useState({
    1: "Executive Board",
    2: "Management",
    3: "Staff",
  });
  const [editingLevel, setEditingLevel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    level: 1,
  });
  const [newLevelName, setNewLevelName] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Inline editing
  const handleLevelNameDoubleClick = (level) => setEditingLevel(level);
  const handleLevelNameChange = (level, value) => {
    setLevelNames((prev) => ({ ...prev, [level]: value }));
  };
  const handleLevelNameBlur = () => setEditingLevel(null);

  // Add node form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "level" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let finalLevel = formData.level;
    let updatedLevelNames = { ...levelNames };
    let updatedLevels = [...levels];

    if (formData.level === 0 && newLevelName.trim()) {
      const newLevelNum = Math.max(...levels) + 1;
      updatedLevels.push(newLevelNum);
      updatedLevelNames[newLevelNum] = newLevelName.trim();
      finalLevel = newLevelNum;
    }

    const id = `${formData.name.slice(0, 1).toUpperCase()}${Math.floor(
      Math.random() * 1000
    )}`;
    const newNode = { ...formData, id, level: finalLevel };

    setNodes((prev) => [...prev, newNode]);
    setLevels(updatedLevels);
    setLevelNames(updatedLevelNames);

    setFormData({ name: "", role: "", image: "", level: 1 });
    setNewLevelName("");
    setShowForm(false);
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("nodeId", id);
    setIsDragging(true);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, newLevel) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData("nodeId");
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? { ...node, level: newLevel } : node
      )
    );
    setIsDragging(false);
  };

  // Delete node
  const confirmDeleteNode = (node) => setDeleteConfirm(node);
  const handleDeleteNode = () => {
    if (!deleteConfirm) return;
    setNodes((prev) => prev.filter((node) => node.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    setSelectedNode(null);
  };

  // Edit node
  const handleEditNode = (e) => {
    e.preventDefault();
    if (!selectedNode) return;
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNode.id ? { ...selectedNode } : node
      )
    );
    setIsEditingNode(false);
    setSelectedNode(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative overflow-x-hidden">
      {currentUserRole === "admin" && (
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white px-6 py-2 rounded-full shadow-lg"
          >
            ➕ Add Node
          </button>
        </div>
      )}

      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
        8Bit Organization
      </h1>

      {/* Add Node Form */}
      {showForm && currentUserRole === "admin" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <div className="relative bg-white border border-gray-300 rounded-xl shadow-2xl p-6">
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
              Add New Node
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                placeholder="Name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="role"
                placeholder="Role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <input
                name="image"
                placeholder="Image URL"
                required
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
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
                  type="text"
                  placeholder="New Level Name"
                  value={newLevelName}
                  onChange={(e) => setNewLevelName(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              )}
              <button
                type="submit"
                className="bg-green-500 text-white w-full py-2 rounded"
              >
                ✅ Add Node
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Level Sections */}
      {levels.map((lvl) => (
        <LevelBox
          key={lvl}
          level={lvl}
          levelName={levelNames[lvl]}
          isEditing={editingLevel === lvl}
          onLevelNameDoubleClick={handleLevelNameDoubleClick}
          onLevelNameChange={handleLevelNameChange}
          onLevelNameBlur={handleLevelNameBlur}
          nodes={nodes.filter((node) => node.level === lvl)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onNodeClick={(node) => setSelectedNode(node)}
          isDragging={isDragging}
          canEditLevelName={currentUserRole === "admin"}
          canDrag={currentUserRole === "admin"}
        />
      ))}

      {/* Overlay for Node Details OR Delete Confirm (glass blur) */}
      {(selectedNode || deleteConfirm) && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
          {/* Node Details Popup */}
          {selectedNode && !deleteConfirm && (
            <div className="bg-white/95 rounded-xl p-6 w-full max-w-md relative shadow-xl">
              <button
                className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={() => {
                  setSelectedNode(null);
                  setIsEditingNode(false);
                }}
              >
                ×
              </button>

              {!isEditingNode ? (
                <>
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedNode.image}
                      alt={selectedNode.name}
                      className="w-20 h-20 rounded-full border-4 border-gray-200 mb-4 shadow-md object-cover"
                    />
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedNode.name}
                    </h2>
                    <p className="text-gray-600 italic">{selectedNode.role}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {levelNames[selectedNode.level]} (Level{" "}
                      {selectedNode.level})
                    </p>
                  </div>
                  {currentUserRole === "admin" && (
                    <div className="flex justify-around mt-6">
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
                </>
              ) : (
                <form onSubmit={handleEditNode} className="space-y-4">
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) =>
                      setSelectedNode((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={selectedNode.role}
                    onChange={(e) =>
                      setSelectedNode((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={selectedNode.image}
                    onChange={(e) =>
                      setSelectedNode((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                  <select
                    value={selectedNode.level}
                    onChange={(e) =>
                      setSelectedNode((prev) => ({
                        ...prev,
                        level: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border rounded"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {levelNames[lvl]} (Level {lvl})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-green-500 text-white w-full py-2 rounded"
                  >
                    ✅ Save Changes
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Delete Confirmation Popup */}
          {deleteConfirm && (
            <div className="bg-white/95 rounded-xl p-6 w-full max-w-sm text-center relative shadow-xl">
              <button
                className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>

              <div className="flex flex-col items-center">
                <img
                  src={deleteConfirm.image}
                  alt={deleteConfirm.name}
                  className="w-20 h-20 rounded-full border-4 border-gray-200 mb-4 shadow-md object-cover"
                />
                <h2 className="text-xl font-bold mb-2">
                  Are you sure you want to delete{" "}
                  <span className="text-red-600">{deleteConfirm.name}</span>?
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-around mt-6">
                <button
                  onClick={handleDeleteNode}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded shadow"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LevelTree;
