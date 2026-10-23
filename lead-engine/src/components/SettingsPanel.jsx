import React from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { Button } from "./Controls";
export default function SettingsPanel({ open, onOpenChange, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="settings-backdrop" />
        <Dialog.Popup className="settings-panel">
          <header className="settings-header">
            <div>
              <Dialog.Title className="settings-title">
                Workspace settings
              </Dialog.Title>
              <Dialog.Description className="settings-description">
                Access and storage for your research workspace.
              </Dialog.Description>
            </div>
            <Dialog.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close workspace settings"
                />
              }
            >
              <X size={19} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="settings-body">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
