var thumbDirs = require("../../lib/utils/thumbDirs");
var path = require("path");
var fs = require('fs');
var tmp = require("tmp-promise");
describe("thumbDirs.create",function(){
  var dir;
  before(async function(){
    dir = await tmp.dir({unsafeCleanup:true});
  });
  after(function(){
    dir.cleanup();
  })
  it("create base directories",function(done){
    thumbDirs.create(dir.path).then(function(created_dir){
      expect(created_dir).to.equal(dir.path);
      var dirs = ["normal","large","fail"].map(function(size){
        return path.join(dir.path,size);
      }).map(function(dirpath){
        return new Promise(function(resolve, reject) {
          fs.stat(dirpath,function(err,stat){
            expect(err).to.be.null;
            expect(stat.isDirectory()).to.be.true;
            resolve();
          });
        });
      });
      return Promise.all(dirs)
    }).then(function(){
      done();
    }).catch(done);
  });
});

describe("thumbDirs.get",function(){
  it("prioritize normal thumbnails when size < 128",function(){
    expect(thumbDirs.get("/dir",120)).to.deep.equal("/dir/normal");
  })
  it("prioritize normal thumbnails when size = 128",function(){
    expect(thumbDirs.get("/dir",128)).to.deep.equal("/dir/normal");
  });
  it("prioritize large thumbnails when size > 128",function(){
    expect(thumbDirs.get("/dir",129)).to.equal("/dir/large");
  });
  it("default to size = 128",function(){
    expect(thumbDirs.get("/dir")).to.deep.equal("/dir/normal");
  });
})
