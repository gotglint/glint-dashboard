require("babel-polyfill");

require("babel-core/register")({
  ignore: false,
  only: /.+(?:(?:\.es6\.js)|(?:.es6))$/,
  extensions: ['.js', '.es6.js', '.es6' ],
  sourceMap: true
});

require("./server.es6");
