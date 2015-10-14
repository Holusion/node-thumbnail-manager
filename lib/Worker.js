const exec = require("child_process").exec;

function Worker (){

}

Worker.prototype.start = function(thumbnailer){
  return new Promise(function(resolve, reject) {
    exec(thumbnailer,function(err,stdout,stderr){
      if(err){
        reject(err);
      }else{
        resolve();
      }
    })
  });
}

module.exports = Worker;
