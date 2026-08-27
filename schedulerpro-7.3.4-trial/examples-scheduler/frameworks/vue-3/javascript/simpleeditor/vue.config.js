module.exports = {
    publicPath            : '',
    productionSourceMap   : false,
    transpileDependencies : ['@bryntum/schedulerpro'],
    configureWebpack      : {
        performance : {
            hints : false
        }
    }
};
