# Interface: IImageDescriptionService

## Extends

- [`Service`](../classes/Service.md)

## Methods

### describeImage()

> **describeImage**(`imageUrl`): `Promise`\<`object`\>

#### Parameters

• **imageUrl**: `string`

#### Returns

`Promise`\<`object`\>

##### description

> **description**: `string`

##### title

> **title**: `string`

#### Defined in

[packages/core/src/types.ts:585](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L585)

***

### getInstance()

> **getInstance**(): [`IImageDescriptionService`](IImageDescriptionService.md)

#### Returns

[`IImageDescriptionService`](IImageDescriptionService.md)

#### Defined in

[packages/core/src/types.ts:583](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L583)

***

### initialize()

> **initialize**(`modelId`?, `device`?): `Promise`\<`void`\>

#### Parameters

• **modelId?**: `string`

• **device?**: `string`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/core/src/types.ts:584](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/types.ts#L584)
