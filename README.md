# DB-Recon
Automatically generate typescript interfaces from database schema.

## :warning: Restriction :warning:
DB-Recon currently supports only MySQL.
Other forms of database support will be available later.

## Install

```sh
$ npm install db-recon
$ yarn add db-recon
```

## How to use

```sh
$ db-recon generate --host localhost --database sample_db --port 3306 --user andoshin11 --password VeryStr0ngPassword --output models
```

## CLI Options

```
Usage: db-recon [options] [command]

Generate schema type definitions from your database lighting fast!

Options:
  -V, --version       output the version number
  -h, --help          output usage information

Commands:
  generate [options]

  Options:
    -h, --host <host>          IP/Hostname for the database
    -d, --database <database>  Database name
    -u, --user <user>          Username for database
    -p, --password <password>  Password for database
    -P, --port <port>          Port number for database
    -o, --output <output>      Output directory
    -h, --help                 output usage information
```
