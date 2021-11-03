'use strict';
const fs = require("fs/promises");
const {constants:{R_OK}} = require('fs');
const path = require("path");
const os = require("os");
const Worker = require("../lib/Worker");

describe("Worker",function(){
  beforeEach(function(){
    this.worker = new Worker({threads:2,timeout:1000});
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
  it("throws if executable is not found", async function(){
    await expect(this.worker.start("foo")).to.be.rejected;
  });

  it("inherits PATH", async function(){
    let dir = await fs.mkdtemp(path.join(os.tmpdir(), "worker-path-"));
    let originalPath = process.env["PATH"];
    try{
      await fs.writeFile(path.join(dir, "foo"), `#!/bin/sh\necho "foo"\n`);
      await fs.chmod(path.join(dir, "foo"), 0o755);
      process.env["PATH"] = dir+":"+originalPath;
      await expect(this.worker.start("foo")).to.be.fulfilled;
    }finally{
      await fs.rm(dir, {recursive: true});
      process.env["PATH"] = originalPath;
    }
  });
});
