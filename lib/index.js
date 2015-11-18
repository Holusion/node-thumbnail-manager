const path = require("path")
  , Finder = require("xdg-apps")
  , Worker = require("./Worker")
  , xdg = require("xdg-basedir");

var files = require("./utils/files")
  , thumbDirs = require("./utils/thumbDirs");
function Thumbnailer (options){
  if(typeof options === "string"){
    //For backward compatibility
    options = {dir:options};
  }
  this.options = options||{};
  if(this.options.dir){
    this.dir = thumbDirs.create(this.options.dir);
  }else{
    this.dir = thumbDirs.create(path.join(xdg.cache,"thumbnails")); //xdg.cache is not an array, it's a string unlike other xdg dirs.
  }

  this.finder = new Finder("thumbnailer");
  this.worker = new Worker(this.options);
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
    if(/ENOENT/.test(e) || /OUTDATED/.test(e)){ //Internal errors
      return self.create(file,size);
    }else{
      throw e;
    }
  }).then(function(exist){
    if(!exist){
      return self.create(file,size);
    }else{
      return exist;
    }
  });
  if(callback && typeof callback === "function"){
    prom.then(function(res){
      process.nextTick(function(){callback(null,res)});
    }).catch(callback);
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
  if(!file || typeof file !== "string"){
    return Promise.reject(new TypeError("Thumbnailer.find : file parameter must be a string"));
  }
  return this.dir.then(function(dir){
    return files.exists(thumbDirs.get(dir,size),file);
  });
}

Thumbnailer.prototype.create = function(file,size){
  var self =this;
  var esc = "\""
  return this.dir.then(function(dir){
    var output = path.join(thumbDirs.get(dir,size),files.getHash(file));
    return self.finder.find(file).then(function(thumbnailer){
      if(!thumbnailer){
        throw new Error("no available thumbnailer for : "+file);
      }
      thumbnailer = thumbnailer.replace("%s",size);
      thumbnailer = thumbnailer.replace("%u",esc+files.getUri(file)+esc);
      thumbnailer = thumbnailer.replace("%i",esc+file+esc);
      thumbnailer = thumbnailer.replace("%o",esc+output+esc);
      //Correctly escape brackets

      return self.worker.start(thumbnailer).then(function(){
        return output;
      });
    });
  });
}

Thumbnailer.prototype.clean = function(options, callback){
  if(typeof options === "function"){
    callback = options;
    options = null;
  }
  options = options||this.options;
  if(typeof options.outdated === "undefined"){
    options.outdated = true;
  }
  return this.dir.then(function(dir){
    return Promise.all([path.join(dir,"normal"),path.join(dir,"large"),path.join(dir,"fail")].map(function(repo){
      return files.list(repo,options).then(function(invalidThumbnails){
        if(options.count){
          return invalidThumbnails.slice(0,count);
        }else{
          return invalidThumbnails;
        }
      }).catch(console.error).then(function(thumbs){
        return thumbs.map(function(thumb){
          return files.remove(thumb);
        });
      })
    })).then(function(result){
      process.nextTick(function(){callback()});
    }).catch(function(e){
      process.nextTick(function(){callback(e)});
    });
  })
}

module.exports = Thumbnailer;
