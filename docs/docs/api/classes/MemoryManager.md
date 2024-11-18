# Class: MemoryManager

Manage memories in the database.

## Implements

- [`IMemoryManager`](../interfaces/IMemoryManager.md)

## Constructors

### new MemoryManager()

> **new MemoryManager**(`opts`): [`MemoryManager`](MemoryManager.md)

Constructs a new MemoryManager instance.

#### Parameters

• **opts**

Options for the manager.

• **opts.runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime instance associated with this manager.

• **opts.tableName**: `string`

The name of the table this manager will operate on.

#### Returns

[`MemoryManager`](MemoryManager.md)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:35](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L35)
=======
[packages/core/src/memory.ts:35](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L35)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

## Properties

### runtime

> **runtime**: [`IAgentRuntime`](../interfaces/IAgentRuntime.md)

The AgentRuntime instance associated with this manager.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`runtime`](../interfaces/IMemoryManager.md#runtime)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:22](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L22)
=======
[packages/core/src/memory.ts:22](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L22)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### tableName

> **tableName**: `string`

The name of the database table this manager operates on.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`tableName`](../interfaces/IMemoryManager.md#tablename)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:27](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L27)
=======
[packages/core/src/memory.ts:27](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L27)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

## Methods

### addEmbeddingToMemory()

> **addEmbeddingToMemory**(`memory`): `Promise`\<[`Memory`](../interfaces/Memory.md)\>

Adds an embedding vector to a memory object. If the memory already has an embedding, it is returned as is.

#### Parameters

• **memory**: [`Memory`](../interfaces/Memory.md)

The memory object to add an embedding to.

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)\>

A Promise resolving to the memory object, potentially updated with an embedding vector.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`addEmbeddingToMemory`](../interfaces/IMemoryManager.md#addembeddingtomemory)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:45](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L45)
=======
[packages/core/src/memory.ts:45](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L45)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### countMemories()

> **countMemories**(`roomId`, `unique`): `Promise`\<`number`\>

Counts the number of memories associated with a set of user IDs, with an option for uniqueness.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to count memories for.

• **unique**: `boolean` = `true`

Whether to count unique memories only.

#### Returns

`Promise`\<`number`\>

A Promise resolving to the count of memories.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`countMemories`](../interfaces/IMemoryManager.md#countmemories)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:221](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L221)
=======
[packages/core/src/memory.ts:219](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L219)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createMemory()

> **createMemory**(`memory`, `unique`): `Promise`\<`void`\>

Creates a new memory in the database, with an option to check for similarity before insertion.

#### Parameters

• **memory**: [`Memory`](../interfaces/Memory.md)

The memory object to create.

• **unique**: `boolean` = `false`

Whether to check for similarity before insertion.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the operation completes.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`createMemory`](../interfaces/IMemoryManager.md#creatememory)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:158](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L158)
=======
[packages/core/src/memory.ts:158](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L158)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`content`): `Promise`\<`object`[]\>

#### Parameters

• **content**: `string`

#### Returns

`Promise`\<`object`[]\>

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getCachedEmbeddings`](../interfaces/IMemoryManager.md#getcachedembeddings)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:93](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L93)
=======
[packages/core/src/memory.ts:93](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L93)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemories()

> **getMemories**(`opts`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Retrieves a list of memories by user IDs, with optional deduplication.

#### Parameters

• **opts**

Options including user IDs, count, and uniqueness.

• **opts.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.count?**: `number` = `10`

The number of memories to retrieve.

• **opts.end?**: `number`

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to retrieve memories for.

• **opts.start?**: `number`

• **opts.unique?**: `boolean` = `true`

Whether to retrieve unique memories only.

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise resolving to an array of Memory objects.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getMemories`](../interfaces/IMemoryManager.md#getmemories)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:66](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L66)
=======
[packages/core/src/memory.ts:66](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L66)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemoriesByRoomIds()

> **getMemoriesByRoomIds**(`params`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

#### Parameters

• **params**

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.roomIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getMemoriesByRoomIds`](../interfaces/IMemoryManager.md#getmemoriesbyroomids)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:175](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L175)
=======
[packages/core/src/memory.ts:173](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L173)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemoryById()

> **getMemoryById**(`id`): `Promise`\<[`Memory`](../interfaces/Memory.md)\>

#### Parameters

• **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)\>

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`getMemoryById`](../interfaces/IMemoryManager.md#getmemorybyid)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:186](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L186)
=======
[packages/core/src/memory.ts:184](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L184)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeAllMemories()

> **removeAllMemories**(`roomId`): `Promise`\<`void`\>

Removes all memories associated with a set of user IDs.

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to remove memories for.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the operation completes.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`removeAllMemories`](../interfaces/IMemoryManager.md#removeallmemories)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:208](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L208)
=======
[packages/core/src/memory.ts:206](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L206)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeMemory()

> **removeMemory**(`memoryId`): `Promise`\<`void`\>

Removes a memory from the database by its ID.

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The ID of the memory to remove.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the operation completes.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`removeMemory`](../interfaces/IMemoryManager.md#removememory)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:196](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L196)
=======
[packages/core/src/memory.ts:194](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L194)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `opts`): `Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

Searches for memories similar to a given embedding vector.

#### Parameters

• **embedding**: `number`[]

The embedding vector to search with.

• **opts**

Options including match threshold, count, user IDs, and uniqueness.

• **opts.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **opts.count?**: `number`

The maximum number of memories to retrieve.

• **opts.match\_threshold?**: `number`

The similarity threshold for matching memories.

• **opts.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

The room ID to retrieve memories for.

• **opts.unique?**: `boolean`

Whether to retrieve unique memories only.

#### Returns

`Promise`\<[`Memory`](../interfaces/Memory.md)[]\>

A Promise resolving to an array of Memory objects that match the embedding.

#### Implementation of

[`IMemoryManager`](../interfaces/IMemoryManager.md).[`searchMemoriesByEmbedding`](../interfaces/IMemoryManager.md#searchmemoriesbyembedding)

#### Defined in

<<<<<<< HEAD
[packages/core/src/memory.ts:120](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/memory.ts#L120)
=======
[packages/core/src/memory.ts:120](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/memory.ts#L120)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2
