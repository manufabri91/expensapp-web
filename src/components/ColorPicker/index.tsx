'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { HexColorPicker } from 'react-colorful';

import useClickOutside from '@/hooks/useClickOutside';
import { Button, ButtonVariant } from '@/components/Button';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#85bb65',
  '#8ea6d6',
  '#ffa600',
  '#c0242b',
  '#fcb49d',
  '#3f83f8',
  '#5e246e',
  '#035c02',
  '#74d9fb',
  '#9d8c75',
  '#81817e',
  '#9a2151',
];

export const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const t = useTranslations('Generics');
  const popover = useRef<HTMLDivElement>(null);
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <div>
      <div className="absolute z-20">
        <div
          style={{
            backgroundColor: color,
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            border: '3px solid #fff',
            boxShadow: ' 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
          onClick={() => toggle(true)}
        />

        {isOpen && (
          <div
            className="bg-white dark:bg-slate-500"
            style={{
              position: 'absolute',
              top: 'calc(100% + 2px)',
              left: '0',
              borderRadius: '9px',
              boxShadow: ' 0 6px 12px rgba(0, 0, 0, 0.15)',
            }}
            ref={popover}
          >
            <HexColorPicker color={color} onChange={onChange} />
            <div className="grid grid-cols-4 p-3">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  type="button"
                  key={presetColor}
                  className="m-1 size-6 rounded-md"
                  style={{ background: presetColor }}
                  onClick={() => {
                    onChange(presetColor);
                    toggle(false);
                  }}
                />
              ))}
            </div>
            <div className="m-2">
              <Button
                variant={ButtonVariant.Primary}
                fullSized
                type="button"
                onClick={() => {
                  onChange('');
                  toggle(false);
                }}
              >
                {t('clear')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
