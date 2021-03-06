const path = require('path');
const webpack = require('webpack');


var HtmlWebpackPlugin = require('html-webpack-plugin');
var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
    template: __dirname + '/src/static/index.html',
    filename: 'index.html',
    inject: 'body',
});

module.exports = {
    entry: {
        javascript: path.resolve(
            __dirname, 'src', 'static', 'js', 'app-client.jsx'),
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: [
                    {loader: "react-hot-loader"},
                    {
                        loader: "babel-loader",
                        query: { 
                            presets: ['es2015', 'react'],
                        },
                    }
                ],
            },
            {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(jpe?g|png|gif|svg|ttf|eot|woff2?)$/i,
                loader: "file-loader?name=[name].[ext]",
            },
        ],
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        HTMLWebpackPluginConfig,
    ],
};
