import * as mysql from './mysql'
import * as mssql from './mssql'
export * from './types'

export const resolvers = {
  mysql: mysql.resolver,
  mssql: mssql.resolver
}
