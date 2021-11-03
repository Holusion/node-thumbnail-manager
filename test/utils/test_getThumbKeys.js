var fs = require('fs');
var getThumbKeys = require('../../lib/utils/getThumbKeys');


describe("getThumbKeys",function(){
  it("when present",function(done){
    fs.readFile(__dirname+"/../fixtures/thumbnails/normal/wallpaper.png",function(err,data){
      expect(err).to.be.null;
      expect(getThumbKeys(data).mtime.getTime()).to.equal(new Date(1418500379000).getTime());
      done();
    })

  });
  it("when absent",function(done){
    fs.readFile(__dirname+"/../fixtures/thumbnails/normal/logo.png",function(err,data){
      expect(err).to.be.null;
      expect(getThumbKeys(data)).to.deep.equal({});
      done();
    })
  });
});
