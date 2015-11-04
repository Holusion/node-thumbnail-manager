const files = require('../../lib/utils/files');
const path = require('path');
const fs = require("fs");
describe("files.exists",function(){
  var testfile =__dirname+"/../fixtures/sources/wallpaper.svg"
  var thumbpath =__dirname+"/../fixtures/thumbnails/normal";
  before(function(done){
    fs.utimes(testfile,NaN,1418500379,done); //set mtime to Sat Dec 13 2014 20:52:59 GMT+0100 (CET)
  });
  it("returns thumbnail full path",function(done){
    var mfiles = {
      getHash:function(){
        return "02f03513839ac37ce95086b838b50fef.png";
      },
      exists: files.exists,
      validate:function(){
        return Promise.resolve(true);
      }
    }
    mfiles.exists(thumbpath,testfile).then(function(hash){
      expect(hash).to.equal(path.resolve(thumbpath,"02f03513839ac37ce95086b838b50fef.png"));
      done();
    }).catch(done);
  })
});
