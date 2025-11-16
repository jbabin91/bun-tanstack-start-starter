# Custom Search Param Serialization

> [!WARNING]
> **Advanced/Optional**: Most projects won't need custom serialization. Use this only if you have specific requirements for how search params are encoded in URLs.

By default, TanStack Router parses and serializes URL search params using `JSON.stringify` and `JSON.parse`, with proper escaping/unescaping.

For example, this object:

```tsx
const search = {
  page: 1,
  sort: 'asc',
  filters: { author: 'tanner', min_words: 800 },
};
```

Becomes:

```txt
?page=1&sort=asc&filters=%7B%22author%22%3A%22tanner%22%2C%22min_words%22%3A800%7D
```

## Customizing Serialization

You can customize serialization by providing your own functions to `parseSearch` and `stringifySearch` using `parseSearchWith` and `stringifySearchWith` helpers:

```tsx
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router';

const router = createRouter({
  parseSearch: parseSearchWith(JSON.parse),
  stringifySearch: stringifySearchWith(JSON.stringify),
});
```

> [!TIP]
> Ensure your serialization is idempotent: deserializing and re-serializing should produce the same result, or you may lose information.

## Base64 Encoding

Base64 encoding achieves maximum compatibility across browsers and URL unfurlers:

```tsx
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router';

const router = createRouter({
  parseSearch: parseSearchWith((value) => JSON.parse(decodeFromBinary(value))),
  stringifySearch: stringifySearchWith((value) =>
    encodeToBinary(JSON.stringify(value)),
  ),
});

function decodeFromBinary(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

function encodeToBinary(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
}
```

Result: `?page=1&sort=asc&filters=eyJhdXRob3IiOiJ0YW5uZXIiLCJtaW5fd29yZHMiOjgwMH0%3D`

## Using query-string Library

The [query-string](https://github.com/sindresorhus/query-string) library reliably parses and stringifies query strings:

```tsx
import {
  createRouter,
  stringifySearchWith,
  parseSearchWith,
} from '@tanstack/react-router';
import qs from 'query-string';

const router = createRouter({
  stringifySearch: stringifySearchWith((value) =>
    qs.stringify(value, {
      /* options */
    }),
  ),
  parseSearch: parseSearchWith((value) =>
    qs.parse(value, {
      /* options */
    }),
  ),
});
```

Result: `?page=1&sort=asc&filters=author%3Dtanner%26min_words%3D800`

## Using JSURL2 Library

[JSURL2](https://github.com/wmertens/jsurl2) compresses URLs while maintaining readability:

```tsx
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router';
import { parse, stringify } from 'jsurl2';

const router = createRouter({
  parseSearch: parseSearchWith(parse),
  stringifySearch: stringifySearchWith(stringify),
});
```

Result: `?page=1&sort=asc&filters=(author~tanner~min*_words~800)~`

## Using Zipson Library

[Zipson](https://jgranstrom.github.io/zipson/) is a performant JSON compression library:

```tsx
import {
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from '@tanstack/react-router';
import { stringify, parse } from 'zipson';

const router = createRouter({
  parseSearch: parseSearchWith((value) => parse(decodeFromBinary(value))),
  stringifySearch: stringifySearchWith((value) =>
    encodeToBinary(stringify(value)),
  ),
});

function decodeFromBinary(str: string): string {
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );
}

function encodeToBinary(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
}
```

Result: `?page=1&sort=asc&filters=JTdCJUMyJUE4YXV0aG9yJUMyJUE4JUMyJUE4dGFubmVyJUMyJUE4JUMyJUE4bWluX3dvcmRzJUMyJUE4JUMyJUEyQ3UlN0Q%3D`
