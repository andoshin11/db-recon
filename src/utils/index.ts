import { ColumnInfo, DBInfo, ForeignKeyInfo, TypeInfo, FieldType } from '../types'
export * from './info'

export const mapTypeInfo = (info: ColumnInfo): TypeInfo => {
  // TODO: Handle Enum
  // https://github.com/sequelize/sequelize-auto/blob/master/lib/index.js#L190

  // TODO: Handle Reference
  // https://github.com/sequelize/sequelize-auto/blob/master/lib/index.js#L213

  const attr = info.type.toLowerCase()
  const isNullable = info.allowNull
  let type: FieldType

  if (attr === "boolean" || attr === "bit(1)" || attr === "bit") {
    type = 'boolean'
  } else if (attr.match(/^(smallint|mediumint|tinyint|int)/)) {
    type = 'number'
  } else if (attr.match(/^bigint/)) {
    type = 'bigint'
  } else if (attr.match(/^varchar|string|varying|nvarchar|char/)) {
    type = 'string'
  } else if (attr.match(/^real/)) {
    type = 'number'
  } else if (attr.match(/text|ntext$/)) {
    type = 'string'
  } else if (attr.match(/^(date|timestamp)/)) {
    type = 'Date'
  } else if (attr.match(/^(float|float4)/)) {
    type = 'number'
  } else if (attr.match(/^decimal/)) {
    type = 'number'
  } else if (attr.match(/^(float8|double precision|numeric)/)) {
    type = 'number'
  } else if (attr.match(/^uuid|uniqueidentifier/)) {
    type = 'string'
  } else {
    type = 'any'
  }

  return {
    type,
    isNullable
  }
}

export const getForeignKey = (foreignKeysInfo: DBInfo<ForeignKeyInfo>) => (tableName: string, columnName: string) => {
  const table = foreignKeysInfo[tableName]
  if (!table) return null
  const foreignKeyInfo = table[columnName]
  return foreignKeyInfo || null
}
