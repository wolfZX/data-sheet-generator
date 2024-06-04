// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { DataSheetGeneratorPage } = require('./pageobjects/data-sheet-generator-page');

// NOTE: Not locators or selectors in spec file

test.beforeEach(async ({ page }) => {
  const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
  await dataSheetGeneratorPage.goto();
  await expect(page.url()).toBe('http://localhost:3000/');
});

test.describe('Initial load', () => {
  test('have title', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    await expect(dataSheetGeneratorPage.page).toHaveTitle("Data sheet generator");
  });

  test('have default column values', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
  
    const initialColumns = await dataSheetGeneratorPage.getColumns();
    const initialColumnCount = await initialColumns.count();
    await expect(initialColumnCount).toEqual(1);
  
    const column = await dataSheetGeneratorPage.getColumn({ nthChild: 1 });
    const columnId = await column.getAttribute("id");
    const columnHeader = await dataSheetGeneratorPage.getColumnHeader(columnId)
    await expect(columnHeader).toHaveText(`Column 1`);

    const columnFields = await dataSheetGeneratorPage.getColumnFields(columnId);
    const {
      headerNameInput,
      presetColumnRadio,
      presetColumnSelect,
      presetColumnOptions,
      customColumnRadio,
      newCustomColumnValueButton,
    } = columnFields;
    await expect(headerNameInput).toBeVisible();
    await expect(headerNameInput).toHaveValue("Name");
    await expect(presetColumnRadio).toBeVisible();
    await expect(presetColumnRadio).toBeChecked();
    await expect(presetColumnSelect).toBeVisible();
    await expect(presetColumnSelect).toHaveValue("name");
    const optionLabels = ["Select values type", "ID", "Name", "Age", "Gender", "Country"];
    await expect(presetColumnOptions).toHaveText(optionLabels);
    await expect(customColumnRadio).toBeVisible();
    await expect(customColumnRadio).not.toBeChecked();
    await expect(newCustomColumnValueButton).toBeVisible();
    await expect(newCustomColumnValueButton).toBeDisabled();
    await expect(dataSheetGeneratorPage.newColumnButton).toBeVisible();
  });

  test('have default setting values', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    const settingFields = await dataSheetGeneratorPage.getSettingFields();
    const {
      fileNameInput,
      sheetNameInput,
      amountOfRowsInput,
      formatSelect,
      formatSelectOptions,
    } = settingFields;
      await expect(fileNameInput).toBeVisible();
      await expect(fileNameInput).toHaveValue('generated_data_sheet');
      await expect(sheetNameInput).toBeVisible();
      await expect(sheetNameInput).toHaveValue('Sheet1');
      await expect(sheetNameInput).toBeDisabled();
      await expect(amountOfRowsInput).toBeVisible();
      await expect(amountOfRowsInput).toHaveValue('10');
      await expect(formatSelect).toBeVisible();
      await expect(formatSelect).toHaveValue('csv');
      const optionLabels = ["Select format", ".csv", ".xls", ".xlsx"];
      await expect(formatSelectOptions).toHaveText(optionLabels);
  });

  test('have download button', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    await expect(dataSheetGeneratorPage.downloadSpreadsheetButton).toBeVisible();
  });
});

test.describe('Columns test', () => {
  test.beforeEach(async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    await dataSheetGeneratorPage.addNewColumn();
  });

  test('add new column', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
  
    const newColumns = await dataSheetGeneratorPage.getColumns();
    const newColumnCount = await newColumns.count();
    await expect(newColumnCount).toEqual(2);

    const column = await dataSheetGeneratorPage.getColumn({ nthChild: 2 });
    const columnId = await column.getAttribute("id");
    const columnHeader = await dataSheetGeneratorPage.getColumnHeader(columnId)
    await expect(columnHeader).toHaveText(`Column 2`);

    const columnFields = await dataSheetGeneratorPage.getColumnFields(columnId);
    const {
      headerNameInput,
      presetColumnRadio,
      presetColumnSelect,
      presetColumnOptions,
      customColumnRadio,
      newCustomColumnValueButton,
    } = columnFields;
    await expect(headerNameInput).toBeVisible();
    await expect(headerNameInput).toHaveValue("Name");
    await expect(presetColumnRadio).toBeVisible();
    await expect(presetColumnRadio).toBeChecked();
    await expect(presetColumnSelect).toBeVisible();
    await expect(presetColumnSelect).toHaveValue("name");
    const optionLabels = ["Select values type", "ID", "Name", "Age", "Gender", "Country"];
    await expect(presetColumnOptions).toHaveText(optionLabels);
    await expect(customColumnRadio).toBeVisible();
    await expect(customColumnRadio).not.toBeChecked();
    await expect(newCustomColumnValueButton).toBeVisible();
    await expect(newCustomColumnValueButton).toBeDisabled();
    await expect(dataSheetGeneratorPage.newColumnButton).toBeVisible();
  });

  test('delete column', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
  
    await dataSheetGeneratorPage.addNewColumn();

    const columnToDelete = await dataSheetGeneratorPage.getColumn({ nthChild: 1 });
    const columnToDeleteId = await columnToDelete.getAttribute("id");
    await dataSheetGeneratorPage.deleteColumn(columnToDeleteId);

    const remainColumns = await dataSheetGeneratorPage.getColumns();
    const remainColumnCount = await remainColumns.count();
    const columnIds = [];
    for (let i = 0; i < remainColumnCount; i++) {
      const column = remainColumns.nth(i)
      const columnId = await column.getAttribute("id");
      columnIds.push(columnId);
    }

    await expect(remainColumnCount).toEqual(2);
    await expect(columnIds).not.toContain(columnToDeleteId);
  });

  test('disable delete column button if only one column left', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    
    const columnToDelete = await dataSheetGeneratorPage.getColumn({ nthChild: 2 });
    const columnToDeleteId = await columnToDelete.getAttribute("id");
    await dataSheetGeneratorPage.deleteColumn(columnToDeleteId);

    const remainColumns = await dataSheetGeneratorPage.getColumns();
    const remainColumnCount = await remainColumns.count();
    await expect(remainColumnCount).toEqual(1);

    const remainColumn = await dataSheetGeneratorPage.getColumn({ nthChild: 1 });
    const remainColumnId = await remainColumn.getAttribute("id");
    const { deleteColumnButton } = await dataSheetGeneratorPage.getColumnFields(remainColumnId);
    await expect(deleteColumnButton).toBeDisabled();
  });

  test('select custom column values category', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);

    const column = await dataSheetGeneratorPage.getColumn({ nthChild: 1 });
    const columnId = await column.getAttribute("id");
    const columnFields = await dataSheetGeneratorPage.getColumnFields(columnId);
    const {
      presetColumnRadio,
      presetColumnSelect,
      customColumnRadio,
      newCustomColumnValueButton,
      newCustomColumnValueInputs,
    } = columnFields;
    await customColumnRadio.click({ force: true }); // Force click due to Chakra radio span intercept the pointer
    await expect(customColumnRadio).toBeChecked();
    await expect(presetColumnRadio).not.toBeChecked();
    await expect(presetColumnSelect).toBeDisabled();
    await expect(newCustomColumnValueButton).toBeEnabled();
    
    const customColumnValueInputCount = await newCustomColumnValueInputs.count();
    await expect(customColumnValueInputCount).toEqual(1);

    const { customColumnValueInputLocator, deleteCustomColumnValueButton } = await dataSheetGeneratorPage.getCustomColumnValueInput({ columnId, nthChild: 1 });
    await expect(customColumnValueInputLocator).toBeVisible();
    await expect(deleteCustomColumnValueButton).toBeDisabled();
  });

  test('add new custom column value', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);

    const column = await dataSheetGeneratorPage.getColumn({ nthChild: 1 });
    const columnId = await column.getAttribute("id");
    const columnFields = await dataSheetGeneratorPage.getColumnFields(columnId);
    const {
      customColumnRadio,
      newCustomColumnValueInputs,
    } = columnFields;
    await customColumnRadio.click({ force: true });

    const customColumnValueInput = await dataSheetGeneratorPage.getCustomColumnValueInput({ columnId, nthChild: 1 });
    await dataSheetGeneratorPage.addNewCustomColumnValue(columnId);
  
    const newCustomColumnValueInputCount = await newCustomColumnValueInputs.count();
    await expect(newCustomColumnValueInputCount).toEqual(2);
    await expect(customColumnValueInput.deleteCustomColumnValueButton).toBeEnabled();
  
    const customColumnValueInputTwo = await dataSheetGeneratorPage.getCustomColumnValueInput({ columnId, nthChild: 2 });
    await expect(customColumnValueInputTwo.customColumnValueInputLocator).toBeVisible();
    await expect(customColumnValueInputTwo.deleteCustomColumnValueButton).toBeEnabled();
  });

  test('delete new custom column value', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);

    const column = await dataSheetGeneratorPage.getColumn({ nthChild: 1 });
    const columnId = await column.getAttribute("id");
    const columnFields = await dataSheetGeneratorPage.getColumnFields(columnId);
    const {
      customColumnRadio,
      newCustomColumnValueInputs,
    } = columnFields;
    await customColumnRadio.click({ force: true });
    await dataSheetGeneratorPage.addNewCustomColumnValue(columnId);
  
    const customColumnValueInput = await dataSheetGeneratorPage.getCustomColumnValueInput({ columnId, nthChild: 1 });
    const customColumnValueInputToBeDelete = await dataSheetGeneratorPage.getCustomColumnValueInput({ columnId, nthChild: 2 });
    const customValueToDeleteId = await customColumnValueInputToBeDelete.customColumnValueInputLocator.getAttribute("id");
    await dataSheetGeneratorPage.deleteCustomColumnValue({ columnId, id: customValueToDeleteId });
  
    const newCustomColumnValueInputCount = await newCustomColumnValueInputs.count();
    await expect(newCustomColumnValueInputCount).toEqual(1);
    await expect(customColumnValueInputToBeDelete.customColumnValueInputLocator).not.toBeVisible();
    await expect(customColumnValueInputToBeDelete.deleteCustomColumnValueButton).not.toBeVisible();
    await expect(customColumnValueInput.deleteCustomColumnValueButton).toBeDisabled();
  });
});

test.describe('Download test', () => {
  test('with default settings', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    const download = await dataSheetGeneratorPage.downloadSpreadsheet();
    // Wait for the download to complete
    const downloadPath = await download.path();
    // Get the suggested filename
    const suggestedFilename = download.suggestedFilename();
    const settingFields = await dataSheetGeneratorPage.getSettingFields();
    const { fileNameInput } = settingFields;
    // Define the expected filename
    const fileNameInputValue = await fileNameInput.inputValue();
    const expectedFilename = `${fileNameInputValue}.csv`;
  
    // Check if the download path exists
    if (!fs.existsSync(downloadPath)) {
      throw new Error(`File was not downloaded: ${downloadPath}`);
    }
  
    // Check if the downloaded file has the expected filename
    if (suggestedFilename !== expectedFilename) {
      throw new Error(`Expected filename to be ${expectedFilename} but got ${suggestedFilename}`);
    }
  
    // Clean up - remove the downloaded file
    fs.unlinkSync(downloadPath);
  });

  test('with different sheet name', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    const { fileNameInput } = await dataSheetGeneratorPage.getSettingFields();
    const newFileName = "New data sheet name";
    await fileNameInput.fill(newFileName);

    const download = await dataSheetGeneratorPage.downloadSpreadsheet();
    const downloadPath = await download.path();
    const suggestedFilename = download.suggestedFilename();
    const expectedFilename = `${newFileName}.csv`;
  
    if (!fs.existsSync(downloadPath)) {
      throw new Error(`File was not downloaded: ${downloadPath}`);
    }
  
    if (suggestedFilename !== expectedFilename) {
      throw new Error(`Expected filename to be ${expectedFilename} but got ${suggestedFilename}`);
    }
  
    fs.unlinkSync(downloadPath);
  });

  test('with different format', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
    const {
      sheetNameInput,
      fileNameInput,
      formatSelect,
    } = await dataSheetGeneratorPage.getSettingFields();

    await formatSelect.selectOption("xls");
    await expect(sheetNameInput).toBeEnabled();

    const download = await dataSheetGeneratorPage.downloadSpreadsheet();
    const downloadPath = await download.path();
    const suggestedFilename = download.suggestedFilename();
    const fileNameInputValue = await fileNameInput.inputValue();
    const fileFormatValue = await formatSelect.inputValue();
    const expectedFilename = `${fileNameInputValue}.${fileFormatValue}`;
  
    if (!fs.existsSync(downloadPath)) {
      throw new Error(`File was not downloaded: ${downloadPath}`);
    }
  
    if (suggestedFilename !== expectedFilename) {
      throw new Error(`Expected filename to be ${expectedFilename} but got ${suggestedFilename}`);
    }
  
    fs.unlinkSync(downloadPath);
  });
})
