"use client"

import { Search } from "lucide-react"

interface AutocompleteDropdownProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

export function AutocompleteDropdown({ suggestions, onSelect }: AutocompleteDropdownProps) {
  if (suggestions.length === 0) return null

  return (
    <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-xl border border-border bg-card shadow-lg">
      {suggestions.map((suggestion) => (
        <li key={suggestion}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(suggestion)
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {suggestion}
          </button>
        </li>
      ))}
    </ul>
  )
}
