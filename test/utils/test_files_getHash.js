const path = require('path');
const getHash = require('../../lib/utils/files').getHash;
describe("files.getHash",function(){
  var files;
  after(function(){
  })
  it("calculate md5sum for filePath",function(){
    expect(getHash("file:///test/file")).to.equal("84a11e3dfc895b1e9c2c478dfda573f1.png");
  });
});
