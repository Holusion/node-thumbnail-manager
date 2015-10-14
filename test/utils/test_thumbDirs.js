var thumbDirs = require("../../lib/utils/thumbDirs");

describe("thumbDirs",function(){
  it("prioritize normal thumbnails when size < 128",function(){
    expect(thumbDirs("/dir",120)).to.deep.equal("/dir/normal");
  })
  it("prioritize normal thumbnails when size = 128",function(){
    expect(thumbDirs("/dir",128)).to.deep.equal("/dir/normal");
  });
  it("prioritize large thumbnails when size > 128",function(){
    expect(thumbDirs("/dir",129)).to.equal("/dir/large");
  });
  it("default to size = 128",function(){
    expect(thumbDirs("/dir")).to.deep.equal("/dir/normal");
  });
})
