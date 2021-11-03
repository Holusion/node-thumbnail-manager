'use strict';
const thumbDirs = require("../../lib/utils/thumbDirs");
const path = require("path");
const fs = require('fs/promises');
const os = require("os");



describe("thumbDirs.create",function(){
  var dir;
  before(async function(){
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "thumbDirs-"));
  });
  after(async function(){
    await fs.rm(dir, {recursive: true});
  })
  it("create base directories",async function(){
    let created_dir = await expect(thumbDirs.create(dir)).to.be.fulfilled;
    expect(created_dir).to.equal(dir);
    const dirs = ["normal","large","fail"].map(function(size){
      return path.join(dir,size);
    })
    let stats = await Promise.all(dirs.map(dirpath=>fs.stat(dirpath)));
    for(let stat of stats){
      expect(stat.isDirectory()).to.be.true;
    }
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
