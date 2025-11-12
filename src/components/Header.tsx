'use client';

import { useAppStore } from '@/lib/store';
import { Switch } from '@/components/ui/switch';
import { LIMITS } from '@/lib/constants';

export function Header() {
  const { text, annotationsVisible, toggleAnnotations } = useAppStore();
  const charCount = text.length;
  const isNearLimit = charCount >= LIMITS.warnAtCharacters;
  const isOverLimit = charCount > LIMITS.maxCharacters;

  return (
    <header className="border-b bg-white px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <h1 className="text-ui-title text-gray-900">
            Claude
          </h1>
          <div
            className={`text-ui-body-small ${
              isOverLimit
                ? 'text-red-600 font-semibold'
                : isNearLimit
                ? 'text-yellow-600'
                : 'text-gray-500'
            }`}
          >
            {charCount} / {LIMITS.maxCharacters}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="annotations-toggle"
              checked={annotationsVisible}
              onCheckedChange={toggleAnnotations}
            />
            <label
              htmlFor="annotations-toggle"
              className="text-ui-body-small text-gray-700 cursor-pointer"
            >
              Show Annotations
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}

