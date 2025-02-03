import {
  OperationNodeTransformer,
  BinaryOperationNode,
  InsertQueryNode,
  ColumnUpdateNode,
  ValuesNode,
  ColumnNode,
  ReferenceNode,
  ValueNode,
} from 'kysely'
import { HashOptions, NestedKeysOrString } from './types/types'
import { hashMethodology } from './utils/hash-utils'

export class HashTransformer<T> extends OperationNodeTransformer {
  private options: HashOptions<T>
  private fieldsToHash: Set<NestedKeysOrString<T>>

  constructor(options: HashOptions<T>) {
    super()
    this.options = options
    this.fieldsToHash = new Set(options.fieldsToHash || [])
  }

  protected override transformBinaryOperation(
    node: BinaryOperationNode,
  ): BinaryOperationNode {
    return this.hashWhereValues(super.transformBinaryOperation(node))
  }

  protected override transformInsertQuery(
    node: InsertQueryNode,
  ): InsertQueryNode {
    return this.hashInsertValues(super.transformInsertQuery(node))
  }

  protected override transformColumnUpdate(
    node: ColumnUpdateNode,
  ): ColumnUpdateNode {
    return this.hashUpdateValues(super.transformColumnUpdate(node))
  }

  private hashInsertValues(node: InsertQueryNode): InsertQueryNode {
    // if (!(<ValuesNode>node?.values).values.length) return node

    const hashedValues = (<ValuesNode>node?.values)?.values.map(
      (valueList) => ({
        ...valueList,
        values: valueList.values.map((value, idx) =>
          this.maybeHash(<string>value, node.columns?.[idx]?.column?.name),
        ),
      }),
    )

    return {
      ...node,
      values: <ValuesNode>{
        ...node.values,
        values: hashedValues,
      },
    }
  }

  private hashUpdateValues(node: ColumnUpdateNode): ColumnUpdateNode {
    const columnName = (<ColumnNode>(<ReferenceNode>node?.column)?.column)
      ?.column.name
    const currentValue = (<ValueNode>node.value).value
    const hashedValue = this.maybeHash(<string>currentValue, columnName)

    return columnName &&
      currentValue &&
      hashedValue &&
      currentValue !== hashedValue
      ? { ...node, value: <ValueNode>{ ...node.value, value: hashedValue } }
      : node
  }

  private hashWhereValues(node: BinaryOperationNode): BinaryOperationNode {
    const columnName = (<ColumnNode>(<ReferenceNode>node.leftOperand)?.column)
      ?.column?.name
    const currentValue = (<ValueNode>node.rightOperand)?.value
    const hashedValue = this.maybeHash(<string>currentValue, columnName)

    return columnName &&
      currentValue &&
      hashedValue &&
      currentValue !== hashedValue
      ? {
          ...node,
          rightOperand: <ValueNode>{
            ...node.rightOperand,
            value: hashedValue,
          },
        }
      : node
  }

  private maybeHash(value: string, columnName?: string): string {
    return columnName && value && this.fieldsToHash.has(columnName)
      ? hashMethodology(value, this.options.hashAlgorithm)
      : value
  }
}
