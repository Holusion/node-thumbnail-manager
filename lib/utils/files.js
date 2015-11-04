const hash = require('crypto');
const path = require('path');
const fs = require("fs");
const url = require("url");

const getThumbKeys = require("./getThumbKeys");
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
//Check if a thumbnail exists in dir for this file.
exists : function(dir,file){
  var thumbfile = path.join(dir,this.getHash(file));
  return this.validate(file,thumbfile).then(function(){
    return thumbfile;
  });
},
getMtime:function(file){
  return new Promise(function(resolve, reject) {
    fs.stat(file,function(err,stats){
      if(err) return reject(err);
      resolve(stats.mtime);
    });
  })
},
validate : function(source,thumb,options){
  options = options||{outdated:true};
  return this.getMtime(source).then(function(origMtime){
    var sequence = [];
    if(options.outdated){
      sequence.push(new Promise(function(resolve, reject) {
        fs.readFile(thumb,function(err,data){
          if(err) return reject("NOTFOUND");
          var thumbTime = getThumbKeys(data).mtime
          if(typeof thumbTime !== "undefined" && thumbTime.getTime() === origMtime.getTime()){
            resolve(true);
          }else{
            resolve(false);
          }
        });
      }));
    }
    return Promise.all(sequence).then(function(results){
      return results.reduce(function(result,add){
        return result && add;
      },true)
    });
  });
},
list : function(dir,options){
  var self = this;
  return new Promise(function(resolve, reject) {
    fs.readdir(dir,function(err,files){
      if(err){
        if(/ENOENT/.test(err)){
          return resolve([]);
        }
        return reject(err);
      }
      resolve(files.map(function(file){
        return path.join(dir,file);
      }).map(function(file){
        return new Promise(function(res, rej) {
          fs.readFile(file,function(err,data){
            if(err) return rej("NOTFOUND");
            var source = getThumbKeys(data).uri;
            return self.validate(source,file).then(function(valid){
              return res((valid)?file:false);
            }).catch(function(e){
              return res(false); //Always invalidate thumb file on error
            })
          });
        });
      }));
    });
  }).then(function(sequence){
    return Promise.all(sequence).then(function(files){
      return files.filter(function(file){return file})
    });
  })
},
remove: function(file){
  new Promise(function(resolve, reject) {
    fs.unlink(file,function(err){
      if(err){
        reject(err);
      }else{
        resolve(true);
      }
    })
  });
}
}
