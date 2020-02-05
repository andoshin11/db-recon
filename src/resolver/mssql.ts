import { Utils } from 'sequelize'
import { Resolver } from './types'

export const resolver: Resolver = {
  getForeignKeysQuery(tableName: string, schemaName: string): string {
    return "SELECT \
      ccu.table_name AS source_table, \
      ccu.constraint_name AS constraint_name, \
      ccu.column_name AS source_column, \
      kcu.table_name AS target_table, \
      kcu.column_name AS target_column, \
      tc.constraint_type AS constraint_type, \
      c.is_identity AS is_identity \
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc \
    INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu \
      ON ccu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME \
    LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc \
      ON ccu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME \
    LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu \
      ON kcu.CONSTRAINT_NAME = rc.UNIQUE_CONSTRAINT_NAME AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY' \
    INNER JOIN sys.COLUMNS c \
      ON c.name = ccu.column_name \
      AND c.object_id = OBJECT_ID(ccu.table_name) \
    WHERE ccu.table_name = " + Utils.addTicks(tableName, "'");
  },

  getMetaInfoQuery() {
    throw new Error('not implemented!')
  },

  getPrimaryKeysQuery() {
    throw new Error('not implemented!')
  },

  isUnique(record) {
    return false
  },

  isPrimaryKey(record) {
    return !!record && !!record.constraint_type && record.constraint_type === 'PRIMARY KEY'
  },

  isForeignKey(record) {
    return !!record && !!record.constraint_type && record.constraint_type === 'FOREIGN KEY'
  },

  isSerialKey(record) {
    return !!record && resolver.isPrimaryKey(record) && !!record.is_identity
  },

  isAutoIncrement() {
    throw new Error('not implemented!')
  },

  isDefaultGenerated() {
    throw new Error('not implemented!')
  }
}
