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
  return mtime;
}
