export class REPL {
  constructor() {
    // empty
  }

  static getRuntimeInfo() {
    return {
      proc: process.versions
    };
  }
}
