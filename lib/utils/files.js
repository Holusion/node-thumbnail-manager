'use strict';
const hash = require('crypto');
const path = require('path');
const fs = require("fs/promises");
const url = require("url");
const getThumbKeys = require("./getThumbKeys");




function getHash(input){
  var md5sum = hash.createHash('md5');
  md5sum.update(getUri(input));
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

/**
 * 
 * @param {string} dir the directory to be searched 
 * @param {string} file the source file 
 * @returns 
 */
async function exists(dir,file){
  var thumbfile = path.join(dir, getHash(file));
  let result = await validate(file,thumbfile);
  return (result)?thumbfile:false;
}

async function getMtime(file){
  return (await fs.stat(file)).mtime;
}

async function validate(source, thumb){
  try{
    const origMtime = await getMtime(source);
    const data = await fs.readFile(thumb);
    const thumbTime = getThumbKeys(data).mtime;
    return (typeof thumbTime !== "undefined" && Math.floor(thumbTime.getTime()/1000) === Math.floor(origMtime.getTime()/1000))?true: false;
  }catch(e){
    if(e.code == "ENOENT"){
      return false;
    }else{
      throw e;
    }
  }
}

/* list invalid thumbnails in dir*/
async function list(dir){
  let thumbs;
  try{
    thumbs = await fs.readdir(dir);
  }catch(e){
    if(e.code == "ENOENT"){
      return [];
    }
    throw e;
  }
  let invalid_thumbnails = await Promise.all(thumbs.map(thumb=> path.join(dir, thumb))
  .map(async thumb=>{
    let data, source;
    try{
      data = await fs.readFile(thumb);
    }catch(e) {
      if(e.code == "EISDIR"){
        throw new Error(`can't read ${thumb} : is a directory`);
      }else{
        throw e;
      }
    }
    try{
      source = getThumbKeys(data).uri;
    }catch(e){
      return thumb;
    }
    if(!source) return thumb;
    let valid = await validate(source, thumb);
    return valid?false:thumb;
  }));
  return invalid_thumbnails.filter(t=>t);
}


module.exports = {
  getHash,
  getUri,
  exists,
  getMtime,
  validate,
  list,
}
