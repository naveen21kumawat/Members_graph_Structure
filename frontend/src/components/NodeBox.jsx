import React from "react";

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
      className="w-14 h-14 rounded-full border-4 border-white mb-2 shadow-md"
    />
    <div className="font-bold text-sm">{node.name}</div>
    <div className="text-xs italic text-gray-600">{node.role}</div>
  </div>
);

export default NodeBox;
