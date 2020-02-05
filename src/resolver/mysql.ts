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

  getMetaInfoQuery(tableName: string): string {
    return `
      SELECT \
        C.TABLE_NAME as source_table \
      , C.COLUMN_NAME as source_column \
      , C.extra as extra \
      FROM INFORMATION_SCHEMA.COLUMNS AS C \
      WHERE \
        C.TABLE_NAME = '${tableName}';`
  },

  getPrimaryKeysQuery(tableName: string, schemaName: string) {
    return `
      SELECT k.column_name \
        FROM information_schema.table_constraints t \
        JOIN information_schema.key_column_usage k \
        USING(constraint_name,table_schema,table_name) \
        WHERE t.constraint_type='PRIMARY KEY' \
          AND t.table_schema='${schemaName}'
          AND t.table_name='${tableName}';
    `
  },

  isUnique(record) {
    return !!record && !!record.column_key && record.column_key.toUpperCase() === 'UNI'
  },

  isPrimaryKey(record) {
    return !!record && !!record.constraint_name && record.constraint_name === 'PRIMARY'
  },

  isForeignKey(record) {
    return false
  },

  isSerialKey(record) {
    return !!record && !!record.extra && record.extra === 'auto_increment'
  },

  isAutoIncrement(record) {
    return !!record && !!record.extra && record.extra === 'auto_increment'
  },

  isDefaultGenerated(record) {
    return !!record && !!record.extra && /DEFAULT_GENERATED/.test(record.extra)
  }
}
