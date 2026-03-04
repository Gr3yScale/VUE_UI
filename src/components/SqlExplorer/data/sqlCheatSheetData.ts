import type { SqlFlavor, CheatSheetCategory } from '../types'

/** Static SQL reference data keyed by flavor. */
export type SqlCheatSheetData = Record<SqlFlavor, CheatSheetCategory[]>

const SELECT_CATEGORY: CheatSheetCategory = {
  label: 'SELECT',
  entries: [
    { keyword: 'SELECT *',         description: 'Fetch all columns.',                       snippet: 'SELECT * FROM table_name;' },
    { keyword: 'SELECT cols',      description: 'Fetch specific columns.',                   snippet: 'SELECT col1, col2 FROM table_name;' },
    { keyword: 'DISTINCT',         description: 'Remove duplicate rows.',                    snippet: 'SELECT DISTINCT col FROM table_name;' },
    { keyword: 'LIMIT / OFFSET',   description: 'Paginate results.',                         snippet: 'SELECT * FROM table_name LIMIT 10 OFFSET 20;' },
    { keyword: 'ORDER BY',         description: 'Sort results.',                             snippet: 'SELECT * FROM table_name ORDER BY col ASC;' },
    { keyword: 'AS alias',         description: 'Rename a column or expression in output.',  snippet: 'SELECT col * 2 AS doubled FROM table_name;' },
  ],
}

const WHERE_CATEGORY: CheatSheetCategory = {
  label: 'WHERE / Filtering',
  entries: [
    { keyword: '=',          description: 'Exact match.',                           snippet: "WHERE status = 'active'" },
    { keyword: '!= / <>',    description: 'Not equal.',                             snippet: "WHERE role <> 'admin'" },
    { keyword: '> >= < <=',  description: 'Numeric / date comparisons.',            snippet: 'WHERE created_at >= \'2024-01-01\'' },
    { keyword: 'BETWEEN',    description: 'Inclusive range.',                       snippet: 'WHERE amount BETWEEN 10 AND 500' },
    { keyword: 'IN',         description: 'Matches any value in a list.',           snippet: "WHERE status IN ('pending', 'processing')" },
    { keyword: 'NOT IN',     description: 'Excludes values in a list.',             snippet: "WHERE role NOT IN ('admin', 'moderator')" },
    { keyword: 'LIKE',       description: 'Pattern match (% = wildcard).',          snippet: "WHERE email LIKE '%@example.com'" },
    { keyword: 'IS NULL',    description: 'Field has no value.',                    snippet: 'WHERE deleted_at IS NULL' },
    { keyword: 'AND / OR',   description: 'Combine conditions.',                   snippet: "WHERE role = 'admin' AND status = 'active'" },
  ],
}

const JOINS_CATEGORY: CheatSheetCategory = {
  label: 'JOINs',
  entries: [
    { keyword: 'INNER JOIN', description: 'Rows matching in both tables.',          snippet: 'SELECT * FROM a\nINNER JOIN b ON a.id = b.a_id;' },
    { keyword: 'LEFT JOIN',  description: 'All rows from left + matching right.',   snippet: 'SELECT * FROM a\nLEFT JOIN b ON a.id = b.a_id;' },
    { keyword: 'RIGHT JOIN', description: 'All rows from right + matching left.',   snippet: 'SELECT * FROM a\nRIGHT JOIN b ON a.id = b.a_id;' },
    { keyword: 'FULL JOIN',  description: 'All rows from both tables.',             snippet: 'SELECT * FROM a\nFULL OUTER JOIN b ON a.id = b.a_id;' },
    { keyword: 'CROSS JOIN', description: 'Cartesian product of both tables.',      snippet: 'SELECT * FROM a CROSS JOIN b;' },
  ],
}

const AGGREGATION_CATEGORY: CheatSheetCategory = {
  label: 'Aggregation',
  entries: [
    { keyword: 'COUNT(*)',   description: 'Number of rows.',                        snippet: 'SELECT COUNT(*) FROM table_name;' },
    { keyword: 'SUM',        description: 'Sum of a numeric column.',               snippet: 'SELECT SUM(amount) FROM orders;' },
    { keyword: 'AVG',        description: 'Average of a numeric column.',           snippet: 'SELECT AVG(price) FROM products;' },
    { keyword: 'MIN / MAX',  description: 'Minimum / maximum value.',               snippet: 'SELECT MIN(price), MAX(price) FROM products;' },
    { keyword: 'GROUP BY',   description: 'Group rows sharing a column value.',     snippet: 'SELECT status, COUNT(*) FROM orders\nGROUP BY status;' },
    { keyword: 'HAVING',     description: 'Filter groups (like WHERE for GROUP BY).', snippet: 'SELECT category, COUNT(*) AS n FROM products\nGROUP BY category\nHAVING COUNT(*) > 5;' },
  ],
}

const WINDOW_CATEGORY: CheatSheetCategory = {
  label: 'Window Functions',
  entries: [
    { keyword: 'ROW_NUMBER()',   description: 'Sequential row number within partition.',  snippet: 'SELECT ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn\nFROM employees;' },
    { keyword: 'RANK()',         description: 'Rank with gaps for ties.',                 snippet: 'SELECT RANK() OVER (ORDER BY score DESC) AS rnk FROM results;' },
    { keyword: 'DENSE_RANK()',   description: 'Rank without gaps.',                      snippet: 'SELECT DENSE_RANK() OVER (ORDER BY score DESC) AS dr FROM results;' },
    { keyword: 'LAG / LEAD',     description: 'Previous / next row value.',              snippet: "SELECT val, LAG(val) OVER (ORDER BY ts) AS prev_val\nFROM metrics;" },
    { keyword: 'SUM() OVER',     description: 'Running total.',                          snippet: 'SELECT date, SUM(amount) OVER (ORDER BY date) AS running_total\nFROM sales;' },
  ],
}

const CTE_CATEGORY: CheatSheetCategory = {
  label: 'CTEs',
  entries: [
    { keyword: 'WITH cte AS',  description: 'Named temporary result set.',           snippet: 'WITH active_users AS (\n  SELECT * FROM users WHERE status = \'active\'\n)\nSELECT * FROM active_users;' },
    { keyword: 'Recursive CTE', description: 'Self-referencing CTE for hierarchies.', snippet: "WITH RECURSIVE tree AS (\n  SELECT id, parent_id FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, c.parent_id FROM categories c\n  JOIN tree t ON c.parent_id = t.id\n)\nSELECT * FROM tree;" },
  ],
}

const STRING_FUNCTIONS_CATEGORY: CheatSheetCategory = {
  label: 'String Functions',
  entries: [
    { keyword: 'LOWER / UPPER',   description: 'Change case.',                       snippet: "SELECT LOWER(email) FROM users;" },
    { keyword: 'LENGTH',          description: 'String length.',                     snippet: 'SELECT LENGTH(name) FROM users;' },
    { keyword: 'SUBSTRING',       description: 'Extract substring.',                 snippet: 'SELECT SUBSTRING(name, 1, 3) FROM users;' },
    { keyword: 'TRIM',            description: 'Remove leading/trailing whitespace.', snippet: "SELECT TRIM(name) FROM users;" },
    { keyword: 'CONCAT / ||',     description: 'Concatenate strings.',               snippet: "SELECT first_name || ' ' || last_name AS full_name FROM users;" },
    { keyword: 'REPLACE',         description: 'Replace substring.',                 snippet: "SELECT REPLACE(email, '@old.com', '@new.com') FROM users;" },
  ],
}

const DATETIME_CATEGORY: CheatSheetCategory = {
  label: 'Date / Time',
  entries: [
    { keyword: 'NOW()',          description: 'Current timestamp.',                   snippet: 'SELECT NOW();' },
    { keyword: 'CURRENT_DATE',  description: 'Current date.',                        snippet: 'SELECT CURRENT_DATE;' },
    { keyword: 'DATE_TRUNC',    description: 'Truncate to a time unit (PG/Snowflake).', snippet: "SELECT DATE_TRUNC('month', created_at) FROM orders;" },
    { keyword: 'EXTRACT',       description: 'Get date part (year, month, day…).',   snippet: 'SELECT EXTRACT(YEAR FROM created_at) FROM orders;' },
    { keyword: 'INTERVAL',      description: 'Arithmetic on timestamps.',            snippet: "SELECT * FROM orders WHERE created_at > NOW() - INTERVAL '7 days';" },
    { keyword: 'CAST / ::',     description: 'Convert types.',                       snippet: "SELECT created_at::date FROM orders;" },
  ],
}

const JSON_CATEGORY: CheatSheetCategory = {
  label: 'JSON (PostgreSQL)',
  entries: [
    { keyword: '->',      description: 'Get JSON object field (returns JSON).',     snippet: "SELECT data -> 'key' FROM table_name;" },
    { keyword: '->>',     description: 'Get JSON object field as text.',            snippet: "SELECT data ->> 'key' FROM table_name;" },
    { keyword: '#>',      description: 'Get JSON at path (returns JSON).',          snippet: "SELECT data #> '{a,b}' FROM table_name;" },
    { keyword: '#>>',     description: 'Get JSON at path as text.',                 snippet: "SELECT data #>> '{a,b}' FROM table_name;" },
    { keyword: 'jsonb_array_elements', description: 'Expand a JSON array to rows.', snippet: "SELECT jsonb_array_elements(data -> 'items') FROM table_name;" },
    { keyword: 'jsonb_extract_path_text', description: 'Extract nested text.',      snippet: "SELECT jsonb_extract_path_text(data, 'user', 'name') FROM table_name;" },
  ],
}

const UTILITY_CATEGORY: CheatSheetCategory = {
  label: 'Utility',
  entries: [
    { keyword: 'COALESCE',   description: 'Return first non-null value.',            snippet: 'SELECT COALESCE(middle_name, \'\') FROM users;' },
    { keyword: 'NULLIF',     description: 'Return NULL if two values are equal.',    snippet: "SELECT NULLIF(status, 'unknown') FROM orders;" },
    { keyword: 'CASE WHEN',  description: 'Conditional expression.',                 snippet: "SELECT\n  CASE\n    WHEN score >= 90 THEN 'A'\n    WHEN score >= 70 THEN 'B'\n    ELSE 'C'\n  END AS grade\nFROM results;" },
    { keyword: 'CAST',       description: 'Explicit type conversion.',               snippet: "SELECT CAST(price AS INTEGER) FROM products;" },
    { keyword: 'EXPLAIN',    description: 'Show query execution plan.',              snippet: 'EXPLAIN SELECT * FROM users WHERE role = \'admin\';' },
  ],
}

const MYSQL_STRING_CATEGORY: CheatSheetCategory = {
  label: 'String Functions',
  entries: [
    { keyword: 'LOWER / UPPER',  description: 'Change case.',                       snippet: 'SELECT LOWER(email) FROM users;' },
    { keyword: 'LENGTH',         description: 'String length.',                     snippet: 'SELECT LENGTH(name) FROM users;' },
    { keyword: 'SUBSTRING',      description: 'Extract substring.',                 snippet: 'SELECT SUBSTRING(name, 1, 3) FROM users;' },
    { keyword: 'CONCAT',         description: 'Concatenate strings.',               snippet: "SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;" },
    { keyword: 'REPLACE',        description: 'Replace substring.',                 snippet: "SELECT REPLACE(email, '@old.com', '@new.com') FROM users;" },
    { keyword: 'GROUP_CONCAT',   description: 'Aggregate strings into one value.',  snippet: "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM products;" },
  ],
}

const MYSQL_DATETIME_CATEGORY: CheatSheetCategory = {
  label: 'Date / Time',
  entries: [
    { keyword: 'NOW()',        description: 'Current timestamp.',                   snippet: 'SELECT NOW();' },
    { keyword: 'CURDATE()',    description: 'Current date.',                        snippet: 'SELECT CURDATE();' },
    { keyword: 'DATE_FORMAT',  description: 'Format a date.',                      snippet: "SELECT DATE_FORMAT(created_at, '%Y-%m-%d') FROM orders;" },
    { keyword: 'DATEDIFF',     description: 'Number of days between dates.',       snippet: 'SELECT DATEDIFF(NOW(), created_at) AS age_days FROM users;' },
    { keyword: 'DATE_ADD',     description: 'Add an interval to a date.',          snippet: "SELECT DATE_ADD(created_at, INTERVAL 7 DAY) FROM orders;" },
  ],
}

const MYSQL_JSON_CATEGORY: CheatSheetCategory = {
  label: 'JSON (MySQL)',
  entries: [
    { keyword: 'JSON_EXTRACT', description: 'Extract a value from JSON.',           snippet: "SELECT JSON_EXTRACT(data, '$.key') FROM table_name;" },
    { keyword: 'JSON_UNQUOTE', description: 'Remove surrounding quotes.',           snippet: "SELECT JSON_UNQUOTE(JSON_EXTRACT(data, '$.key')) FROM table_name;" },
    { keyword: '->',           description: 'Shorthand for JSON_EXTRACT.',          snippet: "SELECT data -> '$.key' FROM table_name;" },
    { keyword: '->>',          description: 'Shorthand for unquoted extraction.',   snippet: "SELECT data ->> '$.key' FROM table_name;" },
    { keyword: 'JSON_ARRAYAGG', description: 'Aggregate values into JSON array.',  snippet: "SELECT JSON_ARRAYAGG(name) FROM products;" },
  ],
}

const SQLITE_DATETIME_CATEGORY: CheatSheetCategory = {
  label: 'Date / Time',
  entries: [
    { keyword: "datetime('now')",    description: 'Current UTC timestamp.',         snippet: "SELECT datetime('now');" },
    { keyword: "date('now')",        description: 'Current UTC date.',              snippet: "SELECT date('now');" },
    { keyword: 'strftime',           description: 'Format a date.',                 snippet: "SELECT strftime('%Y-%m-%d', created_at) FROM orders;" },
    { keyword: 'julianday',          description: 'Convert to Julian day number.',  snippet: 'SELECT julianday(created_at) FROM orders;' },
  ],
}

const SQLITE_STRING_CATEGORY: CheatSheetCategory = {
  label: 'String Functions',
  entries: [
    { keyword: 'LOWER / UPPER',  description: 'Change case.',                       snippet: 'SELECT LOWER(email) FROM users;' },
    { keyword: 'LENGTH',         description: 'String length.',                     snippet: 'SELECT LENGTH(name) FROM users;' },
    { keyword: 'SUBSTR',         description: 'Extract substring.',                 snippet: 'SELECT SUBSTR(name, 1, 3) FROM users;' },
    { keyword: "|| (concat)",    description: 'String concatenation.',              snippet: "SELECT first_name || ' ' || last_name FROM users;" },
    { keyword: 'REPLACE',        description: 'Replace substring.',                 snippet: "SELECT REPLACE(email, '@old.com', '@new.com') FROM users;" },
    { keyword: 'TRIM',           description: 'Strip whitespace.',                  snippet: 'SELECT TRIM(name) FROM users;' },
  ],
}

const STANDARD_JSON_CATEGORY: CheatSheetCategory = {
  label: 'JSON (SQL:2016)',
  entries: [
    { keyword: 'JSON_VALUE',    description: 'Extract a scalar JSON value.',        snippet: "SELECT JSON_VALUE(data, '$.key') FROM table_name;" },
    { keyword: 'JSON_QUERY',    description: 'Extract a JSON object or array.',     snippet: "SELECT JSON_QUERY(data, '$.items') FROM table_name;" },
    { keyword: 'JSON_EXISTS',   description: 'Check if a JSON path exists.',        snippet: "SELECT JSON_EXISTS(data, '$.key') FROM table_name;" },
    { keyword: 'JSON_TABLE',    description: 'Turn JSON into a relational table.',  snippet: "SELECT jt.*\nFROM table_name,\nJSON_TABLE(data, '$.items[*]' COLUMNS (\n  id INT PATH '$.id'\n)) AS jt;" },
  ],
}

/** Static SQL reference cheat sheet data, keyed by flavor. */
export const SQL_CHEAT_SHEET: SqlCheatSheetData = {
  PostgreSQL: [
    SELECT_CATEGORY,
    WHERE_CATEGORY,
    JOINS_CATEGORY,
    AGGREGATION_CATEGORY,
    WINDOW_CATEGORY,
    CTE_CATEGORY,
    STRING_FUNCTIONS_CATEGORY,
    DATETIME_CATEGORY,
    JSON_CATEGORY,
    UTILITY_CATEGORY,
  ],
  MySQL: [
    SELECT_CATEGORY,
    WHERE_CATEGORY,
    JOINS_CATEGORY,
    AGGREGATION_CATEGORY,
    WINDOW_CATEGORY,
    CTE_CATEGORY,
    MYSQL_STRING_CATEGORY,
    MYSQL_DATETIME_CATEGORY,
    MYSQL_JSON_CATEGORY,
    UTILITY_CATEGORY,
  ],
  SQLite: [
    SELECT_CATEGORY,
    WHERE_CATEGORY,
    JOINS_CATEGORY,
    AGGREGATION_CATEGORY,
    CTE_CATEGORY,
    SQLITE_STRING_CATEGORY,
    SQLITE_DATETIME_CATEGORY,
    UTILITY_CATEGORY,
  ],
  'Standard SQL': [
    SELECT_CATEGORY,
    WHERE_CATEGORY,
    JOINS_CATEGORY,
    AGGREGATION_CATEGORY,
    WINDOW_CATEGORY,
    CTE_CATEGORY,
    STRING_FUNCTIONS_CATEGORY,
    DATETIME_CATEGORY,
    STANDARD_JSON_CATEGORY,
    UTILITY_CATEGORY,
  ],
}
