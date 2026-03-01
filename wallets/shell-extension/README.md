# shell-extension

<p align="center">
  <img src="https://user-images.githubusercontent.com/545047/188804067-28e67e5e-0214-4449-ab04-2e0c564a6885.svg" width="80"><br />
    interchain-kit wallet connector
</p>

## install

```sh
npm install shell-extension
```
## Table of contents

- [shell-extension](#shell-extension)
  - [Install](#install)
  - [Table of contents](#table-of-contents)
- [Developing](#developing)
- [Credits](#credits)

## Developing

When first cloning the repo:

```sh
pnpm
# build the prod packages. When devs would like to navigate to the source code, this will only navigate from references to their definitions (.d.ts files) between packages.
pnpm build
```

Or if you want to make your dev process smoother, you can run:

```sh
pnpm
# build the dev packages with .map files, this enables navigation from references to their source code between packages.
pnpm build:dev
```
