export class DataSheetGeneratorPage {
  constructor(page) {
    this.page = page;
    this.modeCheckbox = page.getByLabel('Dark mode');
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

  async getColumn(nthChild) {
    const columnsLocator = await this.page.locator("#columns");
    const column = await columnsLocator.locator(`:scope > div:nth-child(${nthChild})[id]`);

    const isVisible = await column.isVisible();
    if (!isVisible) {
      throw new Error(`Column not found`);
    }

    return column;
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
    const customColumnRadio = await columnLocator.getByLabel('Custom column value');
    const customColumnValuesLocator = await columnLocator.locator("#custom-column-values");
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
    }
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
}