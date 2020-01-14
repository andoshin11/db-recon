import { Resolver } from '../resolver'
import { Interactor } from '../interactor'
import { DBInfo, TableInfo, ForeignKeyInfo, ColumnInfo, GetForeignKeysResult } from '../types'

export async function processForeignKeyInfo(tableNames: string[], interactor: Interactor, resolver: Resolver): Promise<DBInfo<ForeignKeyInfo>> {
  const info: DBInfo<ForeignKeyInfo> = {}

  await Promise.all(tableNames.map(async (tableName) => {
    const foreignKeys = await interactor.getForeignKeys(tableName)
    const foreignKeysInfo = foreignKeys.reduce((acc, ac) => {
      if (!ac.source_column) return acc
      acc[ac.source_column] = formatForeignKeyInfo(resolver)(ac)
      return acc
    }, {} as TableInfo<ForeignKeyInfo>)
    info[tableName] = foreignKeysInfo
  }))

  return info
}

export async function processColumnInfo(tableNames: string[], interactor: Interactor): Promise<DBInfo<ColumnInfo>> {
  const info: DBInfo<ColumnInfo> = {}

  await Promise.all(tableNames.map(async (tableName) => {
    const columnInfo = await interactor.describeTable(tableName)
    info[tableName] = columnInfo
  }))

  return info
}

const formatForeignKeyInfo = (resolver: Resolver) => (data: GetForeignKeysResult): ForeignKeyInfo => {
  const info =createEmptyForeignKeyInfo()

  // check foreign relation
  if (!!data.source_column && !!data.target_column) {
    info.isForeignKey = true
    info.foreignSources = {
      source_table: data.source_table,
      source_schema: data.source_schema,
      target_schema: data.target_schema,
      target_table: data.target_table,
      source_column: data.source_column,
      target_column: data.target_column
    }
  }

  if (resolver.isUnique(data)) {
    info.isUnique = true
  }

  if (resolver.isPrimaryKey(data)) {
    info.isPrimaryKey = true
  }

  if (resolver.isSerialKey(data)) {
    info.isSerialKey = true
  }

  return info
}

function createEmptyForeignKeyInfo(): ForeignKeyInfo {
  return {
    isPrimaryKey: false,
    isUnique: false,
    isSerialKey: false,
    isForeignKey: false,
    foreignSources: null
  }
}
