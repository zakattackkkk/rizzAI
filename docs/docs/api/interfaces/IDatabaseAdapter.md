# Interface: IDatabaseAdapter

## Properties

### db

> **db**: `any`

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:363](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L363)
=======
[packages/core/src/types.ts:363](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L363)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

## Methods

### addParticipant()

> **addParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:445](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L445)
=======
[packages/core/src/types.ts:445](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L445)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### countMemories()

> **countMemories**(`roomId`, `unique`?, `tableName`?): `Promise`\<`number`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **unique?**: `boolean`

• **tableName?**: `string`

#### Returns

`Promise`\<`number`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:425](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L425)
=======
[packages/core/src/types.ts:425](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L425)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createAccount()

> **createAccount**(`account`): `Promise`\<`boolean`\>

#### Parameters

• **account**: [`Account`](Account.md)

#### Returns

`Promise`\<`boolean`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:365](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L365)
=======
[packages/core/src/types.ts:365](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L365)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createGoal()

> **createGoal**(`goal`): `Promise`\<`void`\>

#### Parameters

• **goal**: [`Goal`](Goal.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:437](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L437)
=======
[packages/core/src/types.ts:437](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L437)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createMemory()

> **createMemory**(`memory`, `tableName`, `unique`?): `Promise`\<`void`\>

#### Parameters

• **memory**: [`Memory`](Memory.md)

• **tableName**: `string`

• **unique?**: `boolean`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:418](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L418)
=======
[packages/core/src/types.ts:418](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L418)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createRelationship()

> **createRelationship**(`params`): `Promise`\<`boolean`\>

#### Parameters

• **params**

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:458](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L458)
=======
[packages/core/src/types.ts:458](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L458)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### createRoom()

> **createRoom**(`roomId`?): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Parameters

• **roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:441](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L441)
=======
[packages/core/src/types.ts:441](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L441)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getAccountById()

> **getAccountById**(`userId`): `Promise`\<[`Account`](Account.md)\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Account`](Account.md)\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:364](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L364)
=======
[packages/core/src/types.ts:364](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L364)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getActorDetails()

> **getActorDetails**(`params`): `Promise`\<[`Actor`](Actor.md)[]\>

#### Parameters

• **params**

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Actor`](Actor.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:394](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L394)
=======
[packages/core/src/types.ts:394](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L394)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getCachedEmbeddings()

> **getCachedEmbeddings**(`params`): `Promise`\<`object`[]\>

#### Parameters

• **params**

• **params.query\_field\_name**: `string`

• **params.query\_field\_sub\_name**: `string`

• **params.query\_input**: `string`

• **params.query\_match\_count**: `number`

• **params.query\_table\_name**: `string`

• **params.query\_threshold**: `number`

#### Returns

`Promise`\<`object`[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:380](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L380)
=======
[packages/core/src/types.ts:380](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L380)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getGoals()

> **getGoals**(`params`): `Promise`\<[`Goal`](Goal.md)[]\>

#### Parameters

• **params**

• **params.count?**: `number`

• **params.onlyInProgress?**: `boolean`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Goal`](Goal.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:430](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L430)
=======
[packages/core/src/types.ts:430](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L430)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getMemories()

> **getMemories**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.count?**: `number`

• **params.end?**: `number`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.start?**: `number`

• **params.tableName**: `string`

• **params.unique?**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:366](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L366)
=======
[packages/core/src/types.ts:366](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L366)
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
[packages/core/src/types.ts:376](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L376)
=======
[packages/core/src/types.ts:376](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L376)
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
[packages/core/src/types.ts:375](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L375)
=======
[packages/core/src/types.ts:375](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L375)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getParticipantsForAccount()

> **getParticipantsForAccount**(`userId`): `Promise`\<[`Participant`](Participant.md)[]\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Participant`](Participant.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:447](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L447)
=======
[packages/core/src/types.ts:447](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L447)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getParticipantsForRoom()

> **getParticipantsForRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:448](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L448)
=======
[packages/core/src/types.ts:448](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L448)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getParticipantUserState()

> **getParticipantUserState**(`roomId`, `userId`): `Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`"FOLLOWED"` \| `"MUTED"`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:449](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L449)
=======
[packages/core/src/types.ts:449](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L449)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getRelationship()

> **getRelationship**(`params`): `Promise`\<[`Relationship`](Relationship.md)\>

#### Parameters

• **params**

• **params.userA**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.userB**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](Relationship.md)\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:459](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L459)
=======
[packages/core/src/types.ts:459](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L459)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getRelationships()

> **getRelationships**(`params`): `Promise`\<[`Relationship`](Relationship.md)[]\>

#### Parameters

• **params**

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<[`Relationship`](Relationship.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:463](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L463)
=======
[packages/core/src/types.ts:463](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L463)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getRoom()

> **getRoom**(`roomId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:440](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L440)
=======
[packages/core/src/types.ts:440](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L440)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getRoomsForParticipant()

> **getRoomsForParticipant**(`userId`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:443](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L443)
=======
[packages/core/src/types.ts:443](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L443)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### getRoomsForParticipants()

> **getRoomsForParticipants**(`userIds`): `Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Parameters

• **userIds**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]

#### Returns

`Promise`\<\`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:444](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L444)
=======
[packages/core/src/types.ts:444](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L444)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### log()

> **log**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**

• **params.body**

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.type**: `string`

• **params.userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:388](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L388)
=======
[packages/core/src/types.ts:388](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L388)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeAllGoals()

> **removeAllGoals**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:439](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L439)
=======
[packages/core/src/types.ts:439](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L439)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeAllMemories()

> **removeAllMemories**(`roomId`, `tableName`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **tableName**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:424](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L424)
=======
[packages/core/src/types.ts:424](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L424)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeGoal()

> **removeGoal**(`goalId`): `Promise`\<`void`\>

#### Parameters

• **goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:438](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L438)
=======
[packages/core/src/types.ts:438](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L438)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeMemory()

> **removeMemory**(`memoryId`, `tableName`): `Promise`\<`void`\>

#### Parameters

• **memoryId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **tableName**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:423](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L423)
=======
[packages/core/src/types.ts:423](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L423)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeParticipant()

> **removeParticipant**(`userId`, `roomId`): `Promise`\<`boolean`\>

#### Parameters

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`boolean`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:446](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L446)
=======
[packages/core/src/types.ts:446](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L446)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### removeRoom()

> **removeRoom**(`roomId`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:442](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L442)
=======
[packages/core/src/types.ts:442](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L442)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### searchMemories()

> **searchMemories**(`params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **params**

• **params.embedding**: `number`[]

• **params.match\_count**: `number`

• **params.match\_threshold**: `number`

• **params.roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.tableName**: `string`

• **params.unique**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:395](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L395)
=======
[packages/core/src/types.ts:395](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L395)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### searchMemoriesByEmbedding()

> **searchMemoriesByEmbedding**(`embedding`, `params`): `Promise`\<[`Memory`](Memory.md)[]\>

#### Parameters

• **embedding**: `number`[]

• **params**

• **params.agentId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.count?**: `number`

• **params.match\_threshold?**: `number`

• **params.roomId?**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.tableName**: `string`

• **params.unique?**: `boolean`

#### Returns

`Promise`\<[`Memory`](Memory.md)[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:407](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L407)
=======
[packages/core/src/types.ts:407](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L407)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### setParticipantUserState()

> **setParticipantUserState**(`roomId`, `userId`, `state`): `Promise`\<`void`\>

#### Parameters

• **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **state**: `"FOLLOWED"` \| `"MUTED"`

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:453](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L453)
=======
[packages/core/src/types.ts:453](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L453)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### updateGoal()

> **updateGoal**(`goal`): `Promise`\<`void`\>

#### Parameters

• **goal**: [`Goal`](Goal.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:436](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L436)
=======
[packages/core/src/types.ts:436](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L436)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

***

### updateGoalStatus()

> **updateGoalStatus**(`params`): `Promise`\<`void`\>

#### Parameters

• **params**

• **params.goalId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

• **params.status**: [`GoalStatus`](../enumerations/GoalStatus.md)

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:403](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L403)
=======
[packages/core/src/types.ts:403](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L403)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2
