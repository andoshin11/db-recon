import { Sequelize } from 'sequelize'
import * as fs from 'fs'
import * as prettier from 'prettier'
import * as path from 'path'
import * as ejs from 'ejs'
import { Interactor } from './interactor'
import { processColumnInfo, mapTypeInfo } from './utils'
import { DBInfo, TableInfo, TypeInfo, GenFileRequest } from './types'

export class Generator {
  private sequelize: Sequelize
  private output: string

  constructor(sequelize: Sequelize, output: string) {
    this.sequelize = sequelize
    this.output = path.resolve(process.cwd(), output)
  }

  async generate() {

    const interactor = new Interactor(this.sequelize)
    let tableNames = await interactor.showAllTables()
    if (typeof tableNames[0] !== 'string') {
      // @ts-ignore
      tableNames = tableNames.map(i => i.tableName)
    }
    const columnInfo = await processColumnInfo(tableNames as string[], interactor)

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

    ///////////////// write files ///////////////////

    // Setup output directory
    if (!fs.existsSync(this.output)) {
      fs.mkdirSync(this.output)
    }

    // setup templates
    const attributeTemplate = path.resolve(__dirname, '../templates/attribute.ejs')

    this.genFiles([
      {
        filepath: path.resolve(this.output, 'attribute.ts'),
        content: ejs.render(fs.readFileSync(attributeTemplate, 'utf-8'), { data: typeInfo }, this.createEjsOptions({ filename: attributeTemplate })) as string
      }
    ])
  }

  private createEjsOptions(params: { filename: string }): ejs.Options {
    const defaultOptions = {
      root: path.resolve(__dirname, '../templates'),
    }
    return {
      ...defaultOptions,
      ...params
    }
  }

  private genFiles(genCodeRequests: GenFileRequest[]) {
    genCodeRequests.forEach(v => {
      fs.writeFileSync(v.filepath, prettier.format(v.content, { parser: 'typescript' }), {
        encoding: 'utf-8',
        flag: 'w+'
      })
      console.log('Generated:', v.filepath)
    })
  }
}
