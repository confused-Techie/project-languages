const ProjectLanguagesStatusView = require("./project-languages-status-view.js");

let statusView = null;

module.exports = {
  activate: () => {
    console.log("Project Languages Activated!");
  },

  deactivate: () => {
    if (statusView) {
      statusView.destroy();
    }
  },

  consumeStatusBar(statusBar) {
    statusView = new ProjectLanguagesStatusView(statusBar);
    statusView.attach();
  }
};
