# Package managers

## NPM requirements

Bryntum demo applications use package aliasing for trial Bryntum Grid packages. This requires **npm** versions that 
support aliases.

Minimum supported **npm** versions are `v6.9.0` or `v7.11.0`.

Check installed **npm** version with:

```shell
npm -v
```

Use [npm upgrade guide](https://docs.npmjs.com/try-the-latest-stable-version-of-npm) for **npm** upgrade
instructions and check Docs for [package alias](https://docs.npmjs.com/cli/v10/commands/npm-install) syntax.

## Yarn package manager

To access the Bryntum repository with **yarn** we recommend use authorization with **npm** as described in the
[Repository access](#Grid/guides/npm/repository/private-repository-access.md) guide. This step is mandatory. 

After you have been authorized with **npm** you will be able to install packages with **yarn**.

Please note that **yarn** uses an npm authorization token to access private repository.

### Yarn v1

Yarn v1 uses npm authorization token to access private repository, so no additional steps required.

### Yarn v2+

Yarn v2 and newer requires additional steps to configure access. 

Create a **.yarnrc.yml** file in user home or project directory with this content:

`npmRegistryServer` should match the npm server which you use.

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```yaml
npmScopes: 
  bryntum: 
    npmRegistryServer: https://npm.bryntum.com
    npmAlwaysAuth: true
    npmAuthIdent: YOUR-USER-NAME
    npmAuthToken: AUTH-TOKEN-VALUE
```

</div>
<div>

```yaml
npmScopes: 
  bryntum: 
    npmRegistryServer: https://npm-us.bryntum.com
    npmAlwaysAuth: true
    npmAuthIdent: YOUR-USER-NAME
    npmAuthToken: AUTH-TOKEN-VALUE
```
</div>
</div>

If you have authorized at the Bryntum repository using npm, then copy `AUTH-TOKEN-VALUE` from the `.npmrc` file.
This file is located in user home directory.

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```ini
@bryntum:registry="https://npm.bryntum.com"
//npm.bryntum.com/:_authToken=AUTH-TOKEN-VALUE
```

</div>
<div>

```ini
@bryntum:registry="https://npm-us.bryntum.com"
//npm-us.bryntum.com/:_authToken=AUTH-TOKEN-VALUE
```
</div>
</div>

You may also [create new token](#Grid/guides/npm/repository/automation.md#creating-an-access-token).

Yarn documentation for [npmScopes](https://yarnpkg.com/configuration/yarnrc#npmScopes) config parameter.


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>