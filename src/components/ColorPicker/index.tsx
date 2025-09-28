'use client';

import { useTranslations } from 'next-intl';
import React, { useCallback, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

import { Button } from '@/components/Button';
import useClickOutside from '@/hooks/useClickOutside';

interface ColorPickerProps {
  label?: string;
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

export const ColorPicker = ({ color, onChange, label = 'Color' }: ColorPickerProps) => {
  const t = useTranslations('Generics');
  const popover = useRef<HTMLDivElement>(null);
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <>
      <div className="flex w-min flex-col items-center gap-2">
        <span className="text-sm">{label}</span>
        <div
          className="size-10 cursor-pointer rounded-xl border-2 border-stone-800 dark:border-stone-100"
          style={{
            backgroundColor: color,
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => toggle(true)}
        />
      </div>
      {isOpen && (
        <div className="fixed z-20">
          <div className="absolute">
            <div
              className="dark:bg-brand-purple-800 bg-white"
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
                  color="primary"
                  fullWidth
                  type="button"
                  onPress={() => {
                    onChange('');
                    toggle(false);
                  }}
                >
                  {t('clear')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
