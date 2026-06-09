import type { FilterType } from '../types';

interface Props {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const TABS: { label: string; value: FilterType }[] = [
  { label: '전체', value: 'all' },
  { label: '진행 중', value: 'active' },
  { label: '완료', value: 'completed' },
];

export default function FilterTabs({ activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-4">
      {TABS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          onClick={() => onFilterChange(value)}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeFilter === value
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
