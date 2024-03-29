#!/usr/bin/env node
"use strict";

const { execFile } = require("child_process");
const main = require(".");

const outputDir = process.argv[2] || "docs";

main(outputDir);

execFile(
  "node_modules/.bin/remark",
  ["--frail", "--quiet", "--use", "validate-links", outputDir],
  (error, stdout, stderr) => {
    if (error) {
      process.stderr.write(stderr);
      process.exit(error.code);
    } else {
      process.stdout.write(stdout);
      process.stderr.write(stderr);
    }
  }
);
