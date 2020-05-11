var MergeIncludePlugin = require('webpack-merge-and-include-globally');

function resolveChunk(chunk = '') {
    // 引用的是相对路径或绝对路径
    if (chunk.startsWith('.') || chunk.startsWith('/')) {
        return chunk;
    } 

    // 引用的是模块
    var pkg = require(chunk + '/package.json');
    var source = pkg.browser || pkg.module || pkg.main;
    
    if (source.startsWith('./')) {
        source = source.substring(2);
    } else if (!source.startsWith('/')) {
        source = '/' + source;
    }
    
    return 'node_modules/' + chunk + source;
}

function convertOptions(options) {
    var optionsResult;

    if (Array.isArray(options)) {
        optionsResult = options;
    } else if (typeof options === 'object') {
        optionsResult = [options];
    } else {
        optionsResult = [];
    }

    optionsResult = optionsResult.map((option = {}) => {
        var { filename, chunks = [] } = option;

        return {
            filename,
            chunks: typeof chunks === 'string' ? [chunks] : chunks
        };
    });

    return optionsResult;
}

function transformToMergeIncludePluginOptions(options) {
    var optionsResult = options.map((option) => {
        var { filename, chunks = [] } = option;

        return {
            src: chunks.map(chunk => resolveChunk(chunk)).filter(chunk => chunk),
            dest: filename  // TODO 加上字符串模板[hash][name][contenthash][chunkhash]
        };
    });

    return {
        files: optionsResult
        // TODO:支持更多参数
    };
}

function MyWebpackPlugin(options = [], htmlWebpackPlugin) {
    // TODO: validateOptions()
    this.options = convertOptions(options);
    this.htmlWebpackPlugin = htmlWebpackPlugin;
    this.mergeIncludePlugin = new MergeIncludePlugin(transformToMergeIncludePluginOptions(this.options));
}

MyWebpackPlugin.prototype.apply = function(compiler) {
    this.applyMergeIncludePlugin(compiler);
    
    compiler.hooks.afterPlugins.tap(MyWebpackPlugin.name, this.afterPlugins.bind(this));
};

MyWebpackPlugin.prototype.applyMergeIncludePlugin = function(compiler) {
    this.mergeIncludePlugin.apply(compiler);
};

MyWebpackPlugin.prototype.afterPlugins = function(compiler) {
    compiler.hooks.compilation.tap(MyWebpackPlugin.name, compilation => {
        var hook;
        
        if (this.htmlWebpackPlugin && this.htmlWebpackPlugin.getHooks) {
            // HtmlWebpackPlugin v4
            hook = this.htmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration;
        } else {
            // HtmlWebpackPlugin v3
            hook = compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration;     // Event: html-webpack-plugin-before-html-generation
        }

        hook.tapAsync(MyWebpackPlugin.name, this.includeAssets.bind(this));
    });
};

MyWebpackPlugin.prototype.includeAssets = function(data, cb) {
    var { js = [], css = [], publicPath = '' } = data.assets;
        
    try {
        this.options.forEach((option) => {
            var { filename } = option;
            var name = publicPath + filename;

            if (name.endsWith('.js')) {
                js.unshift(name);
            } else if (name.endsWith('.css')) {
                css.unshift(name);
            }
        });
        cb(null, data);
    } catch (error) {
        cb(error);
    }
};

module.exports = MyWebpackPlugin;