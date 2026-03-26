import { FormInput, SelectInput, Button } from "./index";

type FilterType = "input" | "select";

export interface FilterField {
  key: string;
  label?: string;
  type: FilterType;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface Props {
  fields: FilterField[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onReset?: () => void; // 🔥 only reset needed
}

const FilterBar = ({
  fields,
  values,
  onChange,
  onReset,
}: Props) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md">

      {/* 🔥 FLEX CONTAINER */}
      <div className="flex flex-wrap gap-4 items-end">

        {/* 🔥 FILTER FIELDS */}
        <div className="flex flex-wrap gap-4 flex-1">
          {fields.map((field) => {
            const value = values[field.key] || "";

            if (field.type === "input") {
              return (
                <div key={field.key} className="min-w-50">
                  <FormInput
                    label={field.label}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) =>
                      onChange(field.key, e.target.value)
                    }
                  />
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.key} className="min-w-45">
                  <SelectInput
                    label={field.label}
                    value={value}
                    onChange={(e) =>
                      onChange(field.key, e.target.value)
                    }
                    options={field.options || []}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* 🔥 RESET BUTTON RIGHT */}
        {onReset && (
          <div className="ml-auto">
            <Button variant="secondary" onClick={onReset}>
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;