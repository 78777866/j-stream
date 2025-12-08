import * as React from 'react';
import { cn, debounce } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
  containerClassName?: string;
  value: string;
  open: boolean;
  onChange: (value: string) => Promise<void>;
  onChangeStatusOpen: (value: boolean) => void;
  debounceTimeout?: number;
  maxLength?: number;
}

export function DebouncedInput({
  id = 'query',
  containerClassName,
  open,
  value,
  onChange,
  maxLength = 80,
  debounceTimeout = 300,
  onChangeStatusOpen,
  className,
  ...props
}: DebouncedInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // close search input on clicking outside,
  useOnClickOutside(inputRef, () => {
    if (!value) onChangeStatusOpen(false);
  });

  // configure keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // close search input on pressing escape
      if (e.key === 'Escape') {
        void onChange('');
      }
      // open search input on pressing ctrl + k or cmd + k
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (!inputRef.current) return;
        e.preventDefault();
        onChangeStatusOpen(true);
        inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const debounceInput = React.useCallback(
    debounce((value) => {
      const strValue = value as string;
      void onChange(strValue);
    }, debounceTimeout),
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounceInput(event.target.value);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      void onChange('');
    }
  };

  return (
    <div className={cn('relative', containerClassName)}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder="Search movies, TV shows..."
        className={cn(
          'h-9 sm:h-auto rounded-lg sm:rounded-none py-1.5 pl-8 pr-8 sm:pr-2 text-sm transition-all duration-300',
          open
            ? 'w-full sm:w-28 md:w-40 lg:w-60 border'
            : 'w-0 border-none bg-transparent',
          className,
        )}
        defaultValue={value}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      <Button
        id="search-btn"
        aria-label="Search"
        variant="ghost"
        className={cn(
          'absolute top-1/2 h-7 w-7 sm:h-auto sm:w-auto -translate-y-1/2 rounded-full p-1 hover:bg-transparent',
          open ? 'left-1' : 'left-[9px]',
        )}
        onClick={() => {
          if (!inputRef.current) {
            return;
          }
          inputRef.current.focus();
          onChangeStatusOpen(!open);
        }}>
        <Icons.search
          className={cn(
            'transition-opacity hover:opacity-75 active:scale-95',
            open ? 'h-4 w-4' : 'h-5 w-5',
          )}
          aria-hidden="true"
        />
      </Button>
      {/* Clear button */}
      {open && value && (
        <Button
          aria-label="Clear search"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full p-0 hover:bg-transparent"
          onClick={handleClear}
        >
          <Icons.close className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
