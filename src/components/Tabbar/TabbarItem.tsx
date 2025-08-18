import type { JSX, ReactNode } from "react";

import { Caption, Badge } from "@telegram-apps/telegram-ui";
import clsx from "clsx";

export interface TabbarItemProps {
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
  backdrop?: boolean;
  onClick?: VoidFunction;
  badgeCount?: number;
}

export const TabbarItem = ({
  icon,
  children,
  active = false,
  backdrop,
  onClick,
  badgeCount,
}: TabbarItemProps): JSX.Element => {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      className={clsx(
        "flex flex-1 flex-col items-center justify-center pt-2",
        "cursor-pointer outline-0",
        backdrop
          ? active
            ? "text-white"
            : "text-white/50"
          : active
          ? "text-tgui-link"
          : ""
      )}
      role="tab"
      aria-selected={active}
      tabIndex={active ? -1 : 0}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center w-[28px] h-[28px] mb-1">
        {icon}
        {!!badgeCount && (
          <div
            style={{
              position: "absolute",
              top: -8,
              right: -15,
            }}
          >
            <Badge
              style={{ background: "var(--tgui--link_color)" }}
              type={"number"}
            >
              {badgeCount}
            </Badge>
          </div>
        )}
      </div>

      <Caption level="2" weight="3">
        {children}
      </Caption>
    </div>
  );
};
