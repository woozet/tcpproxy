const Emitter = require('events').EventEmitter;

module.exports = Middleware;

let app = Middleware.prototype; 

function Middleware() {
    if (!(this instanceof Middleware)) return new Middleware;
    this.middleware = [];
}

Object.setPrototypeOf(Middleware.prototype, Emitter.prototype);

app.add = function(fn){
  this.middleware.push(fn);
  return this;
};

app.getCompositioned = function() {
    return this.middleware;
}