const files = require('../../lib/utils/files');
const path = require('path');
const fs = require("fs");

describe("files.list",function(){
  var valid = ["02f03513839ac37ce95086b838b50fef.png"];
  var invalid = ["7ff46454d660a30a0190536d678a6ea6.png"];
  var mfiles = {
    validate:function(source,thumb){
      return new Promise(function(resolve, reject) {
        if(valid.indexOf(thumb.split("/").slice(-1)[0])!=-1){
          resolve(true);
        }else{
          resolve(false);
        }
      });
    },
    list:files.list
  }
  it("find invalid thumbnails",function(){
    const basePath = path.resolve(__dirname,"../fixtures/thumbnails/normal");
    return mfiles.list(basePath).then(function(files){
      expect(files).to.deep.equal(invalid.map(f=>path.resolve(basePath, f)));
    });
  })

  it("skip invalid dirs",function(){
    return mfiles.list(path.resolve(__dirname,"../fixtures/thumbnails/foo")).then(function(files){
      expect(files).to.deep.equal([]);
    });
  })
  it("invalid images are invalid thumbnails", function(){
    const basePath = path.resolve(__dirname,"../fixtures/thumbnails/large");
    return mfiles.list(basePath).then(function(files){
      expect(files).to.deep.equal([path.resolve(basePath, "foo.txt")])
    })
  })
});
