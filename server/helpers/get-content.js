const markdownToc = require('markdown-toc');

const wrappedFetch = require('./wrapped-fetch');

const getSection = (mdContent, sectionIndex) => {
  const regex = RegExp('^(## )', 'gm');
  let arr = regex.exec(mdContent);

  let i = 0;

  let startIndex = 0;
  let endIndex = 0;

  while (arr !== null) {
    if (i === sectionIndex - 1) {
      startIndex = regex.lastIndex;
    }
    if (i === sectionIndex) {
      endIndex = regex.lastIndex;
      break;
    }
    arr = regex.exec(mdContent);
    i += 1;
  }

  return mdContent.substring(sectionIndex === 1 ? 0 : startIndex - 3, endIndex - 3);
};

const getContent = (entity, documentId, sectionIndex) => {
  const result = {};

  const p = [];

  const rawUrl = `https://raw.githubusercontent.com/openstatute/us-statutes/production/${entity}/${documentId}.md`;
  p.push(wrappedFetch(rawUrl)
    .then(res => res.text())
    .then((mdContent) => {
      console.log(mdContent);
      if (mdContent === '404: Not Found') return Promise.reject(new Error('404: Not Found'));

      const toc = markdownToc(mdContent, { firsth1: false }).json;
      result.toc = toc;
      result.documentTitle = toc.find(item => item.lvl === 1).content;
      result.sectionTitle = sectionIndex === 'all' ? 'Full Text' : toc.find(item => item.lvl === 2).content;
      result.mdContent = !sectionIndex || sectionIndex === 'all' ? mdContent : getSection(mdContent, sectionIndex);

      return null;
    }));

  const commitUrl = `https://api.github.com/repos/openstatute/us-statutes/commits?path=${entity}/${documentId}.md&sha=production&per_page=1`;
  p.push(wrappedFetch(commitUrl)
    .then(res => res.json())
    .then((commits) => {
      const latestCommit = commits[0];
      result.date = latestCommit.commit.message.match(/\d{4}-\d{2}-\d{2}/)[0]; // eslint-disable-line
    }));

  return Promise.all(p)
    .then(() => result);
};

module.exports = getContent;
