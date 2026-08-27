# Private repository access

Bryntum components are commercial products, hosted in a private Bryntum repository. To get repository access, you need
to complete these **two steps**:

* [Configure npm](#Grid/guides/npm/repository/private-repository-access.md#configure-npm)
* [Login](#Grid/guides/npm/repository/private-repository-access.md#login)

You may access the repository with a single login, or if your team contains multiple developers, you may follow the
instructions in the [multi-user access](#Grid/guides/npm/repository/private-repository-access.md#multi-user-access) section.

## Important: Repository scope configuration

When you configure npm for the `@bryntum` scope to use the private repository, **all** `@bryntum` packages in your
project will be loaded from that repository. You cannot mix packages from public and private repositories in the
same project.

Both repositories contain identical packages (trial packages and framework wrappers), so you can use them from either
source. However, licensed packages (without the `-trial` suffix) are only available from the private repository.

<div class="note">

If you previously used trial packages from the public npm registry and are switching to the private repository, you
need to run a project cleanup. See the
<a href="#Grid/guides/npm/repository/troubleshooting.md">Troubleshooting guide</a> for cleanup instructions.

</div>

## Repositories

Bryntum has two repositories located in Europe and US:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```text
https://npm.bryntum.com
```

</div>
<div>

```text
https://npm-us.bryntum.com
```
</div>
</div>

<div class="note">

Please change repository URL for the commands in this guide accordingly.

</div>

## Configure npm

Configure **npm** to download packages for the `@bryntum` scope from the Bryntum registry with this command which will
store the npm configuration in your local machine:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
npm config set "@bryntum:registry=https://npm.bryntum.com"
```

</div>
<div>

```shell
npm config set "@bryntum:registry=https://npm-us.bryntum.com"
```
</div>
</div>

<div class="note">

Do not forget to put the config value in quotes as shown above (required for Windows PowerShell).

</div>

Check that **npm** uses correct Bryntum repository setting with:

```shell
npm config list
```

Command console output should contain this setting:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
@bryntum:registry = "https://npm.bryntum.com"
```

</div>
<div>

```shell
@bryntum:registry = "https://npm-us.bryntum.com"
```
</div>
</div>

Check [npm-config](https://docs.npmjs.com/cli/v10/commands/npm-config) online documentation.

## Login

Login to the registry using this command, which will create and store login credentials on your local machine:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
npm login --registry=https://npm.bryntum.com
```

</div>
<div>

```shell
npm login --registry=https://npm-us.bryntum.com
```
</div>
</div>

Login example:

<div class="note">

Do not use <code>user..yourdomain.com</code> and <code>user@yourdomain.com</code> from the example below to login! Use your own email address.

</div>

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

Use your email as the login but replace the <code>@</code> with <code>..</code> (double dot) and use <code>trial</code> as password.

For example, if your email is <code>user@yourdomain.com</code>, use the following:<br>

<strong>Europe location:</strong>

```shell
$ npm login --registry=https://npm.bryntum.com
npm notice Log in on https://npm.bryntum.com/
Username: user..yourdomain.com
Password: trial
```

<strong>US location:</strong>

```shell
$ npm login --registry=https://npm-us.bryntum.com
npm notice Log in on https://npm-us.bryntum.com/
Username: user..yourdomain.com
Password: trial
```

</div>
<div>

Use your <a href="https://customerzone.bryntum.com">Bryntum Customer Zone</a> email as login but replace <code>@</code> with <code>..</code>
(double dot). Use your Bryntum Customer Zone password.

For example, if your username in Customer Zone is <code>user@yourdomain.com</code>, use the following:<br>

<strong>Europe location:</strong>

```shell
$ npm login --registry=https://npm.bryntum.com
npm notice Log in on https://npm.bryntum.com/
Username: user..yourdomain.com
Password: your-customer-zone-password
```

<strong>US location:</strong>

```shell
$ npm login --registry=https://npm-us.bryntum.com
npm notice Log in on https://npm-us.bryntum.com/
Username: user..yourdomain.com
Password: your-customer-zone-password
```

<div class="note">

If you purchased a product and registered a new email at <a href="https://customerzone.bryntum.com">Bryntum Customer Zone</a>, then you
should re-login with new email to gain full registry access.

</div>

<div class="note">

Access to the licensed packages requires an active support subscription. After your subscription expires, you will only
have access to packages which were published before subscription expiry date.

</div>
</div>
</div>

<div class="note">

If you see a rotating spinner after the password prompt in the console (introduced in <strong>npm</strong> <code>10.7</code>), enter your
password and press <code>[Enter]</code>. The spinner is not indicating any progress, it's a part of the prompt display waiting for
your input.

</div>

## Multi-user access

The Bryntum npm repository requires authentication to install packages. For teams working on projects with Bryntum Suite
packages, there are two recommended approaches to manage repository access:

1. Individual Developer Access: Each team member can set up their own login through
   the [Bryntum Customer Zone](https://customerzone.bryntum.com). Navigate to **Licenses** - **Seats** - **Manage** to add/remove
   team members and manage user licenses. However, using individual developer credentials for repository access is not
   recommended for shared projects or development teams since `package-lock.json` will contain user-specific
   authentication hashes. Instead, use shared access tokens as described in option 2 below.

2. Shared Token Access: For CI/CD pipelines or development teams, use access tokens for authentication. 
These secure tokens can be:
  * Stored in individual `.npmrc` files in each developer's home directory. This allows access to be shared with a 
    limited number of developers
  * Added to a shared `.npmrc` file in the project directory and committed to version control. This enables access for
    everyone working on the project
  * Used in CI/CD pipeline configurations. The pipeline can copy the token file into the project folder before 
    running `npm install`, limiting token exposure to the CI/CD process without sharing it with the entire development
    team

Tokens provide several benefits:

  * No expiration date
  * Can be created or deleted as needed
  * More secure than sharing login credentials
  * Ideal for automated build processes
  * One developer seat/license in the Bryntum Customer Zone allows the creation of an unlimited number of tokens for
    accessing the repository

For detailed instructions on using tokens in CI/CD pipelines, please see
[Access tokens for CI/CD](#Grid/guides/npm/repository/automation.md#access-tokens-for-cicd) and
[Artifactory integration](#Grid/guides/npm/repository/automation.md#artifactory-integration) guides.

## Access tokens

Access tokens may be used instead of password authentication for CI/CD environment or multi-user repository access for
secure authorization to the Bryntum repository.

You can create a token and save it as a `.npmrc` file in your project
directory to be able to install Bryntum packages with **npm** or **yarn**. Please follow the instructions below.

See also [npm token documentation](https://docs.npmjs.com/creating-and-viewing-access-tokens).

### Creating an access token

To create a new token using the command line, run:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
$ npm token create --registry=https://npm.bryntum.com
npm password: Enter your password here
```

</div>
<div>

```shell
$ npm token create --registry=https://npm-us.bryntum.com
npm password: Enter your password here
```
</div>
</div>

Copy the token from the console, which is displayed after this command:

```shell
+----------+-------------------------+
| token    | eyJhb...                |
+----------+-------------------------+
| user     | user..example.com       |
+----------+-------------------------+
| cidr     |                         |
+----------+-------------------------+
| readonly | false                   |
+----------+-------------------------+
| created  | 2021-07-20T01:02:03.00Z |
+----------+-------------------------+
```

### Viewing access tokens

To view all available tokens using the command line, run:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
npm token list --registry=https://npm.bryntum.com
```

</div>
<div>

```shell
npm token list --registry=https://npm-us.bryntum.com
```
</div>
</div>

All available tokens will be displayed in the console:

```shell
+--------+---------+------------+----------+----------------+
| id     | token   | created    | readonly | CIDR whitelist |
+--------+---------+------------+----------+----------------+
| b54f12 | eyJhb.. | 2021-07-20 | no       |                |
+--------+---------+------------+----------+----------------+
```

### Removing an access token

To remove a created token using the command line, run:

<div class="note">

Replace <strong>tokenId</strong> with <strong>id</strong> from the tokens table displayed after <strong>npm token list</strong> command

</div>

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```shell
npm token delete tokenId --registry=https://npm.bryntum.com
```

</div>
<div>

```shell
npm token delete tokenId --registry=https://npm-us.bryntum.com
```
</div>
</div>

### `.npmrc` locations

The `npm` package manager uses a configuration file named `.npmrc` that stores information of repositories,
authTokens and other configuration options. `npm` uses this file from the following locations in this order:

* per-project config file (`/path/to/my/project/.npmrc`)
* per-user config file (`~/.npmrc`)
* global config file (`$PREFIX/etc/npmrc`)
* npm builtin config file (`/path/to/npm/npmrc`)

See also [npmrc documentation](https://docs.npmjs.com/cli/v10/configuring-npm/npmrc).

### Listing the npm configuration

Use `npm config ls` to see the following information:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```ini
; "user" config from /Users/user/.npmrc
@bryntum:registry = "https://npm.bryntum.com"
//npm.bryntum.com/:_authToken = (protected)
; node bin location = /Users/user/.nvm/versions/node/v12.22.1/bin/node
; cwd = /Users/Shared/data/devel/bryntum-suite
; HOME = /Users/user
; Run <code>npm config ls -l</code> to show all defaults.
```

</div>
<div>

```ini
; "user" config from /Users/user/.npmrc
@bryntum:registry = "https://npm-us.bryntum.com"
//npm-us.bryntum.com/:_authToken = (protected)
; node bin location = /Users/user/.nvm/versions/node/v12.22.1/bin/node
; cwd = /Users/Shared/data/devel/bryntum-suite
; HOME = /Users/user
; Run <code>npm config ls -l</code> to show all defaults.
```
</div>
</div>

The first line shows that the `.npmrc` from the user's home directory will be used and we can also see that we
have configured the registry for `@bryntum` namespace and that we have logged-in because we have an authToken.

If we had `.npmrc` in the project directory, `/Users/Shared/data/devel/bryntum-suite` in this case,
then the output would look like:

<div class="docs-tabs" data-name="repository">
<div>
    <a>Europe location</a>
    <a>US location</a>
</div>
<div>

```ini
; "user" config from /Users/user/.npmrc
@bryntum:registry = "https://npm.bryntum.com"
//npm.bryntum.com/:_authToken = (protected)
; "project" config from /Users/Shared/data/devel/bryntum-suite/.npmrc
legacy-peer-deps = true
; node bin location = /Users/user/.nvm/versions/node/v12.22.1/bin/node
; cwd = /Users/Shared/data/devel/bryntum-suite
; HOME = /Users/user
; Run <code>npm config ls -l</code> to show all defaults.
```

</div>
<div>

```ini
; "user" config from /Users/user/.npmrc
@bryntum:registry = "https://npm-us.bryntum.com"
//npm-us.bryntum.com/:_authToken = (protected)
; "project" config from /Users/Shared/data/devel/bryntum-suite/.npmrc
legacy-peer-deps = true
; node bin location = /Users/user/.nvm/versions/node/v12.22.1/bin/node
; cwd = /Users/Shared/data/devel/bryntum-suite
; HOME = /Users/user
; Run <code>npm config ls -l</code> to show all defaults.
```
</div>
</div>

Both user and project configs are used at this time, `legacy-peer-deps` configured in the project directory
and repository and authToken used from the user home directory.


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>