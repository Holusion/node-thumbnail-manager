'use strict';
const fs = require("fs/promises");
const {constants:{R_OK}} = require('fs');
const path = require("path");
const os = require("os");
const Thumbnailer = require("../lib");

describe("Thumbnailer",function(){
  var dir;
  before(async function(){
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "node-thumbnailer-"));
  });
  after(async function(){
    await fs.rm(dir, {recursive: true});
  })

  it("create a thumbnail if it doesn't exists",function(){
    var thumbnailer = new Thumbnailer({dir});
    thumbnailer.create = function(file,size){
      expect(file).to.equal(__dirname+"/common.js");
      expect(size).to.equal(128);
    }
    return expect(thumbnailer.request(__dirname+"/common.js",128)).to.eventually.be.fulfilled; //We're sure a thumbnail for this doesn't exists in this directory...
  });
  it("escape shell command",function(done){
    var thumbnailer = new Thumbnailer({dir});
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

  describe("clean", function(){
    this.beforeEach(async function(){
      this.dir = await fs.mkdtemp(path.join(dir, "clean-"));
      await fs.mkdir(path.join(this.dir, "normal"));
      await Promise.all([
        fs.copyFile(path.join(__dirname,"fixtures/thumbnails/normal/wallpaper.png"), path.join(this.dir,"normal/02f03513839ac37ce95086b838b50fef.png")),
        fs.copyFile(path.join(__dirname,"fixtures/thumbnails/normal/logo.png"), path.join(this.dir,"normal/7ff46454d660a30a0190536d678a6ea6.png"))
      ]);
      this.thumbnailer = new Thumbnailer({dir: this.dir});
    })
    this.afterEach(async function(){
      await fs.rm(this.dir, {recursive: true});
    })
    it("remove old files", async function(){
      expect( await this.thumbnailer.clean()).to.not.throw;
      await expect(fs.access(path.join(this.dir,"normal/02f03513839ac37ce95086b838b50fef.png")), R_OK).to.be.rejected;
      await expect(fs.access(path.join(this.dir,"normal/7ff46454d660a30a0190536d678a6ea6.png")), R_OK).to.be.rejected;
    })

    it("can be limited", async function(){
      expect( await this.thumbnailer.clean({count:1})).to.not.throw;
      await expect(fs.access(path.join(this.dir,"normal/02f03513839ac37ce95086b838b50fef.png")), R_OK).to.be.rejected;
      await expect(fs.access(path.join(this.dir,"normal/7ff46454d660a30a0190536d678a6ea6.png")), R_OK).to.be.fulfilled;
    })
    it("work when files < limit", async function(){
      expect( await this.thumbnailer.clean({count:10})).to.not.throw;
      await expect(fs.access(path.join(this.dir,"normal/02f03513839ac37ce95086b838b50fef.png")), R_OK).to.be.rejected;
      await expect(fs.access(path.join(this.dir,"normal/7ff46454d660a30a0190536d678a6ea6.png")), R_OK).to.be.rejected;
    })

    it("don't crash on fail/*/ directories", async function(){
      await fs.mkdir(path.join(this.dir,"fail", "blender"));    
      await fs.copyFile(path.join(__dirname,"fixtures/thumbnails/normal/logo.png"), path.join(this.dir,"fail/blender/7ff46454d660a30a0190536d678a6ea6.png"));
      expect( await this.thumbnailer.clean({count:10})).to.not.throw;
    })
  })
});
