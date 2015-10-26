const path = require('path');
const mkdir = require('mkdirp');
module.exports.get = function(dir,size){

  if(size >128){
    return path.join(dir,"large");
  }else{
    return path.join(dir,"normal");
  }
}

module.exports.create = function(dir){
  return Promise.all([path.join(dir,"normal"),path.join(dir,"large"),path.join(dir,"fail")].map(function(dir){
    return new Promise(function(resolve, reject) {
      //make a promise for a directory
      mkdir(dir, function (err) {
        if(err){
          reject(err);
        }else{
          resolve();
        }
      });
    });
  })).then(function(dirs){
    return dir;
  });

}
