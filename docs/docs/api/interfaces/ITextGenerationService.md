# Interface: ITextGenerationService

## Extends

- [`Service`](../classes/Service.md)

## Methods

### getEmbeddingResponse()

> **getEmbeddingResponse**(`input`): `Promise`\<`number`[]\>

#### Parameters

• **input**: `string`

#### Returns

`Promise`\<`number`[]\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:625](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L625)

***
=======
[packages/core/src/types.ts:625](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L625)

---
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

### getInstance()

> **getInstance**(): [`ITextGenerationService`](ITextGenerationService.md)

#### Returns

[`ITextGenerationService`](ITextGenerationService.md)

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:607](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L607)

***
=======
[packages/core/src/types.ts:607](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L607)

---
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

### initializeModel()

> **initializeModel**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:608](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L608)

***
=======
[packages/core/src/types.ts:608](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L608)

---
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

### queueMessageCompletion()

> **queueMessageCompletion**(`context`, `temperature`, `stop`, `frequency_penalty`, `presence_penalty`, `max_tokens`): `Promise`\<`any`\>

#### Parameters

• **context**: `string`

• **temperature**: `number`

• **stop**: `string`[]

<<<<<<< HEAD
• **frequency\_penalty**: `number`

• **presence\_penalty**: `number`

• **max\_tokens**: `number`
=======
• **frequency_penalty**: `number`

• **presence_penalty**: `number`

• **max_tokens**: `number`
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

#### Returns

`Promise`\<`any`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:609](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L609)

***
=======
[packages/core/src/types.ts:609](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L609)

---
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

### queueTextCompletion()

> **queueTextCompletion**(`context`, `temperature`, `stop`, `frequency_penalty`, `presence_penalty`, `max_tokens`): `Promise`\<`string`\>

#### Parameters

• **context**: `string`

• **temperature**: `number`

• **stop**: `string`[]

<<<<<<< HEAD
• **frequency\_penalty**: `number`

• **presence\_penalty**: `number`

• **max\_tokens**: `number`
=======
• **frequency_penalty**: `number`

• **presence_penalty**: `number`

• **max_tokens**: `number`
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2

#### Returns

`Promise`\<`string`\>

#### Defined in

<<<<<<< HEAD
[packages/core/src/types.ts:617](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L617)
=======
[packages/core/src/types.ts:617](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/types.ts#L617)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2
