const fs = require("fs");
const path = require("path");
const globby = require("globby");
const remark = require("remark");
const visit = require("unist-util-visit");

function rewriteLink({ rewriter }) {
  function visitor(node) {
    node.url = rewriter(node.url);
  }
  function transform(tree) {
    visit(tree, ["link"], visitor);
  }
  return transform;
}

const extractTitleFromH1 = content => content.match(/\n?# ([^\n]+)\n/)[1];

const titleToSidebarLabel = {
  stylelint: "Home"
};

function processMarkdown(file, { rewriter }) {
  let processor = remark().use(rewriteLink, { rewriter });
  const content = processor.processSync(fs.readFileSync(file, "utf8")).toString();
  const title = extractTitleFromH1(content);
  const sidebarLabel = titleToSidebarLabel[title] || title;
  return `---
title: ${title}
sidebar_label: ${sidebarLabel}
hide_title: true
---

${content}`;
}

module.exports = function main(outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  globby.sync("node_modules/stylelint/*.md").forEach(async file => {
    const output = processMarkdown(file, {
      rewriter: url => url.replace(/^\/?docs\//, "").replace("README.md", "index.md")
    });
    const outputFile = path.join(
      outputDir,
      file.replace("node_modules/stylelint", "").replace("README.md", "index.md")
    );
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, output, "utf8");
    console.log(outputFile);
  });

  globby.sync("node_modules/stylelint/docs/**/*.md").forEach(file => {
    const output = processMarkdown(file, {
      rewriter: url =>
        url
          .replace(
            "../../lib/rules/index.js",
            "https://github.com/stylelint/stylelint/blob/master/lib/rules/index.js"
          )
          .replace("../../VISION.md", "../VISION.md")
          .replace("../../lib/rules/", "rules/")
          .replace("/README.md", ".md")
    });
    const outputFile = path.join(outputDir, file.replace("node_modules/stylelint/docs", ""));
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, output, "utf8");
    console.log(outputFile);
  });

  globby.sync("node_modules/stylelint/lib/rules/**/*.md").forEach(file => {
    const output = processMarkdown(file, {
      rewriter: url =>
        url
          .replace("../indentation/README.md", "indentation.md")
          .replace(/\.\.\/([a-z-]+)\/README.md/, "$1.md")
          .replace("../../../docs/user-guide/cli.md", "../cli.md")
    });
    const outputFile = path.join(
      outputDir,
      file
        .replace("node_modules/stylelint/lib/rules", "user-guide/rules")
        .replace("/README.md", ".md")
    );
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, output, "utf8");
    console.log(outputFile);
  });
};
