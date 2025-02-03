
  

# kysely-hash

  

[![CI](https://github.com/alenap93/kysely-hash/actions/workflows/ci.yml/badge.svg)](https://github.com/alenap93/kysely-hash/actions/workflows/ci.yml)

[![NPM version](https://img.shields.io/npm/v/kysely-hash.svg?style=flat)](https://www.npmjs.com/package/kysely-hash)

[![NPM downloads](https://img.shields.io/npm/dm/kysely-hash.svg?style=flat)](https://www.npmjs.com/package/kysely-hash)

[![js-prettier-style](https://img.shields.io/badge/code%20style-prettier-brightgreen.svg?style=flat)](https://prettier.io/)

  

Hash plugin for kysely fully typed, developed for Node.js but also runs on Deno and Bun; with this plugin you can hash fields using crypto-js library.



## Install

```
npm i kysely kysely-hash
```

## Usage

**Options**

* fieldsToDecrypt: *field to hash during insert and update, or in '=' and '!=' where condition (use alias if it is used)*

* hashAlgorithm: *hash algorithm*


**How to use**

    const kyselyInstance = new Kysely<Database>({
        dialect: new SqliteDialect({
            database: new Database(':memory:'),
        }),
    })

    await kyselyInstance.schema
        .createTable('person')
        .ifNotExists()
        .addColumn('id', 'integer', (col) => col.primaryKey())
        .addColumn('first_name', 'varchar(255)')
        .addColumn('last_name', 'varchar(255)')
        .addColumn('gender', 'varchar(255)')
        .execute()

    await kyselyInstance
        .insertInto('person')
        .values([
            {
                first_name: 'Max',
                last_name: 'Jack',
                gender: 'man',
            },
            {
                first_name: 'George',
                last_name: 'Rossi',
                gender: 'man',
            },
        ])
        .withPlugin(
            new KyselyHashPlugin<Database>({
                fieldsToHash: ['last_name'],
                hashAlgorithm: 'SHA256',
            }),
        )
        .execute() 

## License

  

Licensed under [MIT](./LICENSE).
