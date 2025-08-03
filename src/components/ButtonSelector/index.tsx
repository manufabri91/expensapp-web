interface RadioSelectorOption {
  id: string;
  label: string;
  colorClass?: string;
}

interface RadioSelectorProps {
  options: RadioSelectorOption[];
  value?: string;
  onChange: (id: string) => void;
  fieldName: string;
}

export const ButtonSelector = ({ options, value, onChange, fieldName }: RadioSelectorProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };
  return (
    <div className="flex w-full items-center justify-center">
      <div className="inline-flex w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
        {options.map((option) => (
          <label key={option.id} htmlFor={option.id} className="flex-1 cursor-pointer">
            <input
              type="radio"
              name={fieldName}
              id={option.id}
              value={option.id}
              className="peer sr-only"
              checked={value === option.id}
              onChange={handleChange}
            />
            <span className="relative inline-flex size-full items-center justify-center space-x-2 py-2 pl-7 pr-3 text-sm hover:bg-slate-200 peer-checked:border-b-2 peer-checked:border-emerald-600 peer-checked:bg-slate-300 hover:dark:bg-slate-600 peer-checked:dark:border-emerald-500 peer-checked:dark:bg-slate-800">
              <span
                className={`before:absolute before:left-3 before:top-[14px] before:size-2 before:rounded-full ${option.colorClass ?? 'before:bg-blue-500'}`}
              >
                {option.label}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
