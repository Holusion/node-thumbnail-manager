var Thumbnailer = require("../lib");
var tmp = require("tmp");
var fs = require("fs");
var path = require("path");

describe("Thumbnailer.clean",function(){
  var thumbnailer,dir;
  before(function(done){
    tmp.dir(function(err,dirpath){
      dir = dirpath;
      expect(err).to.be.null;
      fs.mkdir(path.join(dir,"normal"),function(err){
        expect(err).to.be.null;
        fs.link(path.join(__dirname,"fixtures/thumbnails/normal/02f03513839ac37ce95086b838b50fef.png"),path.join(dir,"normal/02f03513839ac37ce95086b838b50fef.png"),function(err){
          thumbnailer = new Thumbnailer(dirpath);
          done(err);
        });
      })

    });
  });
  it("remove files",function(done){
    thumbnailer.clean(null,function(err){
      done(err);
    })
  })
});
