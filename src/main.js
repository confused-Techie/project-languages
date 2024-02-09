const ProjectLanguagesStatusView = require("./project-languages-status-view.js");

let statusView = null;

module.exports = {
  activate: () => {},

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
