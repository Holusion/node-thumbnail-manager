var Thumbnailer = require("../lib");

describe("Thumbnailer",function(){
  it("create a thumbnail if it doesn't exists",function(done){
    var thumbnailer = new Thumbnailer(__dirname);
    thumbnailer.create = function(file,size){
      expect(file).to.equal(__dirname+"/common.js");
      expect(size).to.equal(128);
      done();
    }
    thumbnailer.request(__dirname+"/common.js",128).catch(done); //We're sure a thumbnail for this doesn't exists in this directory...
  });
  it("escape shell command",function(done){
    var thumbnailer = new Thumbnailer(__dirname);
    thumbnailer.worker.start = function(command){
      expect(command).to.equal('foo \\"my path\\"')
      done();
      return Promise.resolve("hello");
    }
    thumbnailer.finder.find = function(){
      return Promise.resolve("foo %i")
    }
    thumbnailer.create("my path",100).catch(done);
  });
});
