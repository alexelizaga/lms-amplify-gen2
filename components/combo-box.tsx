import React from "react";
import { Autocomplete } from "@aws-amplify/ui-react";

interface ComboboxProps {
  options?: { label: string; id: string }[];
  value?: string;
  onChange: (valor: string) => void;
}

export const Combobox = ({
  options,
  value,
  onChange: onSelectValue,
}: ComboboxProps) => {
  const onSelect = (option: { id: string; label: string }) => {
    onSelectValue(option.id);
  };

  return (
    <Autocomplete
      label="ComboBox"
      placeholder="Select option..."
      options={options ?? []}
      value={value}
      onSelect={onSelect}
    />
  );
};
