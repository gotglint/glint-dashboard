'use strict';

const Ravel = require('ravel');
const Module = Ravel.Module;
const inject = Ravel.inject;
const postlisten = Module.postlisten;

const JSONfn = require('jsonfn').JSONfn;

const GlintClient = require('@gotglint/glint-client').GlintClient;

const sPrimus = Symbol('primus');

/**
 * Encapsulates websocket functionality
 */
@inject('primus')
class Websocket extends Module {
  constructor(Primus) {
    super();
    this.Primus = Primus;
  }

  get primus() {
    return this[sPrimus];
  }

  /**
   * Initialize Primus server
   */
  @postlisten
  init() {
    const primus = new this.Primus(this.app.server, {
      transformer: 'websockets',
      parser: 'json'
    });

    this[sPrimus] = primus;

    primus.on('connection', (spark) => {
      spark.on('data', (data) => {
        const deserialized = JSONfn.parse(data);
        this.log.debug('WS server received a message: ', deserialized);

        const blob = deserialized.message.blob;
        this.log.debug('WS server received a blob: ', blob);

        const glintClient = new GlintClient('localhost', 45468);
        glintClient.init().then(() => {
          eval(blob);  // eslint-disable-line no-eval

          glintClient.run();

          const parent = this;

          glintClient.waitForJob().then(function(result) {
            parent.log.debug('Job result: ', result);
            spark.write(JSONfn.stringify({type: 'result', result: result}));
          }).catch((err) => {
            this.log.error('Error while waiting for job: ', err);
          });
        });
      });
    });
  }
}

module.exports = Websocket;
