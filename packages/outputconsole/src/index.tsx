/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import { Widget, BoxLayout } from '@phosphor/widgets';

import { UUID } from '@phosphor/coreutils';

import { Token } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';

import { Toolbar, ToolbarButton } from '@jupyterlab/apputils';

import '../style/index.css';

/**
 * The state manager token.
 */
export const IJupyterLabOutputConsole = new Token<IJupyterLabOutputConsole>(
  'jupyterlab:IJupyterLabOutputConsole'
);

/**
 * An interface for a state manager.
 */
export interface IJupyterLabOutputConsole extends JupyterLabOutputConsole {}

export class JupyterLabOutputConsole implements IDisposable {
  /**
   * Construct a new State Manager object.
   */
  constructor() {}

  /**
   * Get whether the completion handler is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources used by the handler.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._isDisposed = true;
  }

  logMessage(msg: any) {
    if (this._onMessageHandler) {
      this._onMessageHandler(msg);
    } else {
      console.log(`IJupyterLabOutputConsole: ${msg}`);
    }
  }

  onMessage(handler: any) {
    this._onMessageHandler = handler;
  }

  private _isDisposed = false;
  private _onMessageHandler: any;
}

export class JupyterLabOutputConsoleExtWidget extends Widget {
  constructor(logConsole: JupyterLabOutputConsole) {
    super();

    this.id = UUID.uuid4();
    this.title.closable = true;
    this.title.label = 'Console Log Output';
    this.addClass('lab-console-ext-widget');

    let consoleWidget = new JupyterLabOutputConsoleWidget(logConsole);

    let toolbar = new Toolbar();
    let button = new ToolbarButton({
      onClick: (): void => {
        consoleWidget.clearMessages();
      },
      iconClassName: 'fa fa-trash',
      tooltip: 'Clear',
      label: 'Clear'
    });
    toolbar.addItem(name, button);
    toolbar.addItem('jlab-log-clear', button);

    let layout = new BoxLayout();
    layout.addWidget(toolbar);
    layout.addWidget(consoleWidget);

    BoxLayout.setStretch(toolbar, 0);
    BoxLayout.setStretch(consoleWidget, 1);

    this.layout = layout;
  }
}

class JupyterLabOutputConsoleWidget extends Widget {
  private _logCounter: number = 0;

  constructor(logConsole: JupyterLabOutputConsole) {
    super();

    this.addClass('lab-console-ext-widget');

    logConsole.onMessage((msg: any) => {
      const content =
        msg.msg_type === 'stream'
          ? msg.content.text
          : msg.content.data['text/html'];

      const now = new Date();
      const logTime = now.toLocaleTimeString();
      const logLine = document.createElement('div');
      logLine.className = 'lab-console-log-line';
      logLine.innerHTML = `<div class="log-count">${++this
        ._logCounter})</div><div class="log-time">${logTime}</div><div class="log-content">${content}</div>`;

      if (this.node.hasChildNodes()) {
        this.node.insertBefore(logLine, this.node.childNodes[0]);
      } else {
        this.node.appendChild(logLine);
      }
    });
  }

  clearMessages(): void {
    while (this.node.lastChild) {
      this.node.removeChild(this.node.lastChild);
    }
    this._logCounter = 0;
  }
}
