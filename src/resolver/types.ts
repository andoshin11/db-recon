export type Resolver = {
  getForeignKeysQuery: (tableName: string, schemaName: string) => string
  isUnique: <T extends { column_key: string | null }>(record?: T) => boolean
  isPrimaryKey: <T extends { constraint_name: string | null }>(record?: T) => boolean
  isSerialKey: <T extends { extra: string | null }>(record?: T) => boolean
}