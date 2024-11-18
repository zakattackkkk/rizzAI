# Function: splitChunks()

> **splitChunks**(`content`, `chunkSize`, `bleed`): `Promise`\<`string`[]\>

Splits content into chunks of specified size with optional overlapping bleed sections

## Parameters

• **content**: `string`

The text content to split into chunks

• **chunkSize**: `number`

The maximum size of each chunk in tokens

• **bleed**: `number` = `100`

Number of characters to overlap between chunks (default: 100)

## Returns

`Promise`\<`string`[]\>

Promise resolving to array of text chunks with bleed sections

## Defined in

<<<<<<< HEAD
[packages/core/src/generation.ts:391](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/generation.ts#L391)
=======
[packages/core/src/generation.ts:390](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/generation.ts#L390)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2
