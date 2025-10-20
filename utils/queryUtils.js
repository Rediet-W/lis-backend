const buildInsertQuery = (table, data) => {
  const columns = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map(() => "?")
    .join(", ");
  const values = Object.values(data);

  return {
    query: `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
    values,
  };
};

const buildUpdateQuery = (table, data, where) => {
  const setClause = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(data), ...Object.values(where)];

  return {
    query: `UPDATE ${table} SET ${setClause} WHERE id = ?`,
    values,
  };
};

const buildWhereClause = (filters) => {
  if (!filters || Object.keys(filters).length === 0) {
    return { clause: "", values: [] };
  }

  const conditions = [];
  const values = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`);
      values.push(value);
    }
  });

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
};

const paginateQuery = (baseQuery, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
};

module.exports = {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
  paginateQuery,
};
