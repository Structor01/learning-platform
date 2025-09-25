import React from 'react';
import { Button } from '@/components/ui/button';

const OptionsButtons = ({ options, onSelectOption, disabled = false }) => {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelectOption(option)}
          disabled={disabled}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default OptionsButtons;