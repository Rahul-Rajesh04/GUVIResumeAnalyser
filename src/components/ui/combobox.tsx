import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  allowCustomValue?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  emptyText = "No option found.",
  className,
  allowCustomValue = false
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    onChange(newValue);
    setInputValue(newValue);
    setOpen(false);
  };

  const displayValue = options.find((option) => option.value.toLowerCase() === value?.toLowerCase())?.label || value;

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen && allowCustomValue) {
        // When the popover closes, if there's a typed value that doesn't match an option, set it.
        const matchingOption = options.find(option => option.label.toLowerCase() === inputValue.toLowerCase());
        if (!matchingOption) {
          onChange(inputValue);
        }
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-muted/30 hover:bg-muted/50 border-border/50 text-left font-normal h-12",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate pr-2">
            {displayValue || placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover border-border">
        <Command className="bg-transparent" filter={(value, search) => {
            const option = options.find(option => option.value === value);
            if (option) {
                return option.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
            }
            return 0;
        }}>
          <CommandInput 
            placeholder={`Search...`} 
            className="h-9 border-0 focus:ring-0"
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            {emptyText}
          </CommandEmpty>
          <CommandList>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}