const files = require('../../lib/utils/files');
const path = require('path');
const fs = require("fs");

describe("files.validate",function(){
  var mfiles;
  describe("based on Thumb::MTime",function(){
    before(function(){
      mfiles = {
        validate:files.validate,
        getMtime:function(){
          return Promise.resolve(new Date(1418500379000));
        }
      }
    })
    it("validate thumbnails",function(done){
      mfiles.validate( "file:///usr/share/images/desktop-base/joy-inksplat-wallpaper_1920x1080.svg"
                    , path.resolve(__dirname,"../fixtures/thumbnails/normal/02f03513839ac37ce95086b838b50fef.png")).then(function(valid){
        expect(valid).to.be.true;
        done();
      }).catch(done)
    });
    it("invalidate thumbnails based on Thumb::MTime",function(done){
      mfiles.validate( "file:///usr/share/images/desktop-base/joy-inksplat-wallpaper_1920x1080.svg"
                    , path.resolve(__dirname,"../fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png")).then(function(valid){
        expect(valid).to.be.false;
        done();
      }).catch(done)
    });
  })
  describe("based on source URI",function(){
    before(function(){
      mfiles = {
        validate:files.validate,
        getMtime:function(){
          return Promise.reject(new Error("ENOENT: no such file or directory, stat '/imaginary/path'"));
        }
      }
    })
    it("throw an error if source is missing",function(done){
      mfiles.validate( "file:///imaginary/path"
                    , path.resolve(__dirname,"../fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png")).then(function(valid){
        done("sould not be called");
      }).catch(function(e){
        expect(e).to.deep.equal(new Error("ENOENT: no such file or directory, stat '/imaginary/path'"));
        done();
      })
    });
  });
});
