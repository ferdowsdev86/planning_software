// gulpfile.js
const build = require('@microsoft/sp-build-web');
const path = require('path');

build.addSuppression(`Warning - [sass] The local CSS class 'ms-Grid' is not camelCase and will not be type-safe.`);

// Fix 'serve' bug on SPFx 1.18 and later
var getTasks = build.rig.getTasks;
build.rig.getTasks = function() {
    var result = getTasks.call(build.rig);
    result.set('serve', result.get('serve-deprecated'));
    return result;
};

build.configureWebpack.mergeConfig({
    additionalConfiguration : (generatedConfiguration) => {
        // Add Babel loader rule for Bryntum’s code to transpile
        generatedConfiguration.module.rules.push({
            test    : /\.js$/,
            // Only transpile the relevant Bryntum lib files
            include : /node_modules[\\/]+@bryntum[\\/]+\w+-thin[\\/]+lib/,
            use     : {
                loader  : 'babel-loader',
                options : {
                    presets : [
                        [
                            '@babel/preset-env',
                            {
                                targets : {
                                    chrome : '71'
                                }
                            }
                        ]
                    ]
                }
            }
        });

        // Ensure Bryntum paths are resolved properly (for CSS references, etc.)
        generatedConfiguration.resolve.alias = {
            ...generatedConfiguration.resolve.alias,
            './@bryntum' : path.resolve(__dirname, './node_modules/@bryntum')
        };

        return generatedConfiguration;
    }
});

build.initialize(require('gulp'));
