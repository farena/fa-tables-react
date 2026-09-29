import type { FaTablePagination } from "../types/FaTableTypes";

const defaultLang = {
  showingEntries:
    "Showing from <b>{from}</b> to <b>{to}</b> of <b>{total}</b> entries",
  first: "First",
  last: "Last",
  next: "Next",
  previous: "Prev",
};

type FaTablePagerLang = typeof defaultLang;

interface FaTablePagerProps extends Pick<
  FaTablePagination,
  "current_page" | "last_page" | "total" | "from" | "to"
> {
  lang?: FaTablePagerLang;
  onChangePage?: (page: number) => void;
}

export default function FaTablePager({
  current_page,
  last_page,
  total,
  from,
  to,
  lang = defaultLang,
  onChangePage,
}: FaTablePagerProps) {
  function doPagesList() {
    const plist: Array<number> = [];

    // Add the pages before the current one
    if (current_page > 3) {
      for (let i = current_page; i >= current_page - 2; i -= 1) {
        plist.unshift(i);
      }
    } else {
      for (let i = 1; i <= current_page; i += 1) {
        plist.push(i);
      }
    }

    // Add the pages after the current one
    let rest = last_page - current_page;

    if (rest > 0) {
      // Cap to the maximum number of pages shown ahead
      rest = rest > 2 ? 2 : rest;

      for (let i = current_page + 1; i <= current_page + rest; i += 1) {
        plist.push(i);
      }
    }

    return plist;
  }

  // Derived from props on every render, no need to keep it in state
  const pages_list = doPagesList();

  function changePage(page: number) {
    if (page > 0 && page <= last_page && page !== current_page) {
      onChangePage?.(page);
    }
  }

  function formatShowingEntries() {
    if (!from) return "";

    return lang.showingEntries
      .replace("{from}", String(from))
      .replace("{to}", String(to))
      .replace("{total}", String(total));
  }

  return (
    <div className="v-table-pager">
      <div
        className="vt-results"
        dangerouslySetInnerHTML={{ __html: formatShowingEntries() }}
      />
      <ul>
        <li
          className={["vt-desktop", current_page - 1 === 0 ? "disabled" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            changePage(1);
          }}
        >
          {lang.first}
        </li>
        {pages_list.map((page) => (
          <li
            key={page}
            className={[
              "vt-desktop",
              "vt-number",
              current_page === page ? "active disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={(e) => {
              e.stopPropagation();
              changePage(page);
            }}
          >
            {page}
          </li>
        ))}
        <li
          className={[
            "vt-desktop",
            !last_page || current_page + 1 > last_page ? "disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            changePage(last_page);
          }}
        >
          {lang.last}
        </li>

        <li
          className={["vt-mobile", current_page - 1 === 0 ? "disabled" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            changePage(current_page - 1);
          }}
        >
          {lang.previous}
        </li>
        <li
          className={[
            "vt-mobile",
            current_page + 1 > last_page ? "disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            changePage(current_page + 1);
          }}
        >
          {lang.next}
        </li>
      </ul>
    </div>
  );
}
