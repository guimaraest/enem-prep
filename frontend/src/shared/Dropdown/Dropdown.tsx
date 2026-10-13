import './Dropdown.css'

export interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
}

export function Dropdown({ label, value, options, onChange }: DropdownProps) {
  return (
    <label className="dropdown">
      <span>{label}</span>
      <select
        className="dropdown-select"
        value={value}
        onChange={(event) => {
          const selected = options.find((option) => option.value === event.target.value)
          if (selected) onChange(selected.value)
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
