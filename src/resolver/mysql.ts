import { Resolver } from './types'

export const resolver: Resolver = {
  getForeignKeysQuery(tableName: string, schemaName: string): string {
    return `
      SELECT \
        K.CONSTRAINT_NAME as constraint_name \
      , K.CONSTRAINT_SCHEMA as source_schema \
      , K.TABLE_SCHEMA as source_table \
      , K.COLUMN_NAME as source_column \
      , K.REFERENCED_TABLE_SCHEMA AS target_schema \
      , K.REFERENCED_TABLE_NAME AS target_table \
      , K.REFERENCED_COLUMN_NAME AS target_column \
      , C.extra \
      , C.COLUMN_KEY AS column_key \
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS K \
      LEFT JOIN INFORMATION_SCHEMA.COLUMNS AS C \
        ON C.TABLE_NAME = K.TABLE_NAME AND C.COLUMN_NAME = K.COLUMN_NAME \
      WHERE \
        K.TABLE_NAME = '${tableName}' \
        AND K.CONSTRAINT_SCHEMA = '${schemaName}';`
  },

  isUnique(record) {
    return !!record && !!record.column_key && record.column_key.toUpperCase() === 'UNI'
  },

  isPrimaryKey(record) {
    return !!record && !!record.constraint_name && record.constraint_name === 'PRIMARY'
  },

  isSerialKey(record) {
    return !!record && !!record.extra && record.extra === 'auto_increment'
  },
}
