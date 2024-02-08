const path = require("path");
const fs = require("fs");
const LANGS = require("../languages.json");

let globalList = [];

module.exports =
async function identifyFiles(root) {
  globalList = []; // Set this so we don't accidentally persist anything

  await enumerateFiles(root, [], handleFile);

  // Now we must sort the globalList to understand the files available

  let languageObj = {};

  for (let i = 0; i < globalList.length; i++) {
    let langItem;

    if (!LANGS[globalList[i].ext]) {
      // We don't know about this entry
      langItem = LANGS["..OTHER"];
    } else {
      langItem = LANGS[globalList[i].ext];
    }

    // TODO we could work out a scope mapping, where multiple extensions could be
    // one language item

    if (!languageObj[langItem.name]) {
      // This language hasn't been added to the list yet
      languageObj[langItem.name] = {
        color: langItem.color,
        name: langItem.name,
        files: [],
        percentage: null
      };
    }

    languageObj[langItem.name].files.push(globalList[i]);
    // Recalculate the percentage
    languageObj[langItem.name].percentage = (
      languageObj[langItem.name].files.length / globalList.length
    ) * 100;
    
  }

  return languageObj;
}

function handleFile(file, pathArray, filename, immediateReturn) {
  const parsed = path.parse(file);
  const ext = parsed.ext ?? parsed.name;

  // Here we will just add data to the globalList without caring at all what we know
  globalList.push({
    ext: ext,
    file: file
  });
}

async function enumerateFiles(dir, pathArray, fileCallback) {
  // dir: The starting directory
  // pathArray: The array of path entries
  // fileCallback: Function to invoke when a file is found
  // When a callback is invoked the following is passed:
  // - file: Which is the file and it's preceeding path. A relative path to a specific file.
  // - pathArray: The path as an array leading up to that file, from the initial dir passed.
  // - filename: The specific file's name.
  // - immediateReturn: An overloaded paramter passed only when the immediate dir
  //   passed was a direct file path.

  if (fs.lstatSync(dir).isFile()) {
    // The initial dir is a file, not a dir
    await fileCallback(dir, pathArray, path.basename(dir), true);
    return;
  }

  let files = fs.readdirSync(dir);

  for (const file of files) {
    let target = path.join(dir, file);

    if (fs.lstatSync(target).isDirectory()) {
      await enumerateFiles(target, [ ...pathArray, file], fileCallback);
    } else {
      await fileCallback(target, pathArray, file);
    }
  }
}
