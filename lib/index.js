'use strict';
const fs = require("fs/promises");
const path = require("path")
  , Finder = require("xdg-apps")
  , Worker = require("./Worker")
  , xdg = require("xdg-basedir");

const files = require("./utils/files")
  , thumbDirs = require("./utils/thumbDirs");

const esc = "\"";

class Thumbnailer{
  constructor ({dir=path.join(xdg.cache,"thumbnails"), threads, timeout}){
    this.dirP = thumbDirs.create(dir);
    this.finder = new Finder("thumbnailer");
    this.worker = new Worker({threads, timeout});
  }
  /**
   * Request a thumbnail file.
   * @param  {string}   file     absolute path to the file
   * @param  {number}   [size]     *optionnal* desired thumbnail size. Default : 128
   * @return {Promise<string>} absolute path to the thumbnail file
   */
  async request(file, size=128){
    let thumb = false;
    try{
      thumb = await this.find(file, size);
    }catch(e){
      if(e.code != "ENOENT"){
        throw e;
      }
    }
    if(!thumb){
      thumb = await this.create(file,size);
    }
    return thumb;
  }
  /**
   * 
   * @param {string} file 
   * @param {number} size 
   */
  async find(file, size){
    if(!file || typeof file !== "string"){
      return Promise.reject(new TypeError("Thumbnailer.find : file parameter must be a string"));
    }
    const dir = await this.dirP;
    return await files.exists(thumbDirs.get(dir,size),file);
  }
  async create(file, size){
    const dir = await this.dirP;
    var output = path.join(thumbDirs.get(dir,size),files.getHash(file));
    let thumbnailer =  await this.finder.find(file)
    if(!thumbnailer){
      throw new Error("no available thumbnailer for : "+file);
    }
    thumbnailer = thumbnailer.replace("%s",size);
    thumbnailer = thumbnailer.replace("%u",esc+files.getUri(file)+esc);
    thumbnailer = thumbnailer.replace("%i",esc+file+esc);
    thumbnailer = thumbnailer.replace("%o",esc+output+esc);
    //Correctly escape brackets

    await this.worker.start(thumbnailer)
    return output;
  }
  /**
   * 
   * @param {object} param0
   * @param {number} [param0.clean=0] use a number >0 to limit max number of cleaned thumbnails 
   * @returns 
   */
  async clean({count=0}={}){
    const dir = await this.dirP;
    return await Promise.all([path.join(dir,"normal"),path.join(dir,"large")].map(async (repo)=>{
      let invalidThumbnails;
      try{
        invalidThumbnails = await files.list(repo)
      }catch(e){
        throw new Error("Thumbnails invalidation failed : "+e.message);
      }
      if(count){
        invalidThumbnails = invalidThumbnails.slice(0,count);
      }
      await Promise.all(invalidThumbnails.map((thumb)=>{
        console.log("Clean : ", thumb);
        return fs.rm(thumb)
      }));
    }));
  }
}

module.exports = Thumbnailer;
