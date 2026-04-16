/**
 * MACROSCOPE PERFORMANCE OS - SEARCHABLE INPUT COMPONENT
 * Input with dropdown suggestions
 */

import { useState, useEffect, useRef } from 'react';

interface SearchableInputProps<T> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: T) => void;
  searchResults: T[];
  onSearch: (query: string) => void;
  getItemLabel: (item: T) => string;
  getItemDescription?: (item: T) => string;
  placeholder?: string;
  searching?: boolean;
}

export function SearchableInput<T>({
  label,
  value,
  onChange,
  onSelect,
  searchResults,
  onSearch,
  getItemLabel,
  getItemDescription,
  placeholder,
  searching = false,
}: SearchableInputProps<T>) {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    if (newValue.trim().length >= 2) {
      onSearch(newValue);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelect = (item: T) => {
    onSelect(item);
    onChange(getItemLabel(item));
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-wider uppercase text-[#737373]">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (value.trim().length >= 2 && searchResults.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="bg-[#0a0a0a] border border-[#262626] rounded px-3 py-2.5 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#00D4FF] transition-colors duration-150"
        />
      </div>

      {showDropdown && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#0a0a0a] border border-[#262626] rounded shadow-lg max-h-64 overflow-y-auto">
          {searching && (
            <div className="px-3 py-2 text-xs text-[#737373]">Searching...</div>
          )}
          {searchResults.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2.5 text-left hover:bg-[#1a1a1a] transition-colors text-sm border-b border-[#262626] last:border-b-0"
            >
              <div className="text-[#e5e5e5]">{getItemLabel(item)}</div>
              {getItemDescription && (
                <div className="text-xs text-[#737373] mt-0.5">{getItemDescription(item)}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
