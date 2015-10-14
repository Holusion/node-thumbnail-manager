const Finder = require("xdg-apps")
  , xdg = require("xdg-basedir");

var files = require("./utils/files")
  , thumbDirs = require("./utils/thumbDirs");
function Thumbnailer (basedir){
  if(basedir){
    this.dir = basedir;
  }else{
    this.dir = path.join(xdg.cache[0],"thumbnails");
  }
}
/**
 * Request a thumbnail file.
 * @param  {string}   file     absolute path to the file
 * @param  {number}   size     *optionnal* desired thumbnail size. Default : 128
 * @param  {Function} callback (err,file) *optionnal*
 *                             		err: errors if the file doesn't exists or if thumbnail creation failed
 *                             		file: output path
 * @return undefined if callback is a function. a new Promise if not.
 */
Thumbnailer.prototype.request = function(file,size,callback){
  if(!callback && typeof size === "function"){
    callback = size;
    size = 128;
  }
  var prom = this.find(file,size).catch(function(e){
    if(e === "NOTFOUND" || e === "OUTDATED"){ //Internal errors
      return this.create(file,size);
    }else{
      throw e;
    }
  });
  if(callback && typeof callback === "function"){
    prom.then(function(res){callback(null,res)})
    .catch(callback);
  }else{
    return prom;
  }
}

/**
 * [function description]
 * @param  {[type]} file [description]
 * @param  {[type]} size [description]
 * @return {[type]}      [description]
 */
Thumbnailer.prototype.find = function(file,size){
  return files.exists(thumbDirs(this.dir,size),file)

}

Thumbnailer.prototype.create = function(file,size){
  console.log("creating thumb for : ",file)

}

module.exports = Thumbnailer;
