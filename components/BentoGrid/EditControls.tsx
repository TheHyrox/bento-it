'use client';

interface EditControlsProps {
  editMode: boolean;
  onToggleEdit: () => void;
  onAddBlock: () => void;
}

export default function EditControls({ editMode, onToggleEdit, onAddBlock }: EditControlsProps) {
  return (
    <div className="mb-4 flex justify-end gap-2">
      <button
        onClick={onToggleEdit}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
      >
        {editMode ? 'Save Layout' : 'Edit Layout'}
      </button>
      {editMode && (
        <button
          onClick={onAddBlock}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
        >
          Add Block
        </button>
      )}
    </div>
  );
}