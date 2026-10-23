// Canvas UI button.tsx, input.tsx and select.tsx adapted to JSX and Prospect tokens.
// Upstream a04a99b; full terms: public/licenses/canvas-ui-LICENSE.md.
import React, { useId } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cva } from "class-variance-authority";
import clsx from "clsx";
import { ChevronDown, Check } from "lucide-react";
const variants = cva("control-button", {
  variants: {
    variant: {
      primary: "control-primary",
      secondary: "control-secondary",
      ghost: "control-ghost",
      danger: "control-danger",
    },
    size: {
      default: "control-default",
      small: "control-small",
      icon: "control-icon",
    },
  },
  defaultVariants: { variant: "secondary", size: "default" },
});
export const Button = React.forwardRef(function Button(
  { variant = "secondary", size = "default", className, ...props },
  ref,
) {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={clsx(variants({ variant, size }), className)}
      {...props}
    />
  );
});
export const Input = React.forwardRef(function Input(
  { className, ...props },
  ref,
) {
  return (
    <InputPrimitive
      ref={ref}
      data-slot="input"
      className={clsx("control-input", className)}
      {...props}
    />
  );
});
export function SelectField({
  label,
  options,
  value,
  onChange,
  disabled = false,
  container,
}) {
  const id = useId();
  const items = options.map(([value, label]) => ({ value, label }));
  return (
    <div className="control-field">
      <label id={id} htmlFor={id + "-trigger"}>
        {label}
      </label>
      <SelectPrimitive.Root
        items={items}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          id={id + "-trigger"}
          className="select-trigger"
          aria-labelledby={id}
          data-slot="select-trigger"
        >
          <SelectPrimitive.Value className="select-value" />
          <SelectPrimitive.Icon className="select-icon">
            <ChevronDown size={16} aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal container={container}>
          <SelectPrimitive.Positioner
            className="select-positioner"
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
          >
            <SelectPrimitive.Popup
              className="select-popup"
              data-slot="select-content"
            >
              <SelectPrimitive.List>
                {items.map((item) => (
                  <SelectPrimitive.Item
                    key={item.value}
                    value={item.value}
                    className="select-item"
                    data-slot="select-item"
                  >
                    <SelectPrimitive.ItemText>
                      {item.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="select-check">
                      <Check size={15} aria-hidden="true" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.List>
            </SelectPrimitive.Popup>
          </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
