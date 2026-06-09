import { useState } from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onAdd: (text: string) => void;
}

export default function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError(true);
      return;
    }
    onAdd(trimmed);
    setText('');
    setError(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (e.target.value.trim()) setError(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAdd();
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력하세요"
          autoComplete="off"
          className={`flex-1 border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-300 ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:border-indigo-300'
          }`}
        />
        <button
          type="button"
          onClick={handleAdd}
          aria-label="추가"
          className="w-10 h-10 flex items-center justify-center bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 active:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1.5 ml-1">할 일을 입력해주세요.</p>
      )}
    </div>
  );
}
