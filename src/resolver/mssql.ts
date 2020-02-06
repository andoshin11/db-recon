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

  getMetaInfoQuery(tableName: string, schemaName: string) {
    const query = "SELECT \
      c.TABLE_NAME AS source_table, \
      c.COLUMN_NAME AS source_column, \
      c.COLUMN_DEFAULT AS extra, \
      s.is_identity AS is_identity \
    FROM INFORMATION_SCHEMA.COLUMNS c \
    INNER JOIN sys.columns s \
      ON s.name = c.column_name \
      AND s.object_id = OBJECT_ID(c.table_name) \
    WHERE c.TABLE_CATALOG = '" + schemaName + "' AND c.TABLE_NAME = '" + tableName + "';"

    return query
  },

  getPrimaryKeysQuery(tableName: string) {
    return "SELECT \
      c.name AS column_name \
    FROM sys.indexes i \
    INNER JOIN sys.index_columns ic \
      on i.object_id = ic.object_id \
    INNER JOIN sys.columns c \
      on c.column_id = ic.column_id \
      AND c.object_id = ic.object_id \
    INNER JOIN sys.objects o \
      on i.object_id = o.object_id \
    WHERE o.type = 'U' AND o.name = '" + tableName + "' ;"
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

  isAutoIncrement(record) {
    return !!record && !!record.extra && /newid/.test(record.extra)
  },

  isDefaultGenerated(record) {
    return !!record && !!record.extra && /sysdatetime/.test(record.extra)
  },

  isIdentity(record) {
    return !!record && !!record.is_identity
  }
}
