# @nginxui/plugin-market-ui

The plugin marketplace views of [Nginx UI](https://github.com/0xJacky/nginx-ui),
shared with the store previews of the developer portal, so a preview looks
exactly like the marketplace.

- `MarketCard`: a plugin in the marketplace list.
- `MarketDetail`: the detail of a plugin, below the title of its drawer.
- `PermissionList`: the permissions a plugin asks for, with the author's notes.
- `PluginIcon`: a plugin icon with its first letter until the image loads.
- The wording of permissions, capabilities, categories and trust levels.

Vue 3 and antdv-next are peer dependencies. The views use the antdv-next CSS
variables, so they follow the theme of the nearest `ConfigProvider`.

```ts
import { MarketDetail, setMarketText } from '@nginxui/plugin-market-ui'
import '@nginxui/plugin-market-ui/style.css'
```

## Translations

Nginx UI owns the wording. It translates the messages with its own catalogs
and hands its translator to the views with `setMarketText`, listing the ids
of `@nginxui/plugin-market-ui/msgids.json` for its extraction. Anything else
uses the translations the package carries, picked by locale with
`bundledText(locale)` and given to a subtree with `provideMarketText`.

After a change of wording, refresh them from a checkout of Nginx UI:

```sh
bun run messages ../nginx-ui/app/src/language
```

## Development

```sh
bun install
bun run test
bun run build
```

A consumer can use a local checkout through `bun link` while
`bun run dev` rebuilds on every change.
