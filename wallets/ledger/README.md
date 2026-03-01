# @interchain-kit/ledger

<p align="center" width="100%">
    <img height="90" src="https://user-images.githubusercontent.com/545047/190171432-5526db8f-9952-45ce-a745-bea4302f912b.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/hyperweb-io/cosmos-kit/actions/workflows/run-tests.yml">
    <img height="20" src="https://github.com/hyperweb-io/cosmos-kit/actions/workflows/run-tests.yml/badge.svg" />
  </a>
  <br />
   <a href="https://github.com/hyperweb-io/cosmos-kit/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-BSD%203--Clause%20Clear-blue.svg"></a>
   <a href="https://www.npmjs.com/package/cosmos-kit"><img height="20" src="https://img.shields.io/github/package-json/v/hyperweb-io/cosmos-kit?filename=packages%2Fcosmos-kit%2Fpackage.json"></a>
</p>

## install

```sh
npm install @interchain-kit/ledger
```
## Table of contents

- [ledger](#ledger)
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
