// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { galata, describe, test } from '@jupyterlab/galata';
import * as path from 'path';

jest.setTimeout(60000);

const fileName = 'toc_notebook.ipynb';

describe('Table of Contents', () => {
  beforeAll(async () => {
    await galata.resetUI();
    galata.context.capturePrefix = 'toc';
  });

  afterAll(async () => {
    galata.context.capturePrefix = '';
  });

  test('Upload files to JupyterLab', async () => {
    await galata.contents.moveFileToServer(
      path.resolve(__dirname, `./notebooks/${fileName}`),
      `uploaded/${fileName}`
    );
    await galata.contents.moveFileToServer(
      path.resolve(__dirname, './notebooks/WidgetArch.png'),
      'uploaded/WidgetArch.png'
    );
    expect(
      await galata.contents.fileExists(`uploaded/${fileName}`)
    ).toBeTruthy();
    expect(
      await galata.contents.fileExists('uploaded/WidgetArch.png')
    ).toBeTruthy();
  });

  test('Refresh File Browser', async () => {
    await galata.filebrowser.refresh();
  });

  test('Open directory uploaded', async () => {
    await galata.filebrowser.openDirectory('uploaded');
    expect(
      await galata.filebrowser.isFileListedInBrowser(fileName)
    ).toBeTruthy();
  });

  test('Open Notebook', async () => {
    await galata.notebook.open(fileName);
    expect(await galata.notebook.isOpen(fileName)).toBeTruthy();
    await galata.notebook.activate(fileName);
    expect(await galata.notebook.isActive(fileName)).toBeTruthy();
  });

  test('Open Property Inspector', async () => {
    const imageName = 'property-inspector';
    await galata.sidebar.openTab('jp-property-inspector');
    const piPanel = await galata.sidebar.getContentPanel('left');
    await galata.capture.screenshot(imageName, piPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
  });

  test('Add tags', async () => {
    const imageName = 'add-tags';
    const tagInputSelector = 'div.tag-holder input.add-tag';
    let piPanel = await galata.sidebar.getContentPanel('left');
    let addTagInput = await piPanel.$(tagInputSelector);
    await addTagInput.click();
    await galata.context.page.keyboard.insertText('tag1');
    await galata.context.page.keyboard.press('Enter');
    addTagInput = await piPanel.$(tagInputSelector);
    await addTagInput.click();
    await galata.context.page.keyboard.insertText('tag2');
    await galata.context.page.keyboard.press('Enter');
    await galata.capture.screenshot(imageName, piPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
  });

  test('Assign tags to cells', async () => {
    await galata.notebook.activate(fileName);
    await galata.notebook.selectCells(6);

    await galata.sidebar.openTab('jp-property-inspector');
    const piPanel = await galata.sidebar.getContentPanel('left');
    const tags = await piPanel.$$('.lm-Widget.tag');
    expect(tags.length).toBe(3); // including Add Tag
    await tags[0].click();

    await galata.notebook.activate(fileName);
    await galata.notebook.selectCells(9);

    await galata.sidebar.openTab('jp-property-inspector');
    await tags[1].click();

    await galata.notebook.activate(fileName);
    await galata.notebook.selectCells(11);

    await galata.sidebar.openTab('jp-property-inspector');
    await tags[0].click();
    await tags[1].click();
  });

  test('Open Table of Contents panel', async () => {
    const imageName = 'toc-panel';
    await galata.notebook.activate(fileName);
    await galata.notebook.selectCells(0);

    await galata.sidebar.openTab('table-of-contents');
    const tocPanel = await galata.sidebar.getContentPanel('left');
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
  });

  test('Toggle code-markdown-list', async () => {
    const tocPanel = await galata.sidebar.getContentPanel('left');
    const toolbarButtons = await tocPanel.$$('.toc-toolbar .toc-toolbar-icon');
    expect(toolbarButtons.length).toBe(4);

    let imageName = 'toggle-code';
    await toolbarButtons[0].click();
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
    await toolbarButtons[0].click();

    imageName = 'toggle-markdown';
    await toolbarButtons[1].click();
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
    await toolbarButtons[1].click();

    imageName = 'toggle-numbered-list';
    await toolbarButtons[2].click();
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
    await toolbarButtons[2].click();
  });

  test('Toggle tags', async () => {
    const tocPanel = await galata.sidebar.getContentPanel('left');
    const toolbarButtons = await tocPanel.$$('.toc-toolbar .toc-toolbar-icon');
    expect(toolbarButtons.length).toBe(4);

    // toggle code and markdown
    await toolbarButtons[0].click();
    await toolbarButtons[1].click();

    let imageName = 'show-tags';
    await toolbarButtons[3].click();
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');

    const tags = await tocPanel.$$('.toc-tag');
    expect(tags.length).toBe(2);

    imageName = 'toggle-tag-1';
    await tags[0].click();
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
    await tags[0].click();

    imageName = 'toggle-tag-2';
    await tags[1].click();
    await galata.capture.screenshot(imageName, tocPanel);
    expect(await galata.capture.compareScreenshot(imageName)).toBe('same');
    await tags[1].click();
  });

  test('Close Notebook', async () => {
    await galata.notebook.activate(fileName);
    await galata.notebook.save();
    await galata.notebook.close(false);

    // // close save prompt
    // const dialogSelector = '.jp-Dialog .jp-Dialog-content';
    // const dialog = await galata.context.page.$(dialogSelector);
    // if (dialog) {
    //   const okButton = await dialog.$('button.jp-mod-accept');
    //   if (okButton) {
    //       await okButton.click();
    //   }
    //   await galata.context.page.waitForSelector(dialogSelector, { state: 'hidden' });
    // }

    // const tab = await galata.activity.getTab();

    // if (!tab) {
    //   console.log('NO TAB');
    // }

    // await galata.capture.screenshot('before-revert');
    // if (!await galata.notebook.revertChanges()) {
    //   console.log('COULD NOT REVERT');
    // }
    // await galata.capture.screenshot('after-revert');

    // const closeIcon = await tab.$('.lm-TabBar-tabCloseIcon');
    // if (!closeIcon) {
    //   console.log('NO CLOSE ICON');
    // }

    // await closeIcon.click();
  });

  test('Open home directory', async () => {
    await galata.capture.screenshot('after-close-btn-click');
    await galata.sidebar.openTab('filebrowser');
    await galata.filebrowser.openHomeDirectory();
  });

  test('Delete uploaded directory', async () => {
    await galata.contents.deleteDirectory('uploaded');
  });
});
