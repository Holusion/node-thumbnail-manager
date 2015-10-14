var fs = require('fs');
var getThumbMtime = require('../../lib/utils/getThumbMtime');


describe("getThumbMtime",function(){
  it("when present",function(done){
    fs.readFile(__dirname+"/../fixtures/thumbnails/normal/02f03513839ac37ce95086b838b50fef.png",function(err,data){
      expect(err).to.be.null;
      expect(getThumbMtime(data)).to.equal("1418500379");
      done();
    })

  });
  it("when absent",function(done){
    fs.readFile(__dirname+"/../fixtures/thumbnails/normal/7ff46454d660a30a0190536d678a6ea6.png",function(err,data){
      expect(err).to.be.null;
      expect(getThumbMtime(data)).to.be.undefined;
      done();
    })
  });
});
