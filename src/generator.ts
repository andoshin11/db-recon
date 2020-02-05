import { Sequelize } from 'sequelize'
import * as fs from 'fs'
import * as prettier from 'prettier'
import * as path from 'path'
import * as ejs from 'ejs'
import { resolvers } from './resolver'
import { Interactor } from './interactor'
import { processColumnInfo, mapTypeInfo, processPrimaryKeyInfo, processMetaInfo } from './utils'
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
    const resolver = resolvers[interactor.dialect]
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

    const metaInfo = await processMetaInfo(tableNames as string[], interactor, resolver)

    const PKInfo = await processPrimaryKeyInfo(tableNames as string[], interactor)

    ///////////////// write files ///////////////////

    // Setup output directory
    if (!fs.existsSync(this.output)) {
      fs.mkdirSync(this.output)
    }

    // setup templates
    const attributeTemplate = path.resolve(__dirname, '../templates/attribute.ejs')
    const baseTemplate = path.resolve(__dirname, '../templates/base.ejs')
    const modelTemplate = path.resolve(__dirname, '../templates/model.ejs')
    const typesTemplate = path.resolve(__dirname, '../templates/types.ejs')

    this.genFiles([
      ...(tableNames as string[]).map(tableName => ({
        filepath: path.resolve(this.output, `${tableName}.ts`),
        content: ejs.render(this.readFileSync(modelTemplate), { tableName })
      })),
      {
        filepath: path.resolve(this.output, 'attribute.ts'),
        content: ejs.render(this.readFileSync(attributeTemplate), { typeInfo, PKInfo, metaInfo }, this.createEjsOptions({ filename: attributeTemplate })) as string
      },
      {
        filepath: path.resolve(this.output, 'base.ts'),
        content: ejs.render(this.readFileSync(baseTemplate), {}, this.createEjsOptions({ filename: baseTemplate })) as string
      },
      {
        filepath: path.resolve(this.output, 'types.ts'),
        content: ejs.render(this.readFileSync(typesTemplate), {}, this.createEjsOptions({ filename: typesTemplate })) as string
      }
    ])
  }

  private readFileSync(_path: string) {
    return fs.readFileSync(_path, 'utf-8')
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
