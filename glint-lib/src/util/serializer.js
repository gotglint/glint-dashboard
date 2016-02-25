// JSON serializer helpers
function convertFunctionToString(key, value) {
  if ('function' === typeof value) {
    return value.toString();
  }
  return value;
}

function convertStringToFunction(key, value) {
  if (!key) {
    return value;
  }

  if (typeof value === 'string') {
    const funcRegExp = /function[^\(]*\(([^\)]*)\)[^\{]*{([^\}]*)\}/;
    const match = value.match(funcRegExp);
    if (match) {
      var args = match[1]
        .split(',')
        .map((arg) => {
          return arg.replace(/\s+/, '');
        });
      return new Function(args, match[2]);
    }
  }

  return value;
}

export function stringify(object) {
  return JSON.stringify(object, convertFunctionToString);
}

export function parse(string) {
  if ('string' !== typeof string) {
    throw new Error('Deserialization requires a String value.');
  }

  return JSON.parse(string, convertStringToFunction);
}
