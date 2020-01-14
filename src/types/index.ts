export * from './query'
export * from './util'

export type DialectType = 'mysql'

export type ColumnInfo = {
  type: string
  isNullable: boolean
  isPrimaryKey: boolean
  isAutoIncrement: boolean
  isForeignKey: boolean
  comment: string | null
  foreignSources: {
    source_table: string | null
    source_schema: string | null
    target_schema: string | null
    target_table: string | null
    source_column: string | null
    target_column: string | null
  }
}

export type TableInfo = Record<string, ColumnInfo>

export type DBInfo = Record<string, TableInfo>
