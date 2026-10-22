// Canvas UI tabs.tsx adapted to JSX and Prospect CSS tokens.
// Upstream a04a99b; see public/licenses/canvas-ui-LICENSE.md.
import React from "react";
import { Tabs as Primitive } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import clsx from "clsx";
const listVariants = cva("tabs-list", {
  variants: { variant: { default: "tabs-filled", line: "tabs-line" } },
  defaultVariants: { variant: "line" },
});
export function Tabs({ className, orientation = "horizontal", ...props }) {
  return (
    <Primitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={clsx("tabs", className)}
      {...props}
    />
  );
}
export function TabsList({ className, variant = "line", ...props }) {
  return (
    <Primitive.List
      data-slot="tabs-list"
      className={clsx(listVariants({ variant }), className)}
      {...props}
    />
  );
}
export function TabsTrigger({ className, ...props }) {
  return (
    <Primitive.Tab
      data-slot="tabs-trigger"
      className={clsx("tabs-trigger", className)}
      {...props}
    />
  );
}
export function TabsContent({ className, ...props }) {
  return (
    <Primitive.Panel
      data-slot="tabs-content"
      className={clsx("tabs-panel", className)}
      {...props}
    />
  );
}
