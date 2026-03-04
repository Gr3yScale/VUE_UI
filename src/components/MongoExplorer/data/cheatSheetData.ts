import type { CheatSheetCategory } from '../types'

/** Static MongoDB query operator reference data. */
export const CHEAT_SHEET: CheatSheetCategory[] = [
  {
    label: 'Comparison',
    entries: [
      { operator: '$eq',  description: 'Matches values equal to a specified value.',       snippet: '{ "field": { "$eq": value } }' },
      { operator: '$ne',  description: 'Matches values not equal to a specified value.',   snippet: '{ "field": { "$ne": value } }' },
      { operator: '$gt',  description: 'Greater than.',                                    snippet: '{ "field": { "$gt": value } }' },
      { operator: '$gte', description: 'Greater than or equal.',                           snippet: '{ "field": { "$gte": value } }' },
      { operator: '$lt',  description: 'Less than.',                                       snippet: '{ "field": { "$lt": value } }' },
      { operator: '$lte', description: 'Less than or equal.',                              snippet: '{ "field": { "$lte": value } }' },
      { operator: '$in',  description: 'Matches any value in the array.',                  snippet: '{ "field": { "$in": [v1, v2] } }' },
      { operator: '$nin', description: 'Matches none of the values in the array.',         snippet: '{ "field": { "$nin": [v1, v2] } }' },
    ],
  },
  {
    label: 'Logical',
    entries: [
      { operator: '$and', description: 'Joins query clauses with logical AND.',            snippet: '{ "$and": [{ expr1 }, { expr2 }] }' },
      { operator: '$or',  description: 'Joins query clauses with logical OR.',             snippet: '{ "$or": [{ expr1 }, { expr2 }] }' },
      { operator: '$not', description: 'Inverts the query expression.',                    snippet: '{ "field": { "$not": { "$gt": 5 } } }' },
      { operator: '$nor', description: 'Joins with logical NOR.',                          snippet: '{ "$nor": [{ expr1 }, { expr2 }] }' },
    ],
  },
  {
    label: 'Array',
    entries: [
      { operator: '$all',       description: 'Array contains all specified elements.',     snippet: '{ "field": { "$all": [v1, v2] } }' },
      { operator: '$elemMatch', description: 'Array element matches all criteria.',        snippet: '{ "field": { "$elemMatch": { expr } } }' },
      { operator: '$size',      description: 'Array has the specified number of elements.', snippet: '{ "field": { "$size": 3 } }' },
    ],
  },
  {
    label: 'Element',
    entries: [
      { operator: '$exists', description: 'Field exists (or does not exist).',             snippet: '{ "field": { "$exists": true } }' },
      { operator: '$type',   description: 'Field is of the specified BSON type.',          snippet: '{ "field": { "$type": "string" } }' },
    ],
  },
  {
    label: 'Evaluation',
    entries: [
      { operator: '$regex', description: 'Matches strings using a regex pattern.',         snippet: '{ "field": { "$regex": "pattern", "$options": "i" } }' },
      { operator: '$expr',  description: 'Allows aggregation expressions in queries.',     snippet: '{ "$expr": { "$gt": ["$field", 10] } }' },
      { operator: '$where', description: 'Evaluates a JavaScript expression (avoid in prod).', snippet: '{ "$where": "this.x > 5" }' },
    ],
  },
  {
    label: 'Sort Values',
    entries: [
      { operator: '1',  description: 'Ascending order.',  snippet: '{ "field": 1 }' },
      { operator: '-1', description: 'Descending order.', snippet: '{ "field": -1 }' },
    ],
  },
  {
    label: 'Projection',
    entries: [
      { operator: '1', description: 'Include field.',    snippet: '{ "field": 1 }' },
      { operator: '0', description: 'Exclude field.',    snippet: '{ "field": 0 }' },
      { operator: '$slice', description: 'Limits array elements returned.', snippet: '{ "field": { "$slice": 5 } }' },
    ],
  },
]
