# Function: addHeader()

> **addHeader**(`header`, `body`): `string`

Adds a header to a body of text.

This function takes a header string and a body string and returns a new string with the header prepended to the body.
If the body string is empty, the header is returned as is.

## Parameters

• **header**: `string`

The header to add to the body.

• **body**: `string`

The body to which to add the header.

## Returns

`string`

The body with the header prepended.

## Example

```ts
// Given a header and a body
const header = "Header";
const body = "Body";

// Adding the header to the body will result in:
// "Header\nBody"
const text = addHeader(header, body);
```

## Defined in

<<<<<<< HEAD
[packages/core/src/context.ts:58](https://github.com/8bitsats/eliza/blob/b6c06b96b915454d08a65f46cfdce8da763cbf85/packages/core/src/context.ts#L58)
=======
[packages/core/src/context.ts:58](https://github.com/ai16z/eliza/blob/7fcf54e7fb2ba027d110afcc319c0b01b3f181dc/packages/core/src/context.ts#L58)
>>>>>>> 4b1caa00b77b5eb23e15d3adc3774fd4d6062fe2
