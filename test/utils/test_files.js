var files = require('../../lib/utils/files');
var path = require('path');
var fs = require("fs");
describe("files",function(){
  describe("getUri",function(){
    it("correct file URI",function(){
      expect(files.getUri("file:///test/file")).to.equal("file:///test/file");
    })
    it("absolute file",function(){
      expect(files.getUri("/test/file")).to.equal("file:///test/file");
    })
    it("relative file",function(){
      var pwd = process.env["PWD"];
      process.env["PWD"] = "/";
      expect(files.getUri("file://test/file")).to.equal("file:///test/file");
      process.env["PWD"] = pwd;
    });
    it("Other protocol URI",function(){
      expect(files.getUri("http://test/file")).to.equal("http://test/file");
    });
  });
  describe("getHash",function(){
    it("calculate md5sum for filePath",function(){
      expect(files.getHash("file:///test/file")).to.equal("84a11e3dfc895b1e9c2c478dfda573f1.png");
    })
  });
  describe("exists",function(){
    var testfile =__dirname+"/../fixtures/sources/wallpaper.svg"
    var thumbpath =__dirname+"/../fixtures/thumbnails/normal";
    before(function(done){
      fs.utimes(testfile,NaN,1418500379,done); //set mtime to Sat Dec 13 2014 20:52:59 GMT+0100 (CET)
    });
    it("returns thumbnail full path",function(done){
      var mfiles = files;
      mfiles.getHash = function(){
        return "02f03513839ac37ce95086b838b50fef.png";
      }
      mfiles.exists(thumbpath,testfile).then(function(hash){
        expect(hash).to.equal(path.resolve(thumbpath,"02f03513839ac37ce95086b838b50fef.png"));
        done();
      }).catch(done);
    })
  });
  describe("list",function(){
    var valid = [path.resolve(__dirname,"../fixtures/thumbnails/normal","02f03513839ac37ce95086b838b50fef.png")];
    var invalid = [path.resolve(__dirname,"../fixtures/thumbnails/normal","7ff46454d660a30a0190536d678a6ea6.png")];
    it("invalid thumbnails",function(done){
      var mfiles = files;
      mfiles.validate = function(source,thumb){
        return new Promise(function(resolve, reject) {
          if(valid.indexOf(thumb)!=-1){
            resolve(true);
          }else{
            resolve(false);
          }
        });
      }
      mfiles.list(path.resolve(__dirname,"../fixtures/thumbnails/normal")).then(function(files){
        expect(files).to.deep.equal(valid);
        done();
      }).catch(done);
    })
  });
})
