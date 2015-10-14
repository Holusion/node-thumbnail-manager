const path = require('path');

module.exports = function(dir,size){

  if(size >128){
    return path.join(dir,"large");
  }else{
    return path.join(dir,"normal");
  }
}
