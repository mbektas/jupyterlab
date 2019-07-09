/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { SessionManager, KernelMessage } from '@jupyterlab/services';

import { IMainMenu } from '@jupyterlab/mainmenu';

import { IOutputConsole, OutputConsoleWidget } from '@jupyterlab/outputconsole';

const outputConsolePlugin: JupyterFrontEndPlugin<IOutputConsole> = {
  activate: activateOutputConsole,
  id: '@jupyterlab/outputconsole-extension:plugin',
  provides: IOutputConsole,
  requires: [IMainMenu],
  autoStart: true
};

function activateOutputConsole(
  app: JupyterFrontEnd,
  mainMenu: IMainMenu
): IOutputConsole {
  console.log('JupyterLab extension @jupyterlab/outputconsole is activated!');

  const widget = new OutputConsoleWidget();

  const addWidgetToMainArea = () => {
    app.shell.add(widget, 'main', {
      ref: '',
      mode: 'split-bottom'
    });
    widget.update();
    app.shell.activateById(widget.id);
  };

  app.started.then(() => {
    // setTimeout(() => {
    //   addWidgetToMainArea();
    // }, 2000);

    app.serviceManager.unhandledSessionIOPubMessage.connect(
      (sender: SessionManager, msg: KernelMessage.IIOPubMessage) => {
        if (!widget.isAttached) {
          addWidgetToMainArea();
        }

        widget.outputConsole.logMessage(msg);
      }
    );
  });

  const command: string = 'log:jlab-output-console';

  app.commands.addCommand(command, {
    label: 'Output Console',
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

  setInterval(() => {
    widget.outputConsole.logMessage({
      msg_type: 'stream',
      content: {
        text: 'Mehmet'
      }
    });

    widget.outputConsole.logMessage({
      msg_type: 'display_data',
      content: {
        data: {
          'text/html': '<span style="color:orange">Bektas</span>'
        }
      }
    });
  }, 20000);

  mainMenu.viewMenu.addGroup([{ command }]);

  return widget.outputConsole;
}

export default outputConsolePlugin;
