import { Resolver } from '../resolver'
import { Interactor } from '../interactor'
import { DBInfo, TableInfo, ForeignKeyInfo, MetaInfo, ColumnInfo, GetForeignKeysResult, GetMetaInfoResult } from '../types'

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

export async function processMetaInfo(tableNames: string[], interactor: Interactor, resolver: Resolver) {
  const info: DBInfo<MetaInfo> = {}

  await Promise.all(tableNames.map(async (tableName) => {
    const meta = await interactor.getMetaInfo(tableName)
    const metaInfo = meta.reduce((acc, ac) => {
      if (!ac.source_column) return acc
      acc[ac.source_column] = formatMetaInfo(resolver)(ac)
      return acc
    }, {} as TableInfo<MetaInfo>)
    info[tableName] = metaInfo
  }))

  return info
}

export async function processPrimaryKeyInfo(tableNames: string[], interactor: Interactor): Promise<Record<string, string[]>> {
  const info: Record<string, string[]> = {}

  await Promise.all(tableNames.map(async (tableName) => {
    const primaryKeys = await interactor.getPrimaryKeys(tableName)
    info[tableName] = primaryKeys
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

const formatMetaInfo = (resolver: Resolver) => (data: GetMetaInfoResult): MetaInfo => {
  const info = createEmptyMetaInfo()

  if (resolver.isAutoIncrement(data)) {
    info.extra.autoIncrement = true
  }

  if (resolver.isDefaultGenerated(data)) {
    info.extra.defaultGenerated = true
  }

  if (resolver.isIdentity(data)) {
    info.extra.identity = true
  }

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

function createEmptyMetaInfo(): MetaInfo {
  return {
    extra: {
      autoIncrement: false,
      defaultGenerated: false,
      identity: false
    }
  }
}
