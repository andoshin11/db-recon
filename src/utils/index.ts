import * as types from '../types'
export * from './info'

export const mapTypeInfo = (info: types.ColumnInfo) => {
  // TODO: Handle Enum
  // https://github.com/sequelize/sequelize-auto/blob/master/lib/index.js#L190

  // TODO: Handle Reference
  // https://github.com/sequelize/sequelize-auto/blob/master/lib/index.js#L213

  const type = info.type.toLowerCase()

  if (type === "boolean" || type === "bit(1)" || type === "bit") {
    return 'boolean'
  } else if (type.match(/^(smallint|mediumint|tinyint|int)/)) {
    return 'number'
  } else if (type.match(/^bigint/)) {
    return 'bigint'
  } else if (type.match(/^varchar|string|varying|nvarchar|char/)) {
    return 'string'
  } else if (type.match(/^real/)) {
    return 'number'
  } else if (type.match(/text|ntext$/)) {
    return 'string'
  } else if (type.match(/^(date|timestamp)/)) {
    return 'Date'
  } else if (type.match(/^(float|float4)/)) {
    return 'number'
  } else if (type.match(/^decimal/)) {
    return 'number'
  } else if (type.match(/^(float8|double precision|numeric)/)) {
    return 'number'
  } else if (type.match(/^uuid|uniqueidentifier/)) {
    return 'string'
  } else {
    return 'any'
  }
}

export const getForeignKey = (foreignKeysInfo: types.DBInfo<types.ForeignKeyInfo>) => (tableName: string, columnName: string) => {
  const table = foreignKeysInfo[tableName]
  if (!table) return null
  const foreignKeyInfo = table[columnName]
  return foreignKeyInfo || null
}
