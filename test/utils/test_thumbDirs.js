var thumbDirs = require("../../lib/utils/thumbDirs");
var exec = require("child_process").exec;
var path = require("path");
var fs = require('fs');
describe("thumbDirs.create",function(){
  var tmp;
  before(function(done){
    exec("mktemp -d",{encoding:"utf8"},function(error, stdout, stderr){
      tmp = stdout.replace("\n","");
      done(error);
    });
  });
  after(function(done){
    exec("rm -rf "+tmp,{encoding:"utf8"},function(error, stdout, stderr){
      done(error);
    });
  });
  it("create base directories",function(done){
    thumbDirs.create(tmp).then(function(dir){
      expect(dir).to.equal(tmp);
      var dirs = ["normal","large","fail"].map(function(size){
        return path.join(dir,size);
      }).map(function(dirpath){
        return new Promise(function(resolve, reject) {
          fs.stat(dirpath,function(err,stat){
            expect(err).to.be.null;
            expect(stat.isDirectory()).to.be.true;
            resolve();
          });
        });
      })
      Promise.all(dirs).then(function(){
        done();
      }).catch(done);
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
