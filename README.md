# include-assets-html-webpack-plugin
Include extra file into HtmlWebpackPlugin template.

## Install
```
npm i -D include-assets-html-webpack-plugin
```

## Usage
```
var IncludeAssetsHtmlWebpackPlugin = require('include-assets-html-webpack-plugin');

...
plugins: [
  new HtmlWebpackPlugin(),
  new IncludeAssetsHtmlWebpackPlugin([{
      filename: '/js/systemjs1.js',
      chunks: ['systemjs']
  }, {
      filename: '/js/systemjs2.js',
      chunks: ['./node_modules/systemjs/dist/system.js']
  }])
]
```

## API

## License
MIT
