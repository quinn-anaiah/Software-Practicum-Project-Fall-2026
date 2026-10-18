function Pagination({ currentPage, itemLabel = "entries", onPageChange, pageSize, totalItems }) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const firstItem = totalItems ? (safePage - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(safePage * pageSize, totalItems);

  if (totalItems <= pageSize) {
    return (
      <p className="pagination-summary">
        {totalItems} {itemLabel}
      </p>
    );
  }

  return (
    <nav aria-label={`${itemLabel} pagination`} className="pagination-controls">
      <p className="pagination-summary">
        {firstItem}–{lastItem} of {totalItems} {itemLabel}
      </p>
      <div>
        <button disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)} type="button">Previous</button>
        <span>Page {safePage} of {pageCount}</span>
        <button disabled={safePage === pageCount} onClick={() => onPageChange(safePage + 1)} type="button">Next</button>
      </div>
    </nav>
  );
}

export default Pagination;
