export * from './query'

export type DialectType = 'mysql' | 'mssql'
export type FieldType = 'boolean' | 'number' | 'bigint' | 'string' | 'Date' | 'any'

export type TypeInfo = {
  type: FieldType
  isNullable: boolean
}

export type ForeignKeyInfo = {
  isPrimaryKey: boolean
  isForeignKey: boolean
  isUnique: boolean
  isSerialKey: boolean
  foreignSources: {
    source_table: string | null
    source_schema: string | null
    target_schema: string | null
    target_table: string | null
    source_column: string | null
    target_column: string | null
  } | null
}

export type MetaInfo = {
  extra: {
    defaultGenerated: boolean;
    autoIncrement: boolean;
    identity: boolean;
  }
}

export type ColumnInfo = {
  type: string
  allowNull: boolean
  defaultValue: any
  primaryKey: boolean
  autoIncrement: boolean
  comment: string | null
}

export type TableInfo<T> = Record<string, T>

export type DBInfo<T> = Record<string, TableInfo<T>>

export interface GenFileRequest {
  filepath: string
  content: string
}
