var Worker = require("../lib/Worker");

describe("Worker",function(){
  beforeEach(function(){
    this.worker = new Worker();
  });
  it("Try to process queue",function(done){
    this.worker.exec = function(line,callback){
      expect(line).to.equal("test");
      callback(null);
    }
    this.worker.start("test").then(function(){
      done();
    }).catch(done);
  });
  it("Limit concurrent jobs",function(done){
    var count = 0;
    this.worker.exec = function(line,callback){
      setTimeout(function(){callback(null)},parseInt(line));
    }
    this.worker.start("10").then(function(){ count++ }).catch(done);
    this.worker.start("100").then(function(){ count++ }).catch(done);
    this.worker.start("1").then(function(){ expect(count).to.equal(1);done() }).catch(done);
  });
  it("Set timeout",function(done){
    this.worker.timeout = 10;
    this.worker.start("sleep 10").then(function(){
      expect("worker.start should have been killed and not resolve").to.be.false;
    }).catch(function(e){
      expect(e.killed).to.be.true;
      done();
    });
  });
});
