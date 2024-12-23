'use client';

import { Button, Drawer, Select, Sidebar, ThemeMode, useThemeMode } from 'flowbite-react';
import { useState } from 'react';
import { HiCheck, HiCog, HiMoon, HiPaintBrush } from 'react-icons/hi2';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: Props) {
  const { computedMode, setMode } = useThemeMode();
  return (
    <Drawer open={open} onClose={onClose} className="z-[9999]" position="right">
      <Drawer.Header title="Settings" titleIcon={() => <></>} />
      <Drawer.Items>
        <Sidebar>
          <Sidebar.Items>
            <Sidebar.Collapse icon={HiPaintBrush} label="Theme Mode">
              <Sidebar.Item href="#" onClick={() => setMode('auto')}>
                System
              </Sidebar.Item>
              <Sidebar.Item href="#" onClick={() => setMode('dark')}>
                <span className="flex gap-1 align-baseline">{<HiCheck />} Dark</span>
              </Sidebar.Item>
              <Sidebar.Item href="#" onClick={() => setMode('light')}>
                Light
              </Sidebar.Item>
            </Sidebar.Collapse>
          </Sidebar.Items>
          {/* <Sidebar.ItemGroup>
            <h3>App Settings</h3>
            <Sidebar.Item>
              <Select value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">System</option>
              </Select>
            </Sidebar.Item>
          </Sidebar.ItemGroup> */}
        </Sidebar>
      </Drawer.Items>
    </Drawer>
  );
}
