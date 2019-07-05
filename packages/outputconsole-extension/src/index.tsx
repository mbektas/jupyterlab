/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IMainMenu } from '@jupyterlab/mainmenu';

import {
  IJupyterLabOutputConsole,
  JupyterLabOutputConsole,
  JupyterLabOutputConsoleExtWidget
} from '@jupyterlab/outputconsole';

/**
 * The HTML file handler extension.
 */
const outputConsolePlugin: JupyterFrontEndPlugin<IJupyterLabOutputConsole> = {
  activate: activateOutputConsole,
  id: '@jupyterlab/outputconsole-extension:plugin',
  provides: IJupyterLabOutputConsole,
  requires: [IMainMenu],
  autoStart: true
};

/**
 * Activate the OutputConsole extension.
 */
function activateOutputConsole(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu
): IJupyterLabOutputConsole {
  console.log('JupyterLab extension jupyterlab_output_console is activated!');

  const logConsole = new JupyterLabOutputConsole();
  const widget = new JupyterLabOutputConsoleExtWidget(logConsole);

  const addWidgetToMainArea = () => {
    app.shell.add(widget, 'main', {
      ref: '',
      mode: 'split-bottom'
    });
    widget.update();
    app.shell.activateById(widget.id);
  };

  app.started.then(() => {
    setTimeout(() => {
      addWidgetToMainArea();
    }, 2000);
  });

  const command: string = 'log:jlab-console-log';

  app.commands.addCommand(command, {
    label: 'Console Log Output',
    execute: (args: any) => {
      if (widget.isAttached) {
        widget.close();
      } else {
        addWidgetToMainArea();
      }
    },
    isToggled: (): boolean => {
      return widget.isAttached;
    }
  });

  mainMenu.viewMenu.addGroup([{ command }]);

  return logConsole;
}
/**
 * Export the plugins as default.
 */
export default outputConsolePlugin;
