const hash = require('crypto');
const path = require('path');
const fs = require("fs");
const url = require("url");
const getThumbKeys = require("./getThumbKeys");
function getHash(input){
  var md5sum = hash.createHash('md5');
  md5sum.update(this.getUri(input));
  return md5sum.digest('hex')+".png";
}

/**
 * Will prepend file:// to the file name if necessary.
 * @param  {[type]} input [description]
 * @return {[type]}       [description]
 */
function getUri (input){
  var uri = url.parse(input);
  if(!uri.protocol){
    uri.protocol = "file";
  }else if(uri.protocol.indexOf("file") === 0 && uri.host && uri.host.indexOf("/")!== 0){ //Match protocols file and file:
    uri.host = path.resolve(process.env["PWD"],uri.host);
  }else{

  }
  uri.slashes = true;
  return url.format(uri);
}

//Check if a thumbnail exists in dir for this file. Return the thumbnail file for convenience if it's OK.
function exists(dir,file){
  var thumbfile = path.join(dir,this.getHash(file));
  return this.validate(file,thumbfile).then(function(result){
    return (result)?thumbfile:false;
  });
}

function getMtime(file){
  return new Promise(function(resolve, reject) {
    fs.stat(file,function(err,stats){
      if(err){
        reject(err);
      }else{
        resolve(stats.mtime);
      }
    });
  })
}

function validate(source,thumb,options){
  options = options||{outdated:true};
  return this.getMtime(source).then(function(origMtime){
    var sequence = [];
    if(options.outdated){
      sequence.push(new Promise(function(resolve, reject) {
        fs.readFile(thumb,function(err,data){
          if(err) return reject(err);
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
  }).catch(function(e){
    if(/ENOENT/.test(e)){ // fs.stat doesn't match e.code == 'ENOENT'
      return false;
    }else{
      throw e;
    }
  })
}

/* list invalid thumbnails in dir*/
function list(dir,options){
  var self = this;
  return new Promise(function(resolve, reject) {
    fs.readdir(dir,function(err,thumbs){
      if(err){
        if(err.code == "ENOENT"){
          return resolve([]);
        }
        return reject(err);
      }
      resolve(thumbs.map(function(thumb){
        return path.join(dir,thumb);
      }).map(function(thumb){
        return new Promise(function(res, rej) {
          fs.readFile(thumb,function(err,data){
            if(err && err.code == "EISDIR"){
              return rej(new Error(`can't read ${thumb} : is a directory`))
            }else if(err){
              return rej(err);
            }
            var source = getThumbKeys(data).uri;
            if(!source) return res(thumb);
            return self.validate(source,thumb).then(function(valid){
              return res((valid)? false : thumb);
            })
          });
        });
      }));
    });
  }).then(function(sequence){
    return Promise.all(sequence).then(function(files){
      return files.filter(function(file){return (file)?true:false})
    });
  })
}

function remove(file){
  new Promise(function(resolve, reject) {
    fs.unlink(file,function(err){
      if(err && err.code != "ENOENT"){
        reject(new Error(`Failed to remove ${file} : ${err.message}`));
      }else{
        resolve(true);
      }
    })
  });
}

module.exports = {
  getHash,
  getUri,
  exists,
  getMtime,
  validate,
  list,
  remove,
}
