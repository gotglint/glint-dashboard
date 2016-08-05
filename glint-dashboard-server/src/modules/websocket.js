'use strict';

const Ravel = require('ravel');
const Module = Ravel.Module;
const inject = Ravel.inject;
const postlisten = Module.postlisten;

const sPrimus = Symbol('primus');

/**
 * Encapsulates websocket functionality
 */
@inject('primus', 'cookies')
class Websocket extends Module {
  constructor(Primus, Cookies) {
    super();
    this.Primus = Primus;
    this.Cookies = Cookies;
    this.formattedTypeRegex = /\[[A-Z]+\]/;
    this.unformattedTypeRegex = /[A-Z]+/;
    this.packageRegex = /\[([A-z0-9]+\.)+[A-z0-9]+\]/g;
    this.beforeTypeRegex = /^.*(?=\[[A-Z]+\])/;
    this.queue = [];
    this.timeout = null;
  }

  get primus() {
    return this[sPrimus];
  }

  /**
   * Retrieves a user session from redis using a sessionId.
   * @param {String} sessionId
   * @return {Promise} resolves with an object containing the sessionid and user session from redis, rejects otherwise
   */
  getSessionById(sessionId){
    return new Promise((resolve, reject) => {
      this.kvstore.get(`koa:sess:${sessionId}`, (err, result) => {
        if (err || !result) {
          reject(err);
        } else {
          resolve({
            id: sessionId,
            session: JSON.parse(result)
          });
        }
      });
    });
  }

  /**
   * Validates a user session using a req or a spark.
   * @param {Object} req a request or a spark (something with a .headers property)
   * @return {Promise} resolves with an object containing the sessionid and user session from redis, rejects otherwise
   */
  getSession(req) {
    // verify cookie signature and get session id
    const cookies = new this.Cookies(req, undefined, {
      keys: this.params.get('keygrip keys')
    });
    // lookup user in redis
    const sessionId = cookies.get('koa.sid');
    return this.getSessionById(sessionId);
  }

  /**
   * Store an updated session in redis
   */
  updateSession(sess) {
    return new Promise((resolve, reject) => {
      const key = `koa:sess:${sess.id}`;
      this.kvstore.ttl(key, (err, ttl) => {
        if (typeof ttl === 'number' && ttl > 0) {
          this.kvstore.setex(key, ttl, JSON.stringify(sess.session), (e) => {
            if (e) {reject(e);}
            resolve();
          });
        } else {
          this.kvstore.set(key, JSON.stringify(sess.session), (e) => {
            if (e) {reject(e);}
            resolve();
          });
        }
      });
    });
  }

  /**
   * Clean log messages before sending them out on a spark
   * @param  {String} message
   * @return {Array[String]} array of cleaned messages; breaks each line of a message to a different line
   */
  cleanMessage(message) {
    let lines = message.split('\n');
    lines = lines.map((line) => {
      line = line.replace('[USER]', '');
      if (!this.formattedTypeRegex.test(line)) {
        // does not have a defined type.  Look for one
        if (this.unformattedTypeRegex.test(line)) {
          // found unformatted type - add [] around
          line = line.replace(this.unformattedTypeRegex, '[$&]');
        }
      }
      // remove java packages
      line = line.replace(this.packageRegex, '');
      // trim everything before type
      return line.replace(this.beforeTypeRegex, '');
    });
    return lines;
  }

  sendQueue(spark) {
    clearTimeout(this.timeout);
    spark.write({
      type: 'progress',
      message: this.queue.join('\n')
    });
    this.queue = [];
  }

  /**
   * Write a message to a specific user
   * @param {String} sessionId the id of a spark
   * @param {String} type the type of the message
   * @param {Object | String} message the message to send to the specific user
   */
  sendMessageToUser(sessionId, type, message) {
    this.getSessionById(sessionId)
      .then((session) => {
        const sparkId = session.session.spark;
        const spark = this[sPrimus].spark(sparkId);
        if (spark) {
          if (type === 'progress') {
            this.cleanMessage(message).forEach((line) => {
              this.queue.push(line);
              if (this.queue.length >= this.params.get('websocket batch size')) {
                this.sendQueue(spark);
              } else {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(
                  () => {
                    this.sendQueue(spark);
                  },
                  this.params.get('websocket batch timeout')
                );
              }
            });
          } else {
            spark.write({
              type: type,
              message: message
            });
          }
        }
      });
  }

  /**
   * Write a message to all connected users
   * @param {String} type the type of the message
   * @param {Object | String} message the message to send to the specific user
   */
  sendMessageToAll(type, message) {
    if (this[sPrimus]) {
      this[sPrimus].write({
        type: type,
        message: message
      });
    }
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

    // TODO output client script somewhere for static serving

    // primus auth
    primus.authorize((req, done) => {
      this.getSession(req).then(() => done()).catch(done);
    });

    // store spark id in session upon (re)connection. We can use it
    // later to target messages at a specific client.
    primus.on('connection', (spark) => { //eslint-disable-line no-unused-vars
      this.getSession(spark).then((sess) => {
        sess.session.spark = spark.id;
        this.updateSession(sess).catch((err) => {
          this.log.error(`Unable to update user session ${sess.id} with spark id.`);
          this.log.error(err.stack);
        });
      });
    });
  }
}

module.exports = Websocket;
