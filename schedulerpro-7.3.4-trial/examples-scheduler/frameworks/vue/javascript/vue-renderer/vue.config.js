module.exports = {
    publicPath            : '',
    productionSourceMap   : false,
    transpileDependencies : [
        '@bryntum/schedulerpro',
        '@bryntum/schedulerpro-vue'
    ],
    configureWebpack : {
        performance : {
            hints : false
        }
    }
};
