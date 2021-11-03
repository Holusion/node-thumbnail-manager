const path = require('path');
const fs = require("fs/promises");

module.exports.get = function(dir,size){

  if(size >128){
    return path.join(dir,"large");
  }else{
    return path.join(dir,"normal");
  }
}

module.exports.create = async function(dir){
  await Promise.all([
    path.join(dir,"normal"),
    path.join(dir,"large"),
    path.join(dir,"fail")
  ].map(async d => {
    await fs.mkdir(d, {recursive: true});
  }));
  return dir;
}
