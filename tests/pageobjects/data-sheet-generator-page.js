// NOTE: Not assertion in this file

export class DataSheetGeneratorPage {
  constructor(page) {
    this.page = page;
    this.newColumnButton = page.getByRole('button', { name: 'New column' });
    this.downloadSpreadsheetButton = page.getByRole('button', { name: 'Download Spreadsheet' });
  }

  async goto() {
    await this.page.goto('http://localhost:3000/');
  }

  async getColumns() {
    const columnsLocator = await this.page.locator("#columns");
    const columns = await columnsLocator.locator(":scope > div[id]");
    return columns;
  }

  async getColumn(props) {
    const { nthChild, id } = props;
    const columnsLocator = await this.page.locator("#columns");
    let columnLocator = null;

    if (nthChild) {
      columnLocator = await columnsLocator.locator(`:scope > div:nth-child(${nthChild})[id]`);
    } else if (id) {
      columnLocator = await columnsLocator.locator(`:scope > div[id="${id}"]`);
    }

    const isVisible = await columnLocator.isVisible();
    if (!isVisible) {
      throw new Error(`Column not found`);
    }

    return columnLocator;
  }

  async getColumnHeader(id) {
    const columnsLocator = await this.page.locator("#columns");
    const columnLocator = await columnsLocator.locator(`div[id="${id}"]`);
    const header = await columnLocator.locator('h3');

    return header;
  }

  async getColumnFields(id) {
    const columnsLocator = await this.page.locator("#columns");
    const columnLocator = await columnsLocator.locator(`div[id="${id}"]`);

    const isVisible = await columnLocator.isVisible();
    if (!isVisible) {
      throw new Error(`Column with id "${id}" not found`);
    }

    const deleteColumnButton = await columnLocator.locator('button[aria-label="Delete column"]');
    const headerNameInput = await columnLocator.getByLabel('Header name');
    const presetColumnRadio = await columnLocator.getByLabel('Preset column value');
    const presetColumnSelect = await columnLocator.locator("[name='preset_value']");
    const presetColumnOptions = await presetColumnSelect.locator('option');
    const customColumnRadio = await columnLocator.locator('label:has-text("Custom column value")'); // Use CSS selector for workaround on parent intercepts pointer event issue
    const customColumnValuesLocator = await columnLocator.locator("#custom-column-values");
    const newCustomColumnValueInputs = await customColumnValuesLocator.locator(":scope > div > div");
    const newCustomColumnValueButton = await columnLocator.getByRole('button', { name: 'New value' });

    return {
      deleteColumnButton,
      headerNameInput,
      presetColumnRadio,
      presetColumnSelect,
      presetColumnOptions,
      customColumnRadio,
      customColumnValuesLocator,
      newCustomColumnValueButton,
      newCustomColumnValueInputs,
    }
  }

  async getCustomColumnValueInput(props) {
    const { columnId, nthChild, id } = props;
    const { customColumnValuesLocator } = await this.getColumnFields(columnId);
    let customColumnValueInputLocator = null;

    if (nthChild) {
      customColumnValueInputLocator = await customColumnValuesLocator.locator(`:scope > div > div:nth-child(${nthChild}) > div[id]`);
    } else if (id) {
      customColumnValueInputLocator = await customColumnValuesLocator.locator(`:scope > div > div > div[id="${id}"]`);
    }

    const isVisible = await customColumnValueInputLocator.isVisible();
    if (!isVisible) {
      throw new Error(`Custom column value input is not found in Column with id "${columnId}"`);
    }
  
    const deleteCustomColumnValueButton = await customColumnValueInputLocator.locator('button[aria-label="Delete custom value"]');
    const isDeleteButtonVisible = await deleteCustomColumnValueButton.isVisible();
    if (!isDeleteButtonVisible) {
      throw new Error("Delete button is not found");
    }

    return {
      customColumnValueInputLocator,
      deleteCustomColumnValueButton,
    };
  }

  async getSettingFields() {
    const settingLocator = await this.page.locator('#settings');

    const isVisible = await settingLocator.isVisible();
    if (!isVisible) {
      throw new Error("Setting section is not found.");
    }

    const fileNameInput = await settingLocator.getByLabel('File name');
    const sheetNameInput = await settingLocator.getByLabel('Sheet name');
    const amountOfRowsInput = await settingLocator.getByLabel('Amount of rows');
    const formatSelect = await settingLocator.locator("[name='format']");
    const formatSelectOptions = await formatSelect.locator('option');

    return {
      fileNameInput,
      sheetNameInput,
      amountOfRowsInput,
      formatSelect,
      formatSelectOptions,
    }
  }

  async addNewColumn() {
    await this.newColumnButton.click();
  }

  async deleteColumn(id) {
    const { deleteColumnButton } = await this.getColumnFields(id);
    await deleteColumnButton.click();
  }

  async addNewCustomColumnValue(columnId) {
    const { newCustomColumnValueButton } = await this.getColumnFields(columnId);
    await newCustomColumnValueButton.click();
  }

  async deleteCustomColumnValue(props) {
    const { columnId, id } = props;
    const { deleteCustomColumnValueButton } = await this.getCustomColumnValueInput({ columnId, id })
    await deleteCustomColumnValueButton.click();
  }

  async downloadSpreadsheet() {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadSpreadsheetButton.click();
    const download = await downloadPromise;

    return download;
  }
}