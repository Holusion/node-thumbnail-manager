const exec = require("child_process").exec;

function Worker (concurrency){
  this.concurrency = concurrency || 2;//2 should suit most.
  this.queue= [];
  this.count = 0;
  this.timeout = 5000; //in ms!
}

Worker.prototype.start = function(thumbnailer){
  var self = this;
  return new Promise(function(resolve, reject) {
    self.queue.push([thumbnailer,resolve,reject]);
    self.process(); //Call process which will check wether it should do anything.
  });
}

Worker.prototype.process = function(){
  var self = this;
  while(this.count < this.concurrency && this.queue.length > 0){
    this.count++;
    var item = this.queue.shift();
    this.exec(item[0],function(err,stdout,stderr){
      if(err){
        item[2](err);
      }else{
        item[1]();
      }
      self.count--;
      process.nextTick(function(){
        self.process();
      });
    });
  }

}
//Simple wrapper, easier testing
Worker.prototype.exec = function(line,callback){
  return exec(line, {timeout:this.timeout}, callback);
}
module.exports = Worker;
