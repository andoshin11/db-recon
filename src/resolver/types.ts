interface RecordType {
  column_key?: string | null
  constraint_name?: string | null
  constraint_type?: string | null
  extra?: string | null
  is_identity?: boolean
}

export type Resolver = {
  getForeignKeysQuery: (tableName: string, schemaName: string) => string
  getMetaInfoQuery: (tableName: string, schemaName: string) => string
  getPrimaryKeysQuery: (tableName: string, schemaName: string) => string
  isUnique: <T extends RecordType>(record?: T) => boolean
  isPrimaryKey: <T extends RecordType>(record?: T) => boolean
  isForeignKey: <T extends RecordType>(record?: T) => boolean
  isSerialKey: <T extends RecordType>(record?: T) => boolean
  isAutoIncrement: <T extends RecordType>(record?: T) => boolean
  isDefaultGenerated: <T extends RecordType>(record?: T) => boolean
}
