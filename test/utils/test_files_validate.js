'use strict';
const fs = require("fs/promises");
const {constants:{R_OK}} = require('fs');
const path = require("path");
const os = require("os");

const files = require('../../lib/utils/files');

describe("files.validate",function(){
  describe("based on Thumb::MTime",function(){
    const mtime = new Date(1418500379000);
    before(async function(){
      this.dir = await fs.mkdtemp(path.join(os.tmpdir(), "node-thumbnailer-validate-"));
      this.wallpaper = path.join(this.dir, "wallpaper.svg")
      await fs.copyFile(path.resolve(__dirname, "../fixtures/sources/wallpaper.svg"), this.wallpaper);
      await fs.utimes(this.wallpaper, mtime, mtime);
    });
    after(async function(){
      await fs.rm(this.dir, {recursive: true});
    })
    it("validate thumbnails",async function(){
      let valid = await expect(files.validate(
        this.wallpaper,
        path.resolve(__dirname,"../fixtures/thumbnails/normal/wallpaper.png")
      )).to.be.fulfilled;
      expect(valid).to.be.true;
    });
    it("invalidate thumbnails based on Thumb::MTime",function(done){
      files.validate(
        this.wallpaper,
        path.resolve(__dirname,"../fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png")
      ).then(function(valid){
        expect(valid).to.be.false;
        done();
      }).catch(done)
    });
  })
  describe("based on source URI",function(){

    it("invalidate if source is missing",function(done){
      files.validate( "file:///imaginary/path"
                    , path.resolve(__dirname,"../fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png")).then(function(valid){
        expect(valid).to.be.false;
        done();
      }).catch(done);
    });
  });
});
