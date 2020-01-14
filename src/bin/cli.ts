import * as commander from 'commander'
import { Sequelize } from 'sequelize'
import { Generator } from '../generator'
const pkg = require('../../package.json')

interface CLIOptions {
  host?: string
  database?: string
  user?: string
  password?: string
  port?: string
  output?: string
}

commander
  .version(pkg.version)
  .description('Generate schema type definitions from your database lighting fast!')
  .command('generate')
  .option('-h, --host <host>', 'IP/Hostname for the database')
  .option('-d, --database <database>', 'Database name')
  .option('-u, --user <user>', 'Username for database')
  .option('-p, --password <password>', 'Password for database')
  .option('-P, --port <port>', 'Port number for database')
  .option('-o, --output <output>', 'Output directory')
  .action(async (options: CLIOptions) => {
    const { output, host, database, user, password, port } = options
    let sequelize: Sequelize | undefined
    try {
      if (!output) {
        throw new Error('Output directory is mandatory. Please specify with --output option.')
      }

      if (!host) {
        throw new Error('IP/Hostname for the database is mandatory. Please specify with --host option.')
      }

      if (!database) {
        throw new Error('Database name is mandatory. Please specify with --database option.')
      }

      if (!user) {
        throw new Error('Username for database is mandatory. Please specify with --user option.')
      }

      sequelize = new Sequelize(database, user, password, {
        host,
        port: port ? parseInt(port, 10) : undefined,
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

      const generator = new Generator(sequelize, output)
      await generator.generate()
    } catch (e) {
      console.error(e)
      process.exit(2)
    } finally {
      if (sequelize) await sequelize.close()
      console.log('Done!')
    }
  })

commander.parse(process.argv)
