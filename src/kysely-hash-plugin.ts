import {
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
} from 'kysely'
import { HashTransformer } from './hash-transformer'
import { HashOptions } from './types/types'

export class KyselyHashPlugin<T> implements KyselyPlugin {
  readonly #hashTransformer: HashTransformer<T>

  constructor(options: HashOptions<T>) {
    this.#hashTransformer = new HashTransformer<T>(options)
  }

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return this.#hashTransformer.transformNode(args.node)
  }

  async transformResult(
    args: PluginTransformResultArgs,
  ): Promise<QueryResult<UnknownRow>> {
    return args.result
  }
}
