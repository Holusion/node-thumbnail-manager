'use strict';
var Thumbnailer = require("../lib");
var tmp = require("tmp-promise");
var fs = require("fs");
var path = require("path");

const {promisify} = require("util");

const link = promisify(fs.link);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);
describe("Thumbnailer.clean", function(){
  beforeEach( async function() {
    this.tmpdir = await tmp.dir({unsafeCleanup:true});
    await mkdir(path.join(this.tmpdir.path,"normal"));
    await link(path.join(__dirname,"fixtures/thumbnails/normal/02f03513839ac37ce95086b838b50fef.png"),path.join(this.tmpdir.path,"normal/02f03513839ac37ce95086b838b50fef.png"));
    await link(path.join(__dirname,"fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png"),path.join(this.tmpdir.path,"normal/7ff46454d660a30a0190536d678a6ea6.png"));
    this.thumbnailer = new Thumbnailer(this.tmpdir.path);

  });
  afterEach(function(){
    this.tmpdir.cleanup();
  })
  
  it("remove old files", async function(){
    expect( await this.thumbnailer.clean(null)).to.not.throw;
    expect(await exists(path.join(this.tmpdir.path,"normal/02f03513839ac37ce95086b838b50fef.png"))).to.be.false;
    expect(await exists(path.join(this.tmpdir.path,"normal/7ff46454d660a30a0190536d678a6ea6.png"))).to.be.false;

  })

  it("can be limited", async function(){
    expect( await this.thumbnailer.clean({count:1})).to.not.throw;
    expect(await exists(path.join(this.tmpdir.path,"normal/02f03513839ac37ce95086b838b50fef.png"))).to.be.false;
    expect(await exists(path.join(this.tmpdir.path,"normal/7ff46454d660a30a0190536d678a6ea6.png"))).to.be.true;
  })
  it("work when files < limit", async function(){
    expect( await this.thumbnailer.clean({count:10})).to.not.throw;
    expect(await exists(path.join(this.tmpdir.path,"normal/02f03513839ac37ce95086b838b50fef.png"))).to.be.false;
    expect(await exists(path.join(this.tmpdir.path,"normal/7ff46454d660a30a0190536d678a6ea6.png"))).to.be.false;
  })

  it("don't crash on fail/*/ directories", async function(){
    await mkdir(path.join(this.tmpdir.path,"fail", "blender"));    
    await link(path.join(__dirname,"fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png"), path.join(this.tmpdir.path,"fail/blender/7ff46454d660a30a0190536d678a6ea6.png"));
    expect( await this.thumbnailer.clean({count:10})).to.not.throw;
  })
});
