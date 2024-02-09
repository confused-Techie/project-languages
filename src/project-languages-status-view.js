const { Disposable } = require("atom");
const { performance } = require("perf_hooks");
const identifyFiles = require("./identify-files.js");
const projectLanguagesToolTipView = require("./project-languages-tooltip-view.js");

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
    this.tile = this.statusBar.addRightTile({ priority: 11, item: this.element });
  }

  subscribe() {
    if (this.subscription) {
      this.subscription.dispose();
    }

    this.subscription = atom.project.onDidChangeFiles(this.update.bind(this));
  }

  async update(events) {
    const startTime = performance.now();
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

    atom.views.updateDocument(() => {
      const langContainer = document.createElement("span");
      langContainer.classList.add("list");

      for (const lang in languages) {

        let langSpan = document.createElement("span");
        langSpan.classList.add("list-item");
        langSpan.style.backgroundColor = languages[lang].color;
        langSpan.style.width = `${languages[lang].percentage}%`;
        langContainer.appendChild(langSpan);

      }

      this.languageList.appendChild(langContainer);

      if (this.tooltip) {
        this.tooltip.dispose();
      }

      this.tooltip = atom.tooltips.add(this.element, {
        item: projectLanguagesToolTipView(languages)
      });

    });

    const endTime = performance.now();
    console.log(`Project-Languages: Updated in ${endTime - startTime}ms`);
  }
}
