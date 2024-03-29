'use strict';
const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const files = require('../../lib/utils/files');

describe("files.list",function(){
  before(async function(){
    this.dir = await fs.mkdtemp(path.join(os.tmpdir(), "node-thumbnailer-list-"));
    this.file = path.join(this.dir, "wallpaper.svg");
    this.thumbpath = path.join(this.dir, "thumbnails/normal");
    this.thumb = path.join(this.thumbpath, files.getHash(this.file));
    this.badThumb = path.join(this.thumbpath, files.getHash(path.join(this.dir, "logo.png")));
    await fs.mkdir(this.thumbpath, {recursive: true});
    await fs.copyFile(__dirname+"/../fixtures/sources/wallpaper.svg", this.file);
    await fs.copyFile(__dirname+"/../fixtures/thumbnails/normal/wallpaper.png", this.thumb);
    await fs.copyFile(__dirname+"/../fixtures/thumbnails/normal/logo.png", this.badThumb);
    await fs.utimes(this.file,1418500379,1418500379); //set mtime to Sat Dec 13 2014 20:52:59 GMT+0100 (CET)
  });

  after(async function(){
    await fs.rm(this.dir, {recursive: true});
  });

  it.skip("find invalid thumbnails",async function(){
    let bad_files = await expect(files.list(this.thumbpath)).to.be.fulfilled;
    expect(bad_files).to.deep.equal([this.badThumb]);
  });

  it("skip invalid dirs", async function(){
    let bad_files = await expect(files.list(path.join(this.dir, "thumbnails/foo"))).to.be.fulfilled;
    expect(bad_files).to.deep.equal([]);
  });
});
