const extract = require('png-chunks-extract');
const decode = require('png-chunk-text').decode;

module.exports = function(data){
  var keys = {},found = 0;
  extract(data).filter(function (chunk) {
    return chunk.name === 'tEXt'
  }).map(function (chunk) {
    return decode(chunk.data)
  }).some(function(text){ //Object with keyword & text properties
    if(text.keyword === "Thumb::MTime"){
      keys.mtime = text.text;
      found++;
      return found >= 2;
    }else if(text.keyword === "Thumb::URI"){
      keys.uri = text.text;
      found++;
      return found >= 2;
    }else{
      return false;
    }
  });
  //Some programs store the mtime key as a unix timestamp.
  if(keys.mtime && parseInt(keys.mtime,10) !== NaN && keys.mtime < 100000000000){
    //Linux timestamps are in seconds. node's are in milliseconds. Reference is Sat Mar 03 1973, just to be sure.
    keys.mtime = parseInt(keys.mtime,10)*1000;
  }
  if(keys.mtime){
    keys.mtime = new Date(keys.mtime);
  }
  return keys;
}
