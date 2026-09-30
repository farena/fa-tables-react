import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";
import FaTableFiltersSection from "./FaTableFiltersSection";
import type {
  FaTableFilter,
  FaTableFilterOptionObjValue,
  FaTableFilterSectionValueType,
} from "../types/FaTableTypes";

const defaultLang = {
  title: "FILTERS",
  showItems: "Show Items",
  sortBy: "Sort By",
  hiddenColumns: "Hidden Columns",
  clearAll: "Clear All",
  applyFilters: "Apply filters",
  allOption: "All",
  yes: "Yes",
  no: "No",
};

type FaTableFiltersModalLang = typeof defaultLang;

interface FaTableFiltersModalProps {
  filters: Array<FaTableFilter>;
  showOpts: Array<string>;
  hideOpts: Array<FaTableFilterOptionObjValue>;
  sortOpts: Array<FaTableFilterOptionObjValue>;
  lang: FaTableFiltersModalLang;
  value: Record<string, unknown>;
  /** Called once the exit animation has finished, so the parent can unmount the modal. */
  onClose: () => void;
  onClearAll: () => void;
  onFilter: (result: Record<string, unknown>) => void;
}

export default function FaTableFiltersModal({
  showOpts = [],
  hideOpts = [],
  sortOpts = [],
  filters = [],
  lang = defaultLang,
  value,
  onClose,
  onClearAll,
  onFilter,
}: FaTableFiltersModalProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Record<string, unknown>>(value);
  const pressedOnBackdrop = useRef(false);

  function close() {
    setOpen(false);
  }

  function onTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (!open) onClose();
  }

  function onBackdropPointerDown(e: PointerEvent<HTMLDivElement>) {
    pressedOnBackdrop.current = e.target === e.currentTarget;
  }

  /** Closes only when the click both starts and ends on the backdrop, so a drag from the content doesn't close it. */
  function onClickOutside(e: MouseEvent<HTMLDivElement>) {
    if (pressedOnBackdrop.current && e.target === e.currentTarget) close();
    pressedOnBackdrop.current = false;
  }

  function clearAll() {
    onClearAll();
  }

  function applyFilters() {
    onFilter(result);
    close();
  }

  function updateResult(attr: Record<string, unknown>) {
    setResult((result) => ({ ...result, ...attr }));
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return createPortal(
    <div
      className={`fa-table-modal${open ? " fa-table-modal--open" : ""}`}
      onPointerDown={onBackdropPointerDown}
      onClick={onClickOutside}
    >
      <div
        className={`fa-table-modal-content${open ? " fa-table-modal-content--open" : ""}`}
        onTransitionEnd={onTransitionEnd}
      >
        <div className="fa-table-content__header">
          <h5 className="fa-table-content__header-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#e3e3e3"
            >
              <path d="M460-140v-200h40v80h320v40H500v80h-40Zm-320-80v-40h200v40H140Zm160-160v-80H140v-40h160v-80h40v200h-40Zm160-80v-40h360v40H460Zm160-160v-200h40v80h160v40H660v80h-40Zm-480-80v-40h360v40H140Z" />
            </svg>

            {lang.title}
          </h5>

          <button className="fa-table-content__header-closebtn" onClick={close}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="fa-table-content__body">
          <div className="fa-table-content__body-wrapper">
            {!!showOpts.length && (
              <FaTableFiltersSection
                label={lang.showItems}
                options={showOpts}
                sectionType="select"
                column="showing"
                onChange={(val) => updateResult({ showing: val })}
                value={String(result.showing)}
              />
            )}
            {!!sortOpts.length && (
              <FaTableFiltersSection
                label={lang.sortBy}
                options={sortOpts}
                sectionType="select"
                column="sort"
                onChange={(sort) => updateResult({ sort })}
                value={result.sort as FaTableFilterSectionValueType}
              />
            )}
            {!!hideOpts.length && (
              <FaTableFiltersSection
                label={lang.hiddenColumns}
                options={hideOpts}
                sectionType="select-multiple"
                column="hidden"
                onChange={(hidden) => updateResult({ hidden })}
                value={result.hidden as FaTableFilterSectionValueType}
              />
            )}
            {filters.map((f) => (
              <FaTableFiltersSection
                key={f.title}
                label={f.title}
                options={f.options}
                value={
                  (result[f.column] ??
                    undefined) as FaTableFilterSectionValueType
                }
                column={f.column}
                sectionType={f.type}
                lang={lang}
                onChange={(val) => updateResult({ [f.column]: val })}
              />
            ))}
          </div>
        </div>
        <div className="fa-table-content__footer">
          <a
            href="#"
            className="fa-table-content__footer-clearbtn"
            onClick={clearAll}
          >
            {lang.clearAll}
          </a>
          <button
            className="fa-table-content__footer-applybtn"
            onClick={applyFilters}
          >
            {lang.applyFilters}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
