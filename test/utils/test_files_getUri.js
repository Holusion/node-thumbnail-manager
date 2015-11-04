const files = require('../../lib/utils/files');
describe("files.getUri",function(){
  it("correct file URI",function(){
    expect(files.getUri("file:///test/file")).to.equal("file:///test/file");
  })
  it("absolute file",function(){
    expect(files.getUri("/test/file")).to.equal("file:///test/file");
  })
  it("relative file",function(){
    var pwd = process.env["PWD"];
    process.env["PWD"] = "/";
    expect(files.getUri("file://test/file")).to.equal("file:///test/file");
    process.env["PWD"] = pwd;
  });
  it("Other protocol URI",function(){
    expect(files.getUri("http://test/file")).to.equal("http://test/file");
  });
})
