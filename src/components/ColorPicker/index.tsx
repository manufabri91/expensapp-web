'use client';

import {
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorPicker as HeroUIColorPicker,
  Label,
  parseColor,
} from '@heroui/react';
import type { Color } from '@heroui/react';
import { useState } from 'react';

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

interface ColorPickerProps {
  label?: string;
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ color, onChange, label = 'Color' }: ColorPickerProps) => {
  const [value, setValue] = useState(parseColor(color || '#000000'));

  const handleChange = (newColor: Color) => {
    setValue(newColor);
    onChange(newColor.toString('hex'));
  };

  return (
    <HeroUIColorPicker value={value} onChange={handleChange}>
      <HeroUIColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <Label>{label}</Label>
      </HeroUIColorPicker.Trigger>
      <HeroUIColorPicker.Popover className="gap-2">
        <ColorSwatchPicker className="justify-center pt-2" size="xs">
          {PRESET_COLORS.map((preset) => (
            <ColorSwatchPicker.Item key={preset} color={preset}>
              <ColorSwatchPicker.Swatch />
            </ColorSwatchPicker.Item>
          ))}
        </ColorSwatchPicker>
        <ColorArea
          aria-label="Color area"
          className="max-w-full"
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider aria-label="Hue slider" channel="hue" className="flex-1 px-1" colorSpace="hsb">
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
        <ColorField aria-label="Color field">
          <ColorField.Group variant="secondary">
            <ColorField.Prefix>
              <ColorSwatch size="xs" />
            </ColorField.Prefix>
            <ColorField.Input />
          </ColorField.Group>
        </ColorField>
      </HeroUIColorPicker.Popover>
    </HeroUIColorPicker>
  );
};
