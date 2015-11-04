const files = require('../../lib/utils/files');
const path = require('path');
const fs = require("fs");

describe("files.list",function(){
  var valid = [path.resolve(__dirname,"../fixtures/thumbnails/normal","02f03513839ac37ce95086b838b50fef.png")];
  var invalid = [path.resolve(__dirname,"../fixtures/thumbnails/normal","7ff46454d660a30a0190536d678a6ea6.png")];
  it("find invalid thumbnails",function(done){
    var mfiles = {
      validate:function(source,thumb){
        return new Promise(function(resolve, reject) {
          if(valid.indexOf(thumb)!=-1){
            resolve(true);
          }else{
            resolve(false);
          }
        });
      },
      list:files.list
    }
    mfiles.list(path.resolve(__dirname,"../fixtures/thumbnails/normal")).then(function(files){
      expect(files).to.deep.equal(valid);
      done();
    }).catch(done);
  })
  it("skip invalid dirs",function(done){
    var mfiles = {
      list:files.list
    }
    mfiles.list(path.resolve(__dirname,"../fixtures/thumbnails/foo")).then(function(files){
      expect(files).to.deep.equal([]);
      done();
    }).catch(done);
  })
});
