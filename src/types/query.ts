export type GetForeignKeysResult = {
  constraint_name: string
  source_schema: string | null
  source_table: string | null
  source_column: string | null
  target_schema: string | null
  target_table: string | null
  target_column: string | null
  extra: string | null
  column_key: '' | 'PRI' | 'UNI' | 'MUL'
}

export type GetPrimaryKeysResult = {
  column_name: string
}

export type GetMetaInfoResult = {
  source_table: string | null
  source_column: string | null
  extra: string | null
  is_identity?: boolean
}

export type DescribeTableResult = {
  type: string
  allowNull: boolean
  defaultValue: any
  primaryKey: boolean
  autoIncrement: boolean
  comment: string | null
}
