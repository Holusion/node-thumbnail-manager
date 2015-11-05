const files = require('../../lib/utils/files');
const path = require('path');
const fs = require("fs");

describe("files.getMtime",function(){
  it("throw an error on file not found",function(){
    return expect(files.getMtime( "file:///my/imaginary/path")).to.eventually.be.rejectedWith(/Error: ENOENT/)
  });
});
