import { Generated, Kysely } from 'npm:kysely'
import { DB as Sqlite } from 'https://deno.land/x/sqlite/mod.ts'
import { DenoSqliteDialect } from 'jsr:@soapbox/kysely-deno-sqlite'

import { KyselyHashPlugin } from '../../dist/index.d.mts'
import { assertEquals, assertRejects } from '@std/assert'
import {
  beforeEach,
  afterEach,
  describe,
  it,
} from 'https://deno.land/std/testing/bdd.ts'

export interface Database {
  person: PersonTable
}

export interface PersonTable {
  id: Generated<number>

  first_name: string

  gender: 'man' | 'woman' | 'other'

  last_name: string
}

describe(`KyselyHashPlugin - DENO`, () => {
  let kyselyInstance: Kysely<Database>

  beforeEach(async () => {
    kyselyInstance = new Kysely({
      dialect: new DenoSqliteDialect({
        database: new Sqlite(':memory:'),
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
  })

  afterEach(async () => {
    await kyselyInstance.destroy()
  })

  it('can select and get hashed value', async () => {
    const selectHashed = await kyselyInstance
      .selectFrom('person')
      .selectAll()
      .where('last_name', '=', 'Jack')
      .withPlugin(
        new KyselyHashPlugin<Database>({
          fieldsToHash: ['last_name'],
          hashAlgorithm: 'SHA256',
        }),
      )
      .executeTakeFirst()

    assertEquals(
      selectHashed?.last_name,
      'b5fd03dd91df1cfbd2f19c115d24d58bbda01a23fb01924bb78b2cc14f7ff1cb',
    )
  })

  it('can update and set hashed value', async () => {
    await kyselyInstance
      .updateTable('person')
      .where('last_name', '=', 'Jack')
      .set('last_name', 'JackNEW')
      .set('first_name', 'MaxNEW')
      .withPlugin(
        new KyselyHashPlugin<Database>({
          fieldsToHash: ['last_name'],
          hashAlgorithm: 'SHA256',
        }),
      )
      .execute()

    const selectHashed = await kyselyInstance
      .selectFrom('person')
      .selectAll()
      .where('last_name', '=', 'JackNEW')
      .withPlugin(
        new KyselyHashPlugin<Database>({
          fieldsToHash: ['last_name'],
          hashAlgorithm: 'SHA256',
        }),
      )
      .executeTakeFirst()

    assertEquals(
      selectHashed?.last_name,
      'ad17312fab95b1c94efa5bb5ba82899034177a171181561eea01c551716e9ce2',
    )
  })

  it('will throw an error if hashAlgorithm is null', async () => {
    const selectHashedQuery = kyselyInstance
      .selectFrom('person')
      .selectAll()
      .where('last_name', '=', 'Yellow')
      .withPlugin(
        new KyselyHashPlugin<Database>({
          fieldsToHash: ['last_name'],
          hashAlgorithm: <any>null,
        }),
      )

    await assertRejects(selectHashedQuery?.execute)
  })

  it('will throw an error if hashAlgorithm is not recognized', async () => {
    const selectHashedQuery = kyselyInstance
      .selectFrom('person')
      .selectAll()
      .where('last_name', '=', 'Yellow')
      .withPlugin(
        new KyselyHashPlugin<Database>({
          fieldsToHash: ['last_name'],
          hashAlgorithm: <any>'test',
        }),
      )

    await assertRejects(selectHashedQuery?.execute)
  })
})
