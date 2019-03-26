var Thumbnailer = require("../lib");
var tmp = require("tmp-promise");
describe("Thumbnailer",function(){
  var dir;
  before(async function(){
    dir = await tmp.dir({unsafeCleanup:true});
  });
  after(function(){
    dir.cleanup();
  })

  it("create a thumbnail if it doesn't exists",function(){
    var thumbnailer = new Thumbnailer(dir.path);
    thumbnailer.create = function(file,size){
      expect(file).to.equal(__dirname+"/common.js");
      expect(size).to.equal(128);
    }
    return expect(thumbnailer.request(__dirname+"/common.js",128)).to.eventually.be.fulfilled; //We're sure a thumbnail for this doesn't exists in this directory...
  });
  it("escape shell command",function(done){
    var thumbnailer = new Thumbnailer(dir);
    thumbnailer.worker.start = function(command){
      expect(command).to.equal('foo "my path"')
      done();
      return Promise.resolve("hello");
    }
    thumbnailer.finder.find = function(){
      return Promise.resolve("foo %i")
    }
    thumbnailer.create("my path",100).catch(done);
  });
});
