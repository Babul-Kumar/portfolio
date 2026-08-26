'use client'

import { Search, X, LayoutGrid, ListFilter, SlidersHorizontal } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  categories?: string[]
  selectedCategory?: string
  onSelectCategory?: (cat: string) => void
  statusFilter?: string
  onSelectStatus?: (status: string) => void
  statusOptions?: { label: string; value: string }[]
  viewMode?: 'grid' | 'table'
  onToggleViewMode?: (mode: 'grid' | 'table') => void
  totalCount?: number
  filteredCount?: number
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search records…',
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  statusFilter = 'all',
  onSelectStatus,
  statusOptions,
  viewMode,
  onToggleViewMode,
  totalCount,
  filteredCount,
}: SearchBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '24px',
      }}
    >
      {/* Primary Toolbar Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            position: 'relative',
            flex: '1 1 260px',
            minWidth: '220px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6B7280',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '9px 36px 9px 36px',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#F5F5F5',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(228, 93, 44, 0.6)'
              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(228, 93, 44, 0.3)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Dropdown Filter */}
        {statusOptions && onSelectStatus && (
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => onSelectStatus(e.target.value)}
              style={{
                padding: '9px 30px 9px 12px',
                background: '#13171F',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#D1D5DB',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal
              size={13}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {/* View Mode Toggle (Grid vs Table) */}
        {viewMode && onToggleViewMode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#13171F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2px',
              marginLeft: 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => onToggleViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#1E232E' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#F5F5F5' : '#6B7280',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              aria-label="Grid view"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#1E232E' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? '#F5F5F5' : '#6B7280',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              aria-label="Table view"
            >
              <ListFilter size={14} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Categories Horizontal Filter Pills */}
      {categories.length > 0 && onSelectCategory && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 400,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected
                    ? '1px solid rgba(228, 93, 44, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isSelected ? 'rgba(228, 93, 44, 0.15)' : '#101318',
                  color: isSelected ? '#E45D2C' : '#9CA3AF',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      )}

      {/* Result stats summary if filtering is active */}
      {(value || (selectedCategory && selectedCategory !== 'All') || (statusFilter && statusFilter !== 'all')) && (
        <div
          style={{
            fontSize: '12px',
            color: '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            Showing <strong style={{ color: '#F5F5F5' }}>{filteredCount ?? 0}</strong> of{' '}
            {totalCount ?? 0} records
          </span>
          {(value || selectedCategory !== 'All' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                if (onSelectCategory) onSelectCategory('All')
                if (onSelectStatus) onSelectStatus('all')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#E45D2C',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
