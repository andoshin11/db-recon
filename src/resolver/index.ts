import * as mysql from './mysql'
export * from './types'

export const resolvers = {
  mysql: mysql.resolver
}
