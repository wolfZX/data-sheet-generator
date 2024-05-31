// @ts-check
const { test, expect } = require('@playwright/test');
const { DataSheetGeneratorPage } = require('./pageobjects/data-sheet-generator-page');

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
  
    const column = await dataSheetGeneratorPage.getColumn(1);
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
  });

  test('delete column', async ({ page }) => {
    const dataSheetGeneratorPage = new DataSheetGeneratorPage(page);
  
    await dataSheetGeneratorPage.addNewColumn();

    const columnToDelete = await dataSheetGeneratorPage.getColumn(1);
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
    
    const columnToDelete = await dataSheetGeneratorPage.getColumn(2);
    const columnToDeleteId = await columnToDelete.getAttribute("id");
    await dataSheetGeneratorPage.deleteColumn(columnToDeleteId);

    const remainColumns = await dataSheetGeneratorPage.getColumns();
    const remainColumnCount = await remainColumns.count();
    await expect(remainColumnCount).toEqual(1);

    const remainColumn = await dataSheetGeneratorPage.getColumn(1);
    const remainColumnId = await remainColumn.getAttribute("id");
    const { deleteColumnButton } = await dataSheetGeneratorPage.getColumnFields(remainColumnId);
    await expect(deleteColumnButton).toBeDisabled();
  });
});
