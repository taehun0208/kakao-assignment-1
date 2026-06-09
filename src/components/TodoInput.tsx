import { useState } from 'react';

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
          className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${
            error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 active:bg-indigo-700 transition-colors"
        >
          추가
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">할 일을 입력해주세요.</p>
      )}
    </div>
  );
}
