const hash = require('crypto');
const path = require('path');
const fs = require("fs");
const url = require("url");

const getThumbMtime = require("./getThumbMtime");
module.exports = {
getHash : function(input){
  var md5sum = hash.createHash('md5');
  md5sum.update(this.getUri(input));
  return md5sum.digest('hex')+".png";
},

/**
 * Will prepend file:// to the file name if necessary.
 * @param  {[type]} input [description]
 * @return {[type]}       [description]
 */
getUri : function (input){
  var uri = url.parse(input);
  if(!uri.protocol){
    uri.protocol = "file";
  }else if(uri.protocol.indexOf("file") === 0 && uri.host && uri.host.indexOf("/")!== 0){ //Match protocols file and file:
    uri.host = path.resolve(process.env["PWD"],uri.host);
  }else{

  }
  uri.slashes = true;
  return url.format(uri);
},

exists : function(dir,file){
  var thumbfile = path.join(dir,this.getHash(file));
  return new Promise(function(resolve, reject) {
    //First check if orig's mtime is readable. If it's not, thumbnails should be re-created each time.
    fs.stat(file,function(err,stats){
      if(err) return reject(err);
      resolve(stats.mtime);
    });
  }).then(function(origMtime){
    return new Promise(function(resolve, reject) {
      //console.log("searching for hash in : ",thumbfile);
      fs.readFile(thumbfile,function(err,data){
        if(err) return reject("NOTFOUND"); //Don't fail, simply resolve on undefined
        var thumbTime = getThumbMtime(data)
        if(typeof thumbTime !== "undefined" && thumbTime.getTime() === origMtime.getTime()){
          resolve(thumbfile);
        }else{
          reject("OUTDATED");
        }
      });
    });
  });
}

}
