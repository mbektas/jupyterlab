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
export const IOutputConsole = new Token<IOutputConsole>(
  '@jupyterlab/outputconsole:IOutputConsole'
);

/**
 * An interface for a state manager.
 */
export interface IOutputConsole {
  logMessage(msg: any): void;
}

export class OutputConsole implements IDisposable, IOutputConsole {
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
      console.log(`IOutputConsole: ${msg}`);
    }
  }

  onMessage(handler: any) {
    this._onMessageHandler = handler;
  }

  private _isDisposed = false;
  private _onMessageHandler: any;
}

export class OutputConsoleWidget extends Widget {
  private _consoleView: OutputConsoleView = null;

  constructor() {
    super();

    this.id = UUID.uuid4();
    this.title.closable = true;
    this.title.label = 'Output Console';
    this.addClass('lab-output-console-widget');

    this._consoleView = new OutputConsoleView();

    let toolbar = new Toolbar();
    let button = new ToolbarButton({
      onClick: (): void => {
        this._consoleView.clearMessages();
      },
      iconClassName: 'fa fa-trash',
      tooltip: 'Clear',
      label: 'Clear'
    });
    toolbar.addItem(name, button);
    toolbar.addItem('lab-output-console-clear', button);

    let layout = new BoxLayout();
    layout.addWidget(toolbar);
    layout.addWidget(this._consoleView);

    BoxLayout.setStretch(toolbar, 0);
    BoxLayout.setStretch(this._consoleView, 1);

    this.layout = layout;
  }

  get outputConsole(): IOutputConsole {
    return this._consoleView.outputConsole;
  }
}

class OutputConsoleView extends Widget {
  private _logCounter: number = 0;
  private _outputConsole: OutputConsole = null;

  constructor() {
    super();

    this._outputConsole = new OutputConsole();

    this._outputConsole.onMessage((msg: any) => {
      const content =
        msg.msg_type === 'stream'
          ? msg.content.text
          : msg.content.data['text/html'];

      const now = new Date();
      const logTime = now.toLocaleTimeString();
      const logLine = document.createElement('div');
      logLine.className = 'lab-output-console-line';
      logLine.innerHTML = `<div class="log-count">${++this
        ._logCounter})</div><div class="log-time">${logTime}</div><div class="log-content">${content}</div>`;

      if (this.node.hasChildNodes()) {
        this.node.insertBefore(logLine, this.node.childNodes[0]);
      } else {
        this.node.appendChild(logLine);
      }
    });
  }

  get outputConsole(): IOutputConsole {
    return this._outputConsole;
  }

  clearMessages(): void {
    while (this.node.lastChild) {
      this.node.removeChild(this.node.lastChild);
    }
    this._logCounter = 0;
  }
}
