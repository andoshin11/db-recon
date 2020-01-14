import { Sequelize } from 'sequelize'
import { resolvers } from './resolver'
import { Interactor } from './interactor'
import { processColumnInfo, mapTypeInfo } from './utils'
import { DBInfo, TableInfo } from './types'

async function main() {
  let sequelize: Sequelize | undefined
  try {
    const dialectName = 'mysql' // FIXME
    const resolver = resolvers[dialectName]

    sequelize = new Sequelize('sora_db', 'shin', '@Yumiko0316', {
      host: 'localhost',
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log,
      define: {
        timestamps: false,
        freezeTableName: true
      }
    })
    const interactor = new Interactor(sequelize)

    const tableNames = await interactor.showAllTables()

    // TODO: Handle FoeignKey info
    // const foreignKeysInfo = await processForeignKeyInfo(tableNames, interactor, resolver)

    const columnInfo = await processColumnInfo(tableNames, interactor)

    const typeInfo: DBInfo<string> = Object.entries(columnInfo).reduce((acc, ac) => {
      const [tableName, tableInfo] = ac
      const _typeInfo: TableInfo<string> = Object.entries(tableInfo).reduce((_acc, _ac) => {
        const [columnName, columnInfo] = _ac
        _acc[columnName] = mapTypeInfo(columnInfo)
        return _acc
      }, {} as TableInfo<string>)
      acc[tableName] = _typeInfo

      return acc
    }, {} as DBInfo<string>)
    console.log(typeInfo)

  } catch (e) {
    console.log(e)
  } finally {
    if (sequelize) await sequelize.close()
  }
}

main()
