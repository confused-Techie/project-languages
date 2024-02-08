const { Disposable } = require("atom");
const identifyFiles = require("./identify-files.js");

module.exports =
class ProjectLanguagesStatusView {
  constructor(statusBar) {
    this.statusBar = statusBar;
    this.element = document.createElement("project-languages-status");
    this.element.classList.add("project-languages-status", "inline-block");
    this.languageList = document.createElement("div");
    this.element.appendChild(this.languageList);

    this.subscription;
    this.tile;
    this.tooltip;

    this.subscribe();
    this.update();
  }

  destroy() {
    if (this.subscription) {
      this.subscription.dispose();
    }

    if (this.tile) {
      this.tile.destroy();
    }

    if (this.tooltip) {
      this.tooltip.dispose();
    }
  }

  attach() {
    console.log("Project Languages: attached");
    this.tile = this.statusBar.addRightTile({ priority: 11, item: this.element });
  }

  subscribe() {
    console.log("Project Languages: subscribed");
    if (this.subscription) {
      this.subscription.dispose();
    }

    this.subscription = atom.project.onDidChangeFiles(this.update.bind(this));
  }

  async update(events) {
    // We don't care about modified events
    if (events && events[0].action === "modified") {
      return;
    }

    // Then lets remove all appended children nodes
    while(this.languageList.firstChild) {
      this.languageList.removeChild(this.languageList.firstChild);
    }

    let dir = atom.project.rootDirectories[0].path;
    // TODO we will just work with whatever the first returned path is for now

    let languages = await identifyFiles(dir);
    console.log(languages);

    console.log("Project Languages: updated");

    atom.views.updateDocument(() => {
      let tooltipText = "This project has ";
      let tooltipLangs = [];

      const langContainer = document.createElement("span");
      langContainer.classList.add("list");

      for (const lang in languages) {

        let langSpan = document.createElement("span");
        langSpan.classList.add("list-item");
        langSpan.style.backgroundColor = languages[lang].color;
        langSpan.style.width = `${languages[lang].percentage}%`;
        langContainer.appendChild(langSpan);

        tooltipLangs.push(`${Math.round(languages[lang].percentage)}% ${languages[lang].name}`);
      }

      this.languageList.appendChild(langContainer);

      if (this.tooltip) {
        this.tooltip.dispose();
      }

      tooltipText += tooltipLangs.join(", ");
      tooltipText = tooltipText.replace(/,([^,]*)$/, " and$1");
      this.tooltip = atom.tooltips.add(this.element, {
        title: tooltipText
      });

    });
  }
}
