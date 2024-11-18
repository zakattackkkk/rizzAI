# Interface: IMemoryManager

## Properties

### constructor

> **constructor**: `Function`

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:470](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L470)
=======
[packages/core/src/types.ts:470](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L470)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### runtime

> **runtime**: [`IAgentRuntime`](IAgentRuntime.md)

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:467](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L467)
=======
[packages/core/src/types.ts:467](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L467)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### tableName

> **tableName**: `string`

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:468](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L468)
=======
[packages/core/src/types.ts:468](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L468)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

## Methods

### addEmbeddingToMemory()

> **addEmbeddingToMemory**(`memory`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:472](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L472)
=======
[packages/core/src/types.ts:472](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L472)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### countMemories()

> **countMemories**(`roomId`, `unique`?): `Promise`\<`number`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **unique?**: `boolean`

#### Returns

`Promise`\<`number`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:502](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L502)
=======
[packages/core/src/types.ts:502](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L502)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createMemory()

> **createMemory**(`memory`, `unique`?): `Promise`\<`void`\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

• **unique?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:499](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L499)
=======
[packages/core/src/types.ts:499](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L499)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`content`): `Promise`\<`object`[]\>

#### Parameters

• **content**: `string`

#### Returns

`Promise`\<`object`[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:481](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L481)
=======
[packages/core/src/types.ts:481](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L481)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemories()

> **getMemories**(`opts`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **opts**

• **opts.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.count?**: `number`

• **opts.end?**: `number`

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.start?**: `number`

• **opts.unique?**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:473](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L473)
=======
[packages/core/src/types.ts:473](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L473)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:485](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L485)
=======
[packages/core/src/types.ts:485](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L485)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](Memory.md)\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:484](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L484)
=======
[packages/core/src/types.ts:484](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L484)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeAllMemories()

> **removeAllMemories**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:501](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L501)
=======
[packages/core/src/types.ts:501](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L501)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeMemory()

> **removeMemory**(`memoryId`): `Promise`\<`void`\>

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:500](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L500)
=======
[packages/core/src/types.ts:500](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L500)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `opts`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **embedding**: `number`[]

• **opts**

• **opts.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.count?**: `number`

• **opts.match\_threshold?**: `number`

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.unique?**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:489](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L489)
=======
[packages/core/src/types.ts:489](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L489)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2
