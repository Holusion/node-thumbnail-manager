'use strict';
const fs = require("fs/promises");
const {constants:{R_OK}} = require('fs');
const path = require("path");
const os = require("os");

const files = require('../../lib/utils/files');


describe("files.exists",function(){
  before(async function(){
    this.dir = await fs.mkdtemp(path.join(os.tmpdir(), "node-thumbnailer-exists-"));
    this.file = path.join(this.dir, "wallpaper.svg");
    this.thumbpath = path.join(this.dir, "thumbnails/normal");
    this.thumb = path.join(this.thumbpath, files.getHash(this.file));
    await fs.mkdir(this.thumbpath, {recursive: true});
    await fs.copyFile(__dirname+"/../fixtures/sources/wallpaper.svg", this.file);
    await fs.copyFile(__dirname+"/../fixtures/thumbnails/normal/wallpaper.png", this.thumb);
    await fs.utimes(this.file,1418500379,1418500379); //set mtime to Sat Dec 13 2014 20:52:59 GMT+0100 (CET)
  });
  after(async function(){
    await fs.rm(this.dir, {recursive: true});
  });

  it("returns thumbnail full path",async function(){
    let hash = await expect(files.exists(this.thumbpath, this.file)).to.be.fulfilled;
    expect(hash).to.equal(this.thumb);
  });
});
