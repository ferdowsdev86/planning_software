# Testing Bryntum Grid with Jest

Jest is an extensive JavaScript testing library that seamlessly integrates with frameworks like Node.js, React, and Angular, with minimal configurations, making it a popular choice with JavaScript developers. While Bryntum components ship with the Siesta testing tool, you may wish to extend your existing Jest testing setup to cover the Bryntum components in your application, too. 

In this guide, we will explore:

- Why Jest does not support testing Bryntum modules by default.
- How to configure Babel to transpile Bryntum components from ECMAScript to CommonJS to allow testing with Jest.
- How to write a basic Jest test for a Bryntum Grid component and make the necessary project configuration changes.

If you would like to follow along, clone the [Bryntum Grid starter repository](https://github.com/bryntum/bryntum-grid-jest-starter), which contains a basic React app with a Bryntum Grid component. The `complete-config` branch on the starter repo contains the complete configuration setup for testing the Bryntum Grid component with Jest.

## Prerequisites 

You can try out Bryntum components for free using our public Bryntum trial packages.
If you have a Bryntum license, please refer to our [Npm Repository Guide](https://bryntum.com/products/grid/docs/guide/Grid/npm-repository) to access the private Bryntum repository.

Install the Bryntum Grid component by following the guide [here](https://bryntum.com/products/grid/docs/guide/Grid/quick-start/react#install-bryntum-grid-packages). 

## Why Jest does not support testing Bryntum modules by default: ECMAScript vs. CommonJS

Bryntum components are packaged as ECMAScript Modules. Jest is usually used with CommonJS modules and currently has only experimental support for ECMAScript modules. This experimental support is disabled by default, and we won't use it in this guide. Instead, we'll configure Jest's existing functionality to work with ECMAScript modules. 

ECMAScript differs from CommonJS in key ways, including asynchronous module loading, support for dynamic imports, and syntax variation. Using Jest to test ECMAScript modules will return the error `SyntaxError: Unexpected token 'export'`, as ECMAScript uses the `import` and `export` keywords where CommonJS uses `require()` and `module.exports`. Since Jest expects CommonJS, it can't handle the ECMAScript syntax.

We can overcome these differences by transpiling the Bryntum modules from ECMAScript to CommonJS using Babel, an open-source JavaScript transcompiler. This will allow Jest to integrate with Bryntum and test Bryntum components like other CommonJS modules.  

## Exploring the starter app

If you have cloned the starter repository, you should have a basic Bryntum Grid React app ready to go. This app is built off Create React App with minor changes to configure the project to use a Bryntum Grid. We use Create React App instead of Vite as the former has better support for Jest, while Vite has [some limitations](https://jestjs.io/docs/getting-started#using-vite). 

To start the React app in development mode, install the project dependencies:

```sh
npm install
```

Now run: 

```sh
npm start
```

The development app will start at `http://localhost:3000`. 


## Writing a basic test

Let's write a basic test using Jest. This test will simply ensure that there is a Bryntum Grid component in the React app.

In the `src` directory, create a `SimpleGrid.test.tsx` file and add the following code to it: 

```tsx
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import SimpleGrid from './SimpleGrid';

test('Renders Simple Grid', () => {
    render(<SimpleGrid />);
    expect(screen.getByText(/Grid Title/i)).toBeInTheDocument();
});
```

To execute this test, run: 

```sh
npm test
```

You will get the following error: 

```

SyntaxError: Unexpected token 'export'

      1 | import React from 'react';
    > 2 | import {BryntumGrid} from "@bryntum/grid-react";
        | ^
      3 |
      4 | const SimpleGrid = () => {
      5 |

      at Runtime.createScriptFromCode (node_modules/react-scripts/node_modules/jest-runtime/build/index.js:1728:14)
      at Object.<anonymous> (src/SimpleGrid.tsx:2:1)
      at Object.<anonymous> (src/SimpleGrid.test.tsx:4:1)
```

This error occurs because we have not yet transpiled the Bryntum components to CommonJS, and Jest does not know what to do with the `import` and `export` keywords, which are not used in CommonJS. 

## Configuring Babel

We will use Babel to transpile the Bryntum component from ECMAScript to CommonJS. 

To customize the Babel configurations to override the defaults, add the `babel.config.json` file to the project's root directory: 

```json
{
  "presets": [
    [
      "@babel/preset-typescript",
      {
        "allowDeclareFields": true
      }
    ],
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current"
        }
      }
    ]
  ]
}
```

## Configuring Jest to use Babel

To configure Jest to use Babel, add a `jest.config.ts` file containing the following code to the project root directory: 

```ts
import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
    extensionsToTreatAsEsm : ['.ts'],
    moduleNameMapper       : {
        '^(\\.{1,2}/.*)\\.js$' : '$1'
    },
    preset                  : 'ts-jest/presets/js-with-ts',
    testEnvironment         : 'jsdom',
    transformIgnorePatterns : ['node_modules/(?!@bryntum/grid-react|dynamics-web-api|@bryntum/grid)'],
    setupFilesAfterEnv      : ['<rootDir>/setupTests.ts']
};

export default jestConfig;
```

Here's what this file does: 

- Defines `moduleNameMapper` to transform import paths to remove any `.js` extensions. ECMAScript modules support the `.js` extension when importing but CommonJS doesn't, so we need to remove these extensions in the transpiled code. The module mapper uses a regular expression to filter imports that are relative paths starting with `./` or `../` and ending with `.js`. 

- Specifies the test environment to be used in `testEnvironment: 'jsdom'`. 

- Uses `preset: 'ts-jest/presets/js-with-ts` to configure the [Jest Transformer](https://kulshekhar.github.io/ts-jest/docs/getting-started/presets/#the-presets) to transform TypeScript and JavaScript files (`.ts`, `.tsx`, `.js`, `.jsx`) to CommonJS syntax. 

- Overrides the default Jest ignore behavior with `transformIgnorePatterns`. By default, Jest ignores all files in `node_modules` when transforming, as those modules are usually ready to run and need no further transpiling. However, since we need to transform the Bryntum modules specifically, we need to override the exemption using this parameter to specify the Bryntum modules in use. 

- Specifies the setup file `setupTests.ts` to run before any tests are run. We'll add this file in the next step and use it to configure browser mocking methods.

### Adding the global Jest setup file

When testing frontend code with Node, there may be instances where the lack of a browser raises issues. 

Two potential issues that may arise from the browser being unavailable are [`Error: Not implemented: window.computedStyle(elt, pseudoElt)`](https://github.com/jsdom/jsdom/issues/3025) and [`TypeError: window.matchMedia is not a function`](https://stackoverflow.com/questions/39830580/jest-test-fails-typeerror-window-matchmedia-is-not-a-function). 

These and other similar errors can be resolved by mocking the browser methods. We will use the `setupTests.ts` file to mock the browser.

Create the `setupTests.ts` file in the root directory of the project and copy the following code to it: 

```ts
// jest-dom adds custom jest matchers for asserting on DOM nodes.  
// allows you to do things like:  
// expect(element).toHaveTextContent(/react/i)  
// learn more: https://github.com/testing-library/jest-dom  
import '@testing-library/jest-dom/jest-globals';
import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
    writable : true,
    value    : jest.fn().mockImplementation(query => ({
        matches             : false,
        media               : query,
        onchange            : null,
        addListener         : jest.fn(), // Deprecated
        removeListener      : jest.fn(), // Deprecated
        addEventListener    : jest.fn(),
        removeEventListener : jest.fn(),
        dispatchEvent       : jest.fn()
    }))
});

// store the original function
const originalGetComputedStyle = window.getComputedStyle;

// mock the function
Object.defineProperty(window, 'getComputedStyle', {
    writable : true,
    value    : jest.fn((elt, pseudoElt) => {
        return originalGetComputedStyle(elt);
    })
});
```

## Switching the target module type

We need to change the target module type in the `tsconfig.json` file to CommonJS from the current ESCAScript. 

Navigate to the `tsconfig.json` file and make the following changes: 

- In `compilerOptions`, change the `target` parameter to `"es2022"`. 
- In the `lib` array, remove the line `"esnext"`. 
- In `compilerOptions`, change the `module` parameter to `"commonjs"`.

Your changed `tsconfig.json` file should look similar to the following:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": [
      "dom",
      "dom.iterable",
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

## Updating `package.json`

The last change we need to make is to update `package.json` to include the new dependencies we need. 

First, in `devDependencies`, remove the `"@types/react-dom"` line. This dependency is not needed as we will replace it with another. 

In `devDependencies`, add the following lines: 

```json
"jsdom": "^24.0.0",
"typescript": "^4.9.5",
"jest-environment-jsdom": "^29.7.0",
"ts-jest": "^29.1.3",
"ts-node": "^10.9.2",
"jest":"^29.7.0"
```

These are the new dependencies we need. 

Finally, in `scripts`, add the line: 

```json
"jest": "jest"
```

We add this because the version of Jest `npm test` tries to run doesn't support the functionality we need. Therefore, to run tests with Jest after making all the changes, we will run `npm run jest`. You can also use the Jest plugins or extensions that are available for most IDEs. 

## Running the test

After we've made all of these changes, let's rerun the install and test commands: 

```sh
npm install
npm run jest
```

And our test passes successfully! 

```

 PASS src/SimpleGrid.test.tsx (33.36 s)
  √ Renders Simple Grid (2187 ms)
                    
Test Suites: 1 passed, 1 total 
Tests:       1 passed, 1 total 
```

## Resources

* [Jest](https://jestjs.io)
* [Testing Library](https://testing-library.com)



<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>