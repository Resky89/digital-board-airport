import { useState, useRef, useEffect } from 'react';
import { useLazyLoad } from '@/app/hooks/useLazyLoad';
import LoadingSpinner from './LoadingSpinner';

interface LazySelectProps<T extends { id: number; [key: string]: unknown }> {
  label: string;
  value: string | number | '';
  onChange: (value: number | '') => void;
  fetchFunction: (params: Record<string, string>) => Promise<{
    success: boolean;
    data: T[] | { items: T[]; pagination?: any };
    meta?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>;
  fetchParams?: Record<string, string>;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  pageSize?: number;
}

export default function LazySelect<T extends { id: number }>({
  label,
  value,
  onChange,
  fetchFunction,
  fetchParams = {},
  getOptionLabel,
  getOptionValue,
  placeholder = 'Select option',
  required = false,
  disabled = false,
  className = 'input-field',
  pageSize = 20,
}: LazySelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    data: options,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    loadMore,
    refresh,
  } = useLazyLoad<T>({
    fetchFunction,
    initialParams: fetchParams,
    pageSize,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50 && hasMore && !loadingMore) {
      loadMore();
    }
  };

  const selectedOption = options.find(opt => getOptionValue(opt) === Number(value));

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-white/80 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div
        className={`relative cursor-pointer ${disabled ? 'opacity-50' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={className}>
          <span className={selectedOption ? 'text-white' : 'text-white/40'}>
            {selectedOption ? getOptionLabel(selectedOption) : placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 glass-card border border-white/10 max-h-60 overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary/50 text-sm"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          
          <div
            className="max-h-48 overflow-y-auto"
            onScroll={handleScroll}
          >
            {loading && !loadingMore ? (
              <div className="p-4 text-center">
                <LoadingSpinner />
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-white/60">
                No options found
              </div>
            ) : (
              options.map((option) => (
                <div
                  key={option.id}
                  className={`px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors ${
                    getOptionValue(option) === Number(value) ? 'bg-primary/30' : ''
                  }`}
                  onClick={() => {
                    onChange(getOptionValue(option));
                    setIsOpen(false);
                  }}
                >
                  {getOptionLabel(option)}
                </div>
              ))
            )}
            
            {loadingMore && (
              <div className="p-4 text-center text-white/60">
                Loading more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}