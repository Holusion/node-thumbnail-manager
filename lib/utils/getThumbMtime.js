const extract = require('png-chunks-extract');
const decode = require('png-chunk-text').decode;

module.exports = function(data){
  var mtime;
  extract(data).filter(function (chunk) {
    return chunk.name === 'tEXt'
  }).map(function (chunk) {
    return decode(chunk.data)
  }).some(function(text){ //Object with keyword & text properties
    if(text.keyword === "Thumb::MTime"){
      mtime = text.text;
      return true;
    }else{
      return false;
    }
  });
  //Some programs store the mtime key as a unix timestamp.
  if(mtime && parseInt(mtime,10) !== NaN && mtime < 100000000000){
    //Linux timestamps are in seconds. node's are in milliseconds. Reference is Sat Mar 03 1973, just to be sure.
    mtime = parseInt(mtime,10)*1000;
  }
  if(mtime){
    return new Date(mtime);
  }else{
    return;
  }

}
