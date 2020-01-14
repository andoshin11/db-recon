import { Sequelize } from 'sequelize'
import * as fs from 'fs'
import * as prettier from 'prettier'
import * as path from 'path'
import * as ejs from 'ejs'
import { resolvers } from './resolver'
import { Interactor } from './interactor'
import { processColumnInfo, mapTypeInfo } from './utils'
import { DBInfo, TableInfo, TypeInfo, GenFileRequest } from './types'

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

    const typeInfo: DBInfo<TypeInfo> = Object.entries(columnInfo).reduce((acc, ac) => {
      const [tableName, tableInfo] = ac
      const _typeInfo = Object.entries(tableInfo).reduce((_acc, _ac) => {
        const [columnName, columnInfo] = _ac
        _acc[columnName] = mapTypeInfo(columnInfo)
        return _acc
      }, {} as TableInfo<TypeInfo>)
      acc[tableName] = _typeInfo

      return acc
    }, {} as DBInfo<TypeInfo>)
    // console.log(typeInfo)


    ///////////////// write files ///////////////////

    // setup templates
    const attributeTemplate = path.resolve(__dirname, '../templates/attribute.ejs')

    genFiles([
      {
        filepath: path.resolve('models', 'attribute.ts'),
        content: ejs.render(fs.readFileSync(attributeTemplate, 'utf-8'), { data: typeInfo }, createEjsOptions({ filename: attributeTemplate })) as string
      }
    ])

  } catch (e) {
    console.log(e)
  } finally {
    if (sequelize) await sequelize.close()
  }
}


function createEjsOptions(params: { filename: string }): ejs.Options {
  const defaultOptions = {
    root: path.resolve(__dirname, '../../templates'),
  }
  return {
    ...defaultOptions,
    ...params
  }
}

function genFiles(genCodeRequests: GenFileRequest[]) {
  genCodeRequests.forEach(v => {
    fs.writeFileSync(v.filepath, prettier.format(v.content, { parser: 'typescript' }), {
      encoding: 'utf-8',
      flag: 'w+'
    })
    console.log('Generated:', v.filepath)
  })
}

main()
