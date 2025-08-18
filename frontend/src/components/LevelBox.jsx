import React from "react";
import NodeBox from "./NodeBox";

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

export default LevelBox;
