/**
 * Build the POST body for backend `/list` endpoints that paginate with
 * `page` / `page_size` and sort with `order_by` / `order_type`.
 */
export function buildMasterListQuery({
  page = 1,
  pageSize = 10,
  sortBy,
  sortOrder = "asc",
  sortFieldMap = {},
  filters = {},
}) {
  const query = { ...filters, page, page_size: pageSize };
  const orderBy = sortFieldMap[sortBy];
  if (orderBy) {
    query.order_by = orderBy;
    query.order_type = sortOrder === "desc" ? "desc" : "asc";
  }
  return query;
}
