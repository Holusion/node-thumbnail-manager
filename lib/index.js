const path = require("path")
  , Finder = require("xdg-apps")
  , Worker = require("./Worker")
  , xdg = require("xdg-basedir");

var files = require("./utils/files")
  , thumbDirs = require("./utils/thumbDirs");
function Thumbnailer (basedir){
  if(basedir){
    this.dir = basedir;
  }else{
    this.dir = path.join(xdg.cache,"thumbnails"); //xdg.cache is not an array, it's a string unlike other xdg dirs.
  }
  this.finder = new Finder("thumbnailer");
  this.worker = new Worker();
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
  var self = this;
  if(!callback && typeof size === "function"){
    callback = size;
    size = 128;
  }
  var prom = this.find(file,size).catch(function(e){
    if(e === "NOTFOUND" || e === "OUTDATED"){ //Internal errors
      return self.create(file,size);
    }else{
      throw e;
    }
  });
  if(callback && typeof callback === "function"){
    prom.then(function(res){callback(null,res)})
    .catch(function(e){
      callback(new Error(e));
    });
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
  var self =this;
  var output = path.join(thumbDirs(this.dir,size),files.getHash(file));
  return this.finder.find(file).then(function(thumbnailer){
    thumbnailer = thumbnailer.replace("%s",size);
    thumbnailer = thumbnailer.replace("%u",files.getUri(file));
    thumbnailer = thumbnailer.replace("%i",file);
    thumbnailer = thumbnailer.replace("%o",output);
    console.log("creating thumbnail : ",thumbnailer);
    return self.worker.start(thumbnailer).then(function(){
      return output;
    });
  });
}

module.exports = Thumbnailer;
