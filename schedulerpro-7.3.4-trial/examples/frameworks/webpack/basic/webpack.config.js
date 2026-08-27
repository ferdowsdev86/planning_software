const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode   : 'production', // Use 'development' for easier debugging during development
    entry  : './src/index.js',
    output : {
        path     : path.resolve(__dirname, 'dist'),
        filename : 'bundle.[contenthash].js',
        clean    : true  // Cleans the output directory before each build
    },
    optimization : {
        // Use chunk splitting
        splitChunks : {
            chunks : 'all'
        }
    },
    performance : {
        hints : false  // Disable bundle size warnings
    },
    module : {
        rules : [
            {
                test    : /\.js$/,
                exclude : /node_modules/,
                use     : {
                    loader  : 'babel-loader',
                    options : {
                        presets : [
                            [
                                '@babel/preset-env',
                                {
                                    targets : {
                                        chrome : 100
                                    }
                                }
                            ]
                        ]
                    }
                }
            },
            {
                test : /\.s?css$/i,
                use  : [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader  : 'sass-loader',
                        options : {
                            sassOptions : {
                                silenceDeprecations : [
                                    'import',           // Silence 'import' deprecation warnings
                                    'global-builtin',   // Silence 'global-builtin' deprecation warnings
                                    'color-functions',  // Silence 'color-functions' deprecation warnings
                                    'legacy-js-api'     // Silence 'legacy-js-api' deprecation warnings
                                ]
                            }
                        }
                    }
                ]
            },
            {
                test : /\.(eot|woff|woff2|ttf|svg|png|jpg)$/,
                type : 'asset/resource'
            }
        ]
    },
    plugins : [
        // Output separate CSS files with contenthash for cache busting
        new MiniCssExtractPlugin({
            filename : '[name].[contenthash].css'
        }),
        // Plugin for processing html template. It automatically injects built bundles to body
        new HtmlWebpackPlugin({
            template : './src/index.html', // Use your own template file.
            inject   : true // Ensure script tags are injected into the index page
        }),
        // Plugin to copy data to production folder
        new CopyWebpackPlugin({
            patterns : [
                { from : 'src/data/data.json', to : 'data/data.json' }
            ]
        })
    ],
    resolve : {
        alias : {
            // Path to Bryntum component sources
            '@bryntum' : path.resolve(__dirname, '../../../..'),
            fonts      : path.resolve(__dirname, '../../../../build/fonts')
        }
    },
    devServer : {
        static : path.resolve(__dirname, 'dist'),
        port   : 8080,
        hot    : true // Enables Hot Module Replacement,
    }
};
