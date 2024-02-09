
module.exports =
function generateView(langs) {
  // We take an object of langs, and will create an HTML tooltip to display them nicely
  const container = document.createElement("div");
  container.classList.add("project-languages-tooltip");
  const text = document.createElement("span");
  text.textContent = "This Project contains the following Languages:";
  container.appendChild(text);

  const listTree = document.createElement("ul");
  listTree.classList.add("list-tree");

  for (const lang in langs) {
    const listNestItem = document.createElement("li");
    listNestItem.classList.add("list-nested-item");
    const listItem = document.createElement("div");
    listItem.classList.add("list-item");
    const spanEntry = document.createElement("span");
    spanEntry.textContent = `${lang}: ${Math.round(langs[lang].percentage)}%`;
    spanEntry.classList.add("icon", "icon-code");
    spanEntry.classList.add("text-highlight");

    listItem.appendChild(spanEntry);

    const listTreeLangFiles = document.createElement("ul");
    listTreeLangFiles.classList.add("list-tree");

    if (atom.config.get("project-languages.showFileNames")) {
      for (let i = 0; i < langs[lang].files.length; i++) {
        let file = langs[lang].files[i];
        const listItemFile = document.createElement("li");
        listItemFile.classList.add("list-item");
        const spanFile = document.createElement("span");
        spanFile.textContent = atom.project.relativizePath(file.file)[1];
        spanFile.classList.add("icon", "icon-file-text");

        listItemFile.appendChild(spanFile);
        listTreeLangFiles.appendChild(listItemFile);
      }
    }

    listItem.appendChild(listTreeLangFiles);
    listNestItem.appendChild(listItem);
    listTree.appendChild(listNestItem);
  }

  container.appendChild(listTree);

  return container;
}
