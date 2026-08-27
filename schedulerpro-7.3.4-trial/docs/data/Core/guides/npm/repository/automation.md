﻿# Automation and integrations

## Access tokens for CI/CD

You may use [Access tokens](#Core/guides/npm/repository/private-repository-access.md#access-tokens) stored in `.npmrc` in 
Continuous Integration/Continuous Delivery (CI/CD) systems.

The automated CI/CD process will run `npm install` at some point. This command will execute in a project directory and
as a particular user. You can manually verify if the `.npmrc` file used by the process contains the `@bryntum`
repository configuration, and the correct authToken.

**`.npmrc` file should contain this code:**

```ini
@bryntum:registry="https://npm.bryntum.com"
//npm.bryntum.com/:_authToken=AUTH-TOKEN-VALUE
```

## Artifactory integration

To use Bryntum NPM registry as a remote repository please follow this instruction.

### Add Bryntum registry as a remote repository

In Artifactory admin console navigate to **Administration - Repositories** and click **Add repositories - Remote
repository**.

Check [Remote Repositories](https://www.jfrog.com/confluence/display/JFROG/Remote+Repositories) docs from Artifactory.

Configure the repository with:

| Parameter      | Value                                                                                                         |
|----------------|---------------------------------------------------------------------------------------------------------------|
| Package Type   | **npm**                                                                                                       |
| Repository Key | **bryntum** (or any other name you prefer)                                                                    |
| URL            | `https://npm.bryntum.com` or `https://npm-us.bryntum.com`                                                     |
| Username       | Username for [Bryntum repository authentication](#Core/guides/npm/repository/private-repository-access.md) |
| Password       | Password for [Bryntum repository authentication](#Core/guides/npm/repository/private-repository-access.md) |

### Setup credentials for `@bryntum` package access

After creating the remote repository, click the wrench icon (Set Me Up) in the line with the repository to get 
credentials for accessing the repository.

Create `.npmrc` file in the project's folder and add credentials there for `@bryntum` scope packages:

For example if you use JFrog Platform for hosting your Artifactory registry (e.g. `yourregistry.jfrog.io`) for
Artifactory with the username `user@example.com` then you will have similar config:

```shell
@bryntum:registry=https://yourregistry.jfrog.io/artifactory/api/npm/bryntum/
//yourregistry.jfrog.io/artifactory/api/npm/bryntum/:_password=<BASE64_PASSWORD>
//yourregistry.jfrog.io/artifactory/api/npm/bryntum/:username=user@example.com
//yourregistry.jfrog.io/artifactory/api/npm/bryntum/:email=user@example.com
//yourregistry.jfrog.io/artifactory/api/npm/bryntum/:always-auth=true
```

`<BASE64_PASSWORD>` will be generated for you in Artifactory console if you enter your credentials there.

After these actions you will be able to install `@bryntum\Core` package with your Artifactory login from `.npmrc`
file.

Later you may add `bryntum` Artifactory remote repository to any virtual repository to have access to several
repositories with the same Artifactory credentials.

Check [Virtual Repositories](https://www.jfrog.com/confluence/display/JFROG/Virtual+Repositories) docs from Artifactory.

## Offline packages

If you do not have an internet connection on your development computer, CI/CD system, or you want to use **@bryntum**
offline packages to build your application you may use the instructions below.

Install packages on a computer with access to the Bryntum repository. Installation will store all required packages
under the **node_modules/@bryntum** folder located in your application's root path.

Navigate to **each sub folder** inside the **node_modules/@bryntum** folder and run:

```shell
npm pack
```

This will create a **\*.tgz** file inside the folder where you ran the command. Files should be copied and stored in
version control to be used as local npm packages.

Please check documentation for the `npm pack` command [docs here](https://docs.npmjs.com/cli/v10/commands/npm-pack).

For example if you copied the **\*.tgz** files to the **lib/** folder inside your project's root alongside
with `package.json` you need to modify the `package.json` file to use offline packages as shown below.

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```json
"dependencies": {
  "@bryntum/core-lib-trial": "file:./lib/bryntum-core-lib-trial-1.0.1.tgz"  
  "@bryntum/core": "file:./lib/bryntum-core-trial-7.3.4.tgz"
}
```

</div>
<div>

```json
"dependencies": {
  "@bryntum/core-lib": "file:./lib/bryntum-core-lib-1.0.1.tgz"  
  "@bryntum/core": "file:./lib/bryntum-core-7.3.4.tgz"
}
```
</div>
</div>



<p class="last-modified">Last modified on 2026-07-22 10:45:56</p>