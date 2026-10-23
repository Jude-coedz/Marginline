import React from "react";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Settings2, LockKeyhole } from "lucide-react";
export default function WorkspaceMenu({ onSettings, onLock, unlocked, busy }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        className="workspace-menu-trigger"
        aria-label="Workspace menu"
      >
        <span className="workspace-initials">MD</span>
        <span className="workspace-menu-label">Workspace</span>
        <ChevronDown size={14} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="menu-positioner" sideOffset={8} align="end">
          <Menu.Popup className="menu-popup">
            <div className="menu-caption">MyDigital-Metrics</div>
            <Menu.Item className="menu-item" onClick={onSettings}>
              <Settings2 size={16} aria-hidden="true" />
              Workspace settings
            </Menu.Item>
            <Menu.Separator className="menu-separator" />
            <Menu.Item
              className="menu-item"
              disabled={!unlocked || busy}
              onClick={onLock}
            >
              <LockKeyhole size={16} aria-hidden="true" />
              Lock workspace
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
