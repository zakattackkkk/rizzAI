# Interface: Content

Represents the content of a message, including its main text (`content`), any associated action (`action`), and the source of the content (`source`), if applicable.

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### action?

> `optional` **action**: `string`

#### Defined in

[packages/core/src/types.ts:13](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L13)

***

### attachments?

> `optional` **attachments**: [`Media`](../type-aliases/Media.md)[]

#### Defined in

[packages/core/src/types.ts:17](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L17)

***

### inReplyTo?

> `optional` **inReplyTo**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Defined in

[packages/core/src/types.ts:16](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L16)

***

### source?

> `optional` **source**: `string`

#### Defined in

[packages/core/src/types.ts:14](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L14)

***

### text

> **text**: `string`

#### Defined in

[packages/core/src/types.ts:12](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L12)

***

### url?

> `optional` **url**: `string`

#### Defined in

[packages/core/src/types.ts:15](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L15)
