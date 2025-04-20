"use client"

interface CustomRadioProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  name: string
}

export function CustomRadio({ options, value, onChange, name }: CustomRadioProps) {
  return (
    <div className="flex flex-col space-y-2">
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`${name}-${option.value}`} className="text-sm font-normal cursor-pointer">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  )
}
