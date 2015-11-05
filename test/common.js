//TEST FRAMEWORKS
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
var path = require("path");
chai.config.includeStack = true;
chai.use(chaiAsPromised);

process.env["XDG_DATA_DIRS"] = path.join(__dirname,"fixtures");


//server.start(server.app);
global.expect = chai.expect;
