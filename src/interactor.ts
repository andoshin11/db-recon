import { Sequelize, QueryTypes } from 'sequelize'
import * as Types from './types'
import { resolvers } from './resolver'

export class Interactor {
  constructor(private sequelize: Sequelize) {}

  get queryInterface() {
    return this.sequelize.getQueryInterface()
  }

  get dialect(): Types.DialectType {
    return this.sequelize.getDialect() as any
  }

  get database() {
    return this.sequelize.config.database
  }

  get resolver() {
    return resolvers[this.dialect]
  }

  showAllTables(): Promise<string[] | { tableName: string; schema: string }[]> {
    return this.queryInterface.showAllTables()
  }

  async getForeignKeys(tableName: string): Promise<Types.GetForeignKeysResult[]> {
    const { dialect } = this
    const sql = this.resolver.getForeignKeysQuery(tableName, this.database)
    const result = await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
      raw: true
    })

    switch (dialect) {
      case 'mysql':
        return result as any
      default:
        return result as any
    }
  }

  async describeTable(tableName: string, schema?: string): Promise<{ [column: string]: Types.DescribeTableResult }> {
    const result = await this.queryInterface.describeTable(tableName, { schema })
    return result as any
  }
}
