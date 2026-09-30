import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import type { FaTableAction } from "../types/FaTableTypes";

type Position = "top" | "bottom" | "left" | "right";

type FaTableActionsProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  position?: Position;
  parentEl?: string | HTMLElement;
  item: unknown;
  actions?: Array<FaTableAction>;
};

export default function FaTableActions({
  position = "bottom",
  parentEl,
  item,
  actions,
}: FaTableActionsProps) {
  const [ready, setReady] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getParent = useCallback((): HTMLElement | null => {
    if (!parentEl) {
      return buttonRef.current?.parentElement ?? null;
    }

    if (typeof parentEl === "string") {
      return document.querySelector<HTMLElement>(parentEl);
    }

    return parentEl;
  }, [parentEl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 100);

    return () => clearTimeout(timer);
  });

  // Coordinates are relative to the viewport (the dropdown is position: fixed)
  const positionDropdown = useCallback(
    (position: Position = "bottom", minWidth = 250) => {
      const parentElem = getParent();
      const dropdownEl = dropdownRef.current;

      if (!dropdownEl || !parentElem) return null;

      const parentRect = parentElem.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;

      const parentWidth = parentRect.width;
      const dropdownHeight = dropdownEl.offsetHeight;
      const dropdownWidth = parentWidth < minWidth ? minWidth : parentWidth;
      let top: number;
      let left: number;

      switch (position) {
        case "top":
          top = parentRect.top - dropdownHeight;
          left = parentRect.left;

          // Check if too close to the top edge
          if (top < 0) {
            top = parentRect.bottom;
          }
          // Set left regarding minWidth
          if (parentWidth < minWidth) {
            left = parentRect.left - (minWidth - parentWidth);
          }
          // Check if too close to the left edge
          if (left < 0) {
            left = parentRect.right;
          }
          break;
        case "left":
          top = parentRect.top;
          left = parentRect.left - parentWidth;

          // Check if too close to the left edge
          if (left < 0) {
            left = parentRect.right;
          }
          if (parentWidth < minWidth) {
            left = left - (minWidth - parentWidth);
          }
          break;
        case "right":
          top = parentRect.top;
          left = parentRect.right;

          // Check if too close to the right edge
          if (left + dropdownWidth > viewportWidth) {
            left = parentRect.left - dropdownWidth;
          }
          break;
        case "bottom":
        default: {
          top = parentRect.bottom;
          left = parentRect.left;

          // Check if too close to the bottom edge (default is bottom)
          if (top + dropdownHeight > viewportHeight) {
            top = parentRect.top - dropdownHeight;
          }

          // Set left regarding minWidth
          if (parentWidth < minWidth) {
            left = parentRect.left - (minWidth - parentWidth);
          }
          // Check if too close to the left edge
          if (left < 0) {
            left = parentRect.right;
          }
        }
      }

      return { top, left, width: dropdownWidth };
    },
    [getParent],
  );

  const updatePosition = useCallback(() => {
    const dropdownEl = dropdownRef.current;
    const result = positionDropdown(position);
    if (!dropdownEl || !result) return;

    dropdownEl.style.top = `${result.top}px`;
    dropdownEl.style.left = `${result.left}px`;
    dropdownEl.style.width = `${result.width}px`;
  }, [positionDropdown, position]);

  const closeDropdown = useCallback((timeout = 0) => {
    setTimeout(() => setDropdownOpen(false), timeout);
  }, []);

  const openDropdown = useCallback(() => {
    setDropdownOpen(true);
  }, []);

  const actionClicked = (action: FaTableAction, middleClick = false) => {
    closeDropdown();
    action.callback?.(item, middleClick);
  };

  // Position the dropdown once it's rendered (equivalent to $nextTick)
  useLayoutEffect(() => {
    if (dropdownOpen) updatePosition();
  }, [dropdownOpen, updatePosition]);

  // Close on click outside, scroll or resize while the dropdown is open
  useEffect(() => {
    if (!dropdownOpen) return;

    const clickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutside =
        !dropdownRef.current?.contains(target) &&
        !getParent()?.contains(target);

      if (isOutside) closeDropdown();
    };

    // The dropdown is fixed on screen, so any scroll or resize would leave it misplaced
    const scrollOutside = (e: Event) => {
      if (!dropdownRef.current?.contains(e.target as Node)) closeDropdown();
    };
    const onResize = () => closeDropdown();

    const timer = setTimeout(() => {
      window.addEventListener("mousedown", clickOutside);
    }, 100);
    window.addEventListener("scroll", scrollOutside, true);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", clickOutside);
      window.removeEventListener("scroll", scrollOutside, true);
      window.removeEventListener("resize", onResize);
    };
  }, [dropdownOpen, getParent, closeDropdown]);

  return (
    <>
      <button
        onClick={openDropdown}
        ref={buttonRef}
        style={{ position: "relative" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
      {ready && dropdownOpen
        ? createPortal(
            <div
              className="fa-table-dropdown"
              style={{ position: "fixed" }}
              ref={dropdownRef}
            >
              <ul>
                {actions?.map(
                  (action, actionIndex) =>
                    (!action.hideWhenFn || !action.hideWhenFn(item)) && (
                      <li key={actionIndex}>
                        {action.to ? (
                          <a href={action.to(item)}>
                            <small>{action.title}</small>
                          </a>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actionClicked(action);
                            }}
                            onAuxClick={(e) => {
                              if (e.button !== 1) return;
                              e.stopPropagation();
                              actionClicked(action, true);
                            }}
                          >
                            <small>{action.title}</small>
                          </button>
                        )}
                      </li>
                    ),
                )}
              </ul>
            </div>,
            document.body,
          )
        : ""}
    </>
  );
}
