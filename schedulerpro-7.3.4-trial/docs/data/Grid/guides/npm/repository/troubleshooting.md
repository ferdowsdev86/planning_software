# Support

## Troubleshooting

### Project cleanup

If you encounter issues with installing or building your application, they can often be resolved by clearing the npm
cache for the project and global npm packages.

Optionally first clean the global npm/yarn cache:

**npm**

```shell
npm cache clean --force
```

**yarn**

```shell
yarn cache clean
```

Run the following commands in your application folder to remove installed packages and reinstall all project
dependencies:

<div class="docs-tabs" data-name="os">
<div>
    <a>MacOS/Linux</a>
    <a>Windows</a>
</div>
<div>

<strong>npm</strong>

```shell
rm -rf node_modules
rm package-lock.json
npm install
```

<strong>yarn</strong>

```shell
rm -rf node_modules
rm package-lock.json
yarn install
```

</div>
<div>

<strong>npm</strong>

```shell
rmdir node_modules /s /q
del package-lock.json
npm install
```

<strong>yarn</strong>

```shell
rmdir node_modules /s /q
del package-lock.json
yarn install
```
</div>
</div>

### 403 Forbidden. Cannot authorize

```shell
npm error 403 --------------------------------------------------------
npm error 403                   BRYNTUM NPM REGISTRY
npm error 403 --------------------------------------------------------
npm error 403 Cannot authorize "user..yourdomain.com"
npm error 403 Wrong password
npm error 403 Please use Bryntum Customer Zone password
npm error 403 --------------------------------------------------------
npm error 403   Npm server login guide: https://npm.bryntum.com/help
npm error 403   Get support at: https://forum.bryntum.com/
npm error 403 --------------------------------------------------------
```

The error above means you need to check your password. Use your
[CustomerZone](https://customerzone.bryntum.com) password to gain licensed access.

<div class="note">

If you purchased a product and registered a new email at <a href="https://customerzone.bryntum.com">Bryntum Customer Zone</a>, then you
should re-login with new email to gain full registry access.

</div>

### 403 Forbidden. Not allowed to install

```text
npm error 403 403 Forbidden - GET https://npm.bryntum.com/@bryntum/grid/-/grid-7.3.4.tgz -
npm error 403
npm error 403 --------------------------------------------------------
npm error 403                   BRYNTUM NPM REGISTRY
npm error 403 --------------------------------------------------------
npm error 403 "user..yourdomain.com" only has access for trial packages
npm error 403 It is not allowed to install licensed package "@bryntum/grid"
npm error 403 Use "@bryntum/grid-trial" package instead or contact support
npm error 403 --------------------------------------------------------
npm error 403   Npm server login guide: https://npm.bryntum.com/help
npm error 403   Get support at: https://forum.bryntum.com/
npm error 403 --------------------------------------------------------
```

The error above means that you are not allowed to access licensed package when logged in as **trial** or your 
[CustomerZone](https://customerzone.bryntum.com) account has no valid Bryntum Grid license.

### 404 Not Found

<div class="docs-tabs" data-name="packagemanager">
<div>
    <a>npm</a>
    <a>yarn</a>
</div>
<div>

```shell
Not Found - GET https://registry.npmjs.org/@bryntum%2fgrid"
npm ERR! 404
npm ERR! 404 '@bryntum/grid@7.3.4' is not in the npm registry.
```

This error means that <strong>npm</strong> tries to get package from public repository at <code>https://registry.npmjs.org</code> but not from
Bryntum private repository at <code>https://npm.bryntum.com</code>.

</div>
<div>

```shell
> YN0000: | Resolution step
> YN0035: | @bryntum/grid@npm:7.3.4: Package not found
> YN0035: |   Response Code: 404 (Not Found)
> YN0035: |   Request Method: GET
> YN0035: |   Request URL: https://registry.yarnpkg.com/@bryntum%grid
> YN0000: | Completed in 0s 303ms
```

This error means that <strong>yarn</strong> tries to get package from public repository at <code>https://registry.yarnpkg.com</code> but not 
from Bryntum private repository at <code>https://npm.bryntum.com</code>.
</div>
</div>

To fix this problem, configure your package manager as stated in the
[Configure npm](#Grid/guides/npm/repository/private-repository-access.md#configure-npm) guide and reinstall the
package.

### ERR! Web login not supported

Bryntum repository does not support the web login protocol used by a few npm `v9.x` versions as a default.
If you are on such version, please add `--auth-type=legacy` option to authenticate, or upgrade your npm client to `v9.5` 
or newer.

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
npm login --auth-type=legacy --registry=https://npm.bryntum.com
```

</div>
<div>

```shell
npm login --auth-type=legacy --registry=https://npm-us.bryntum.com
```
</div>
</div>

### EINTEGRITY when installing @bryntum packages

You may encounter error like this:

```shell
npm WARN tarball ... seems to be corrupted. Trying again.
npm ERR! code EINTEGRITY
npm ERR! integrity checksum failed when using sha512
```

This typically occurs when different Bryntum accounts are used on the same machine or project. Each installation is 
tied to a specific license, so the package that npm expects may not match what is stored in the local cache. When that 
happens, npm's integrity check fails.

The standard approach is to clear the npm cache and reinstall dependencies:

<div class="docs-tabs" data-name="cache">
<div>
    <a>Standard cleanup</a>
    <a>Reducing unnecessary download</a>
</div>
<div>

```shell
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

</div>
<div>

If clearing the entire npm cache is undesirable - such as on metered or slow networks - you can remove only the 
Bryntum-related cache entries instead. <strong>npm</strong> does not provide a command to clear specific packages, but you can do it 
manually:

1. Locate the cache directory

```shell
npm config get cache
```

2. Inside that directory, delete only the Bryntum-specific folders (for example, <code>@bryntum/*</code>).

This removes only the cached Bryntum packages while keeping the rest of the cache intact, reducing the amount of data 
that needs to be re-downloaded.
</div>
</div>

### Other problems

If you have problems with accessing Bryntum NPM repository, please check these first:

* Install a supported **npm** version as stated in
  [NPM requirements](#Grid/guides/npm/repository/package-managers.md#npm-requirements)
* You cannot have access to full package `@bryntum/grid` from a trial account. Use `@bryntum/grid-trial`
  package as described in 
  [Installing trial packages](#Grid/guides/npm/repository/installation.md#installing-trial-packages)
* Check you have typed a correct password from [Bryntum Customer Zone](https://customerzone.bryntum.com)
* To access full packages, check if you are a real [Bryntum Customer Zone](https://customerzone.bryntum.com) user.
  Register or ask a license owner to add you there
* If you use **yarn** please check 
  [Yarn package manager](#Grid/guides/npm/repository/package-managers.md#yarn-package-manager) information
* Contact us at [Bryntum Support Forum](https://forum.bryntum.com/) for any questions. Please attach **npm** console log
  to your question

## Online references

* Visit [npm Package Manager homepage](https://npmjs.com)
* Read [npm Documentation](https://docs.npmjs.com)
* Visit [yarn Package Manager homepage](https://yarnpkg.com)
* Read [yarn Documentation](https://yarnpkg.com/getting-started)
* Check all available packages in [Bryntum npm Repository](https://npm.bryntum.com)
* Browse [Bryntum Grid examples](https://bryntum.com/products/grid/examples/)
* Browse [All Bryntum products examples](https://bryntum.com/examples/)
* Purchase licensed components in our [Store](https://bryntum.com/store/)
* Read [Bryntum Grid Online Documentation](https://bryntum.com/products/grid/docs/)
* Post your questions to [Bryntum Support Forum](https://forum.bryntum.com/)
* Access [Bryntum Customer Zone](https://customerzone.bryntum.com)
* [Contact us](https://bryntum.com/contact/)


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>