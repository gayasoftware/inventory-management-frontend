import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface Option {
    value: string | number;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
}

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select...",
    required = false,
    className = "",
    disabled = false
}: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const selectRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : '';

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setIsOpen(true);
                setHighlightedIndex(prev => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                break;
        }
    };

    const handleSelect = (value: string | number) => {
        onChange(value);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpen(true);
        setHighlightedIndex(-1);

        // If there's only one match and they typed the exact label, select it
        if (value) {
            const matchingOption = options.find(opt =>
                opt.label.toLowerCase() === value.toLowerCase()
            );
            if (matchingOption) {
                handleSelect(matchingOption.value);
            }
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    return (
        <div className={clsx("relative", className)} ref={selectRef}>
            <div
                className={clsx(
                    "relative w-full bg-white border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-left cursor-default",
                    "focus:ring-2 focus:border-primary-500 focus:outline-none transition-colors",
                    disabled && "bg-gray-50 cursor-not-allowed",
                    isOpen && "ring-2 ring-primary-200 border-primary-500"
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className={clsx(
                        "w-full pr-10 bg-transparent outline-none placeholder-gray-400",
                        disabled && "cursor-not-allowed"
                    )}
                    placeholder={displayValue || placeholder}
                    value={isOpen ? searchTerm : displayValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    required={required}
                />
                <div className="absolute right-0 inset-y-0 flex items-center pr-3">
                    <ChevronDown className={clsx(
                        "h-4 w-4 text-gray-400 transition-transform duration-200",
                        isOpen && "transform rotate-180"
                    )} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                            No options found
                        </div>
                    ) : (
                        filteredOptions.map((option, index) => (
                            <div
                                key={option.value}
                                className={clsx(
                                    "px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
                                    index === highlightedIndex && "bg-primary-50 text-primary-700",
                                    option.value === value && "bg-primary-100 font-medium"
                                )}
                                onClick={() => handleSelect(option.value)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <span className="block truncate">{option.label}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
