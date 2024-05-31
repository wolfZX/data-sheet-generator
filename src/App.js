import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Input,
  Stack,
  Radio,
  Select,
  RadioGroup,
  IconButton,
  Heading,
  Flex,
  Container,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Tooltip,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorMode,
  Grid,
  Divider,
  LightMode,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  SmallAddIcon,
  MinusIcon,
  QuestionIcon,
  DownloadIcon,
  WarningTwoIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons"
import { uniqueNamesGenerator, names } from "unique-names-generator";
import randomCountry from "random-country";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

// TODO:
// - [FEATURES] Allow rearrange by drag and drop
// - [ENHANCES] Refract components and err message constants
function App() {
  const defaultColumn = { id: uuidv4(), header: 'Name', category: 'preset', preset_value: 'name', custom_values: [] };
  const [columns, setColumns] = useState([defaultColumn]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    file_name: 'generated_data_sheet',
    sheet_name: "Sheet1",
    row_count: 10,
    format: 'csv',
  });
  const [errors, setErrors] = useState({ columns: {}, settings: {} });

  const { colorMode, toggleColorMode } = useColorMode();
  const warningColor = useColorModeValue('red.500', 'red.300');
  const loadingTimeoutRef = useRef(null);

  const excelFormats = ['xls', 'xlsx'];

  useEffect(() => {
    return () => clearTimeout(loadingTimeoutRef.current);
  }, []);

  const isObjectEmpty = (obj) => (!obj || Object.keys(obj).length === 0);

  const convertTitle = (string) => {
    const formatted = string.replace('_', ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

  const generateAge = (min, max) => {
    if (min && max && min < max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    return 0;
  };

  const generateGender = () => {
    const genders = [
      'female',
      'male',
    ];
    let gender = '';
    for (let i = 0; i <= 200; i++) {
      gender = genders[Math.floor(Math.random() * genders.length)];
    }
    return gender;
  };

  const generateCustomValues = (customValues) => {
    const values = customValues.map((cv) => cv.value);
    return values[Math.floor(Math.random() * customValues.length)];
  };

  const handleChangeSettings = (e) => {
    const name = (e.target && e.target.name) || e.name || '';
    const value = (e.target && e.target.value) || e.value || '';
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'format'
      && !excelFormats.includes(value)
      && errors?.settings?.sheet_name) {
        setErrors((prev) => {
          const cloned = { ...prev };
          delete cloned.settings.sheet_name;
          return cloned;
        })
    }
  };

  const handleChangeInput = (e, id) => {
    const { name, value } = e.target;
    setColumns((prev) => {
      const cloned = Array.from(prev);
      const columnIndex = cloned.findIndex((c) => c.id === id);
      if (cloned[columnIndex].hasOwnProperty(name)) {
        cloned[columnIndex][name] = value;
      } else {
        cloned[columnIndex] = {
          ...cloned,
          [name]: value,
        }
      }
      return cloned;
    })
  };

  const handleChangeRadio = (name, value, id) => {
    setColumns((prev) => {
      const cloned = Array.from(prev);
      const columnIndex = cloned.findIndex((c) => c.id === id);
      if (cloned[columnIndex].hasOwnProperty(name)) {
        cloned[columnIndex][name] = value;
      } else {
        cloned[columnIndex] = {
          ...cloned,
          [name]: value,
        }
      }

      if (value === 'preset') {
        cloned[columnIndex].custom_values = [];
        if (errors?.columns?.[id]?.custom_values) {
          setErrors((prev) => {
            const cloned = { ...prev };
            delete cloned.columns[id].custom_values;
            if (isObjectEmpty(cloned.columns[id])) {
              delete cloned.columns[id];
            };
            return cloned;
          });
        }
      } else if (value === 'custom'){
        cloned[columnIndex] = {
          ...cloned[columnIndex],
          custom_values: [{ id: uuidv4(), value: '' }],
          preset_value: '',
        }
        if (errors?.columns?.[id]?.preset_value) {
          setErrors((prev) => {
            const cloned = { ...prev };
            delete cloned.columns[id].preset_value;
            if (isObjectEmpty(cloned.columns[id])) {
              delete cloned.columns[id];
            };
            return cloned;
          });
        }
      }
      return cloned;
    })
  };

  const handleAddCustomColumnValue = (id, name) => {
    setColumns((prev) => {
      const cloned = Array.from(prev);
      const columnIndex = cloned.findIndex((c) => c.id === id);
      if (cloned?.[columnIndex]) {
        if (cloned[columnIndex].hasOwnProperty(name)) {
          cloned[columnIndex][name].push({ id: uuidv4(), value: '' });
        } else {
          cloned[columnIndex] = {
            ...cloned,
            [name]: [{ id: uuidv4(), value: '' }],
          }
        }
      } else {
        cloned.concat({
          ...defaultColumn,
          id: uuidv4(),
          [name]: [{ id: uuidv4(), value: '' }],
        });
      }
      return cloned;
    })
  };

  const handleRemoveCustomColumnValue = (columnId, id, name) => {
    setColumns((prev) => {
      const cloned = Array.from(prev);
      const columnIndex = cloned.findIndex((c) => c.id === columnId);
      const customValueIndex = cloned?.[columnIndex]?.[name]?.findIndex((cv) => cv.id === id);
      if (customValueIndex >= 0) {
          cloned[columnIndex][name].splice(customValueIndex, 1);
      }
      return cloned;
    })

    if (errors?.columns?.[columnId]?.custom_values?.[id]) {
      setErrors((prev) => {
        const cloned = { ...prev };
        delete cloned.columns[columnId].custom_values[id];
        if (isObjectEmpty(cloned.columns[columnId].custom_values)) {
          delete cloned.columns[columnId].custom_values;
          if (isObjectEmpty(cloned.columns[columnId])) {
            delete cloned.columns[columnId];
          }
        }
        return cloned;
      });
    }
  };

  const handleChangeCustomColumnValue = (e, columnId, id) => {
    const { name, value } = e.target;
    setColumns((prev) => {
      const cloned = Array.from(prev);
      const columnIndex = cloned.findIndex((c) => c.id === columnId);
      const customValueIndex = cloned?.[columnIndex]?.[name]?.findIndex((cv) => cv.id === id);
      if (customValueIndex >= 0) {
        cloned[columnIndex][name][customValueIndex].value = value;
      } else {
        cloned[columnIndex] = {
          ...cloned[columnIndex],
          [name]: [{ id: uuidv4(), value: value }],
        };
      }
      return cloned;
    })
  };

  const handleAddColumn = () => {
    setColumns((prev) => prev.concat({ ...defaultColumn, id: uuidv4() }));
  };

  const handleRemoveColumn = (id) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));

    if (errors?.columns?.[id]) {
      setErrors((prev) => {
        const cloned = { ...prev };
        delete cloned.columns[id];
        return cloned;
      });
    }
  };

  const getFieldLabel = (name) => {
    if (name) {
      switch (name) {
        case 'header':
          return 'Header name';
        default:
          return convertTitle(name);
      }
    }
    return 'n\\a';
  };

  const getFieldValidations = () => {
    const newErrors = { columns: {}, settings: {} };
    columns.forEach((column) => {
      ['header', 'category'].forEach((name) => {
        if (!column[name]) {
          newErrors.columns[column.id] = {
            ...newErrors.columns[column.id],
            [name]: `${getFieldLabel(name)} is required`,
          };
        } else if (name === 'header') {
          const duplicateColumnHeaders = columns.filter((c) => c.id !== column.id && c.header === column.header);
          if (duplicateColumnHeaders.length > 0) {
            duplicateColumnHeaders.forEach((c) => {
              newErrors.columns[c.id] = {
                ...newErrors.columns[c.id],
                [name]: `${getFieldLabel(name)} is duplicated`,
              };
            })
          }
        } else if (name === 'category') {
          if (column.category === 'preset' && !column.preset_value) {
            newErrors.columns[column.id] = {
              ...newErrors.columns[column.id],
              preset_value: `${getFieldLabel('preset_value')} is required`,
            };
          }
      
          if (column.category === 'custom') {
            if (!(column.custom_values && column.custom_values.length > 0)) {
              newErrors.columns[column.id] = {
                ...newErrors.columns[column.id],
                custom_values: {
                  custom_values: `${getFieldLabel('custom_values')} are required`,
                },
              };
            } else if (column.custom_values.filter((cv) => !cv.value).length > 0) {
              column.custom_values.forEach((cv) => {
                if (!cv.value) {
                  if (!newErrors.columns[column.id]) {
                    newErrors.columns[column.id] = {};
                  }
                  if (!newErrors.columns[column.id]?.custom_values) {
                    newErrors.columns[column.id].custom_values = {};
                  }
                  newErrors.columns[column.id].custom_values[cv.id] = `${getFieldLabel('custom_value')} is required`;
                }
              })
            }
          }
        }
      })
    });

    ['file_name', 'row_count', 'format', 'sheet_name'].forEach((name) => {
        if (!settings[name]
          && ((name === 'sheet_name' && excelFormats.includes(settings.format)) || name !== 'sheet_name')) {
          newErrors.settings[name] = `${getFieldLabel(name)} is required.`;
        }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleGenerateDateSheet = () => {
    const err = getFieldValidations();
    
    if (isObjectEmpty(err.columns) && isObjectEmpty(err.settings)) {
      setIsLoading(true);
      const config = {
        dictionaries: [names]
      }
      let rows = [];
  
      if (columns.length > 0) {
        const headers = columns.map((column) => column.header);
        rows.push(headers);
        rows = rows.concat(Array.from({ length: settings.row_count }, () =>
          headers.map((_, colIndex) => {
            const column = columns[colIndex];
            if (column.category) {
              if (column.category === 'preset' && column.preset_value) {
                switch (column.preset_value) {
                  case 'name':
                    return uniqueNamesGenerator(config);
                  case 'id':
                    return uuidv4();
                  case 'age':
                    return generateAge(1, 122);
                  case 'gender':
                    return generateGender();
                  case 'country':
                    return randomCountry({ full: true });
                  default:
                    return 'n/a';
                }
              } else if (column.category === 'custom' && column.custom_values && column.custom_values.length > 0) {
                return generateCustomValues(column.custom_values);
              }
            }
            return 'n/a';
          })
        ));
      }
  
      if (rows.length > 1 && settings.file_name && settings.format) {
        const download = document.createElement('A');
        let url = '';
        let fileName = '';

        if (settings.format === 'csv') {
            const csvContent = rows.map(e => e.join(',')).join('\n');
            url = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
            fileName = `${settings.file_name}.csv`;
        } else if (excelFormats.includes(settings.format)) {
          let blobType = '';
          if (settings.format === 'xls') {
            blobType = 'application/vnd.ms-excel;charset=utf-8';
          } else {
            blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          }
  
          let excelContent = [
            '<?xml version="1.0"?>',
            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"',
            ' xmlns:o="urn:schemas-microsoft-com:office:office"',
            ' xmlns:x="urn:schemas-microsoft-com:office:excel"',
            ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
            ` <Worksheet ss:Name="${settings.sheet_name}">`,
            '   <Table>'
          ];
  
          rows.forEach((row) => {
            excelContent.push('     <Row>');
            row.forEach((cell) => {
              excelContent.push(`       <Cell><Data ss:Type="String">${cell}</Data></Cell>`);
            });
            excelContent.push('     </Row>');
          });
  
          excelContent.push(
            '   </Table>',
            ' </Worksheet>',
            '</Workbook>'
          );
  
          const excelXML = excelContent.join('');
          const blob = new Blob([excelXML], {
            type: blobType,
          });
          url = URL.createObjectURL(blob);
          fileName = `${settings.file_name}.${settings.format}`;
        }

        if (url && fileName) {
          download.setAttribute('href', url);
          download.setAttribute('download', fileName);
          document.body.appendChild(download);
          download.click();
          // Clean up
          URL.revokeObjectURL(url);
          document.body.removeChild(download);
        }
      } else {
        alert('Failed to generate because of incomplete inputs');
      }

      // Just to mock a loading behavior
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
  
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const getErrorMessage = (type, name, columnID, customerValueID) => {
    if (type === 'settings') {
      return errors?.[type]?.[name] || '';
    }

    if (type === 'columns' && name && columnID) {
      if (name === 'custom_values') {
        return (customerValueID && errors?.[type]?.[columnID]?.[name]?.[customerValueID]) || '';
      }
      return errors?.[type]?.[columnID]?.[name] || '';
    }
  };

  const renderWarningIcon = (show) => {
    if (show) {
      return <WarningTwoIcon boxSize='6' color={warningColor} />;
    }
    return null;
  };

  const renderCustomValueInput = (column, customValue) => {
    if (!(column?.id && customValue?.id)) {
      return <Text>Custom value input is missing either it's column ID or input ID. Please delete the whole column or refresh the page and try adding it again.</Text>;
    }
    const errorMessage = getErrorMessage('columns', 'custom_values', column.id, customValue.id);
    return (
      <FormControl
        id={customValue.id}
        key={customValue.id}
        isInvalid={!!errorMessage}
      >
        <Flex align='center'>
          <Input
            name='custom_values'
            value={customValue.value}
            placeholder="Value"
            disabled={isLoading || (column.category && column.category !== 'custom')}
            onChange={(e) => handleChangeCustomColumnValue(e, column.id, customValue.id)}
          />
          <IconButton
            ml='2'
            size='sm'
            isRound={true}
            variant='solid'
            aria-label="Delete custom value"
            isLoading={isLoading}
            disabled={(column.category && column.category !== 'custom') || column.custom_values.length === 1}
            isDisabled={(column.category && column.category !== 'custom') || column.custom_values.length === 1}
            colorScheme='red'
            _dark={{
              bg: 'red.300',
              _hover: {
                bg: 'red.500',
              },
            }}
            icon={<MinusIcon />}
            onClick={() => handleRemoveCustomColumnValue(column.id, customValue.id, 'custom_values')}
          />
        </Flex>
        <FormErrorMessage>{ errorMessage }</FormErrorMessage>
      </FormControl>
    );
  };

  const renderColumn = (column, idx) => {
    let content = null;

    if (!column.id) {
      content = <Text>Column is missing ID. Please delete or refresh the page and try adding it again.</Text>;
    } else {
      const headerErrorMessage = getErrorMessage('columns', 'header', column.id);
      const categoryErrorMessage = getErrorMessage('columns', 'category', column.id);
      const presetValueErrorMessage = getErrorMessage('columns', 'preset_value', column.id);
      const customValuesErrorMessage = getErrorMessage('columns', 'custom_values', column.id, 'custom_values');
      content = (
        <>
          <FormControl mb='5' isRequired isInvalid={!!headerErrorMessage}>
            <FormLabel mb='2'>Header name</FormLabel>
            <Input
              name='header'
              placeholder="Column header name"
              value={column.header}
              disabled={isLoading}
              onChange={(e) => handleChangeInput(e, column.id)}
            />
            <FormErrorMessage>{ headerErrorMessage }</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!!categoryErrorMessage}>
            <FormLabel mb='2'>Category</FormLabel>
            <RadioGroup
              colorScheme='teal'
              isDisabled={isLoading}
              onChange={(value) => handleChangeRadio('category', value, column.id)}
              value={column.category}
            >
              <Stack>
                <Radio value='preset'>
                  Preset column value
                  <Tooltip label="This selection will randomly fill in the column with generated values based on the selected option.">
                    <QuestionIcon ml='1' />
                  </Tooltip>
                </Radio>
                <FormControl isInvalid={!!presetValueErrorMessage} pl='5'>
                  <Select
                    name='preset_value'
                    placeholder="Select values type"
                    disabled={(column.category && column.category !== 'preset') || isLoading}
                    value={column.preset_value || ''}
                    onChange={(e) => handleChangeInput(e, column.id)}
                  >
                    <option value='id'>ID</option>
                    <option value='name'>Name</option>
                    <option value='age'>Age</option>
                    <option value='gender'>Gender</option>
                    <option value='country'>Country</option>
                  </Select>
                  <FormErrorMessage>{ presetValueErrorMessage }</FormErrorMessage>
                </FormControl>

                <Radio value='custom'>
                  Custom column value
                  <Tooltip label="This selection will randomly fill in the column with the values you provided.">
                    <QuestionIcon ml='1' />
                  </Tooltip>
                </Radio>
                <Box id="custom-column-values" pl='5'>
                  <Stack>
                    { column?.custom_values?.map((cv) => renderCustomValueInput(column, cv)) }
                  </Stack>
                  <FormControl isInvalid={!!customValuesErrorMessage}>
                    <FormErrorMessage>
                      { customValuesErrorMessage }
                    </FormErrorMessage>
                  </FormControl>
                </Box>
                <Flex justify='flex-end' mt='2'>
                  <LightMode>
                    <Button
                      leftIcon={<SmallAddIcon />}
                      isLoading={isLoading}
                      colorScheme='teal'
                      disabled={(column.category && column.category !== 'custom')}
                      isDisabled={(column.category && column.category !== 'custom')}
                      onClick={() => handleAddCustomColumnValue(column.id, 'custom_values')}
                    >
                      New value
                    </Button>
                  </LightMode>
                </Flex>
              </Stack>
            </RadioGroup>
            <FormErrorMessage>{ categoryErrorMessage }</FormErrorMessage>
          </FormControl>
        </>
      );
    }

    return (
      <Box id={column.id} key={column.id} border='1px' borderRadius='md' p='5' mb='5'>
        <Flex mb='5' justifyContent='space-between' alignItems='center'>
          <Heading as='h3' size='md'>Column {idx + 1}</Heading>
          <IconButton
            ml='2'
            size='sm'
            isRound={true}
            variant='solid'
            aria-label="Delete column"
            isLoading={isLoading}
            colorScheme='red'
            _dark={{
              bg: 'red.300',
              _hover: {
                bg: 'red.500',
              },
            }}
            icon={<MinusIcon />}
            disabled={columns && columns.length === 1}
            isDisabled={columns && columns.length === 1}
            onClick={() => handleRemoveColumn(column.id)}
          />
        </Flex>
        <Divider mb='5' />
        { content }
      </Box>
    );
  };

  const fileNameErrorMessage = getErrorMessage('settings', 'file_name');
  const sheetNameErrorMessage = getErrorMessage('settings', 'sheet_name');
  const rowCountErrorMessage = getErrorMessage('settings', 'row_count');
  const formatErrorMessage = getErrorMessage('settings', 'format');
  return (
    <Flex className='App' width='full' justify='center'>
      <Container maxW='750px'>
        <Flex alignItems='center' justifyContent='end'>
          <IconButton
            aria-label="Light Dark Mode"
            isRound={true}
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
          />
        </Flex>
        <Flex flexDirection='column' alignItems='center' my='5' textAlign='center'>
          <Heading mb='2'>Data sheet generator</Heading>
          <Text>
            Generate a data sheet with mocked data for your testing that related to importing data sheet.
          </Text>
        </Flex>
        <Divider mb='5' />
        <Flex gap='2' alignItems='baseline'>
          <Heading as='h3' size='lg' mb='5'>
            Spreadsheet columns
          </Heading>
          { renderWarningIcon(!isObjectEmpty(errors.columns)) }
        </Flex>
        <Box id="columns">
          { columns.map((column, idx) => renderColumn(column, idx)) }
          <Flex justify='flex-end'>
            <LightMode>
              <Button
                leftIcon={<SmallAddIcon />}
                isLoading={isLoading}
                colorScheme='teal'
                onClick={handleAddColumn}
              >
                New column
              </Button>
            </LightMode>
          </Flex>
        </Box>
        <Box mt='5'>
          <Flex gap='2' alignItems='baseline'>
            <Heading as='h3' size='lg' mb='5'>
              Spreadsheet settings
            </Heading>
            { renderWarningIcon(!isObjectEmpty(errors.settings)) }
          </Flex>
          <Grid id="settings" gap='2' templateColumns={['repeat(1, 1fr)', null, 'repeat(2, 1fr)']}>
            <FormControl width='full' isRequired isInvalid={fileNameErrorMessage}>
              <FormLabel mb='2'>
                File name
              </FormLabel>
              <Input
                name='file_name'
                placeholder="File name"
                value={settings.file_name}
                disabled={isLoading}
                onChange={handleChangeSettings}
              />
              <FormErrorMessage>{ fileNameErrorMessage }</FormErrorMessage>
            </FormControl>
            <FormControl width='full' isRequired={settings.format && excelFormats.includes(settings.format)} isInvalid={sheetNameErrorMessage}>
              <FormLabel mb='2'>
                Sheet name
                <Tooltip label={`Applicable to these formats only: ${excelFormats.join(', ')}.`}>
                  <QuestionIcon ml='1' />
                </Tooltip>
              </FormLabel>
              <Input
                name='sheet_name'
                placeholder="Sheet name"
                value={settings.sheet_name}
                disabled={isLoading || !(settings.format && excelFormats.includes(settings.format))}
                onChange={handleChangeSettings}
              />
              <FormErrorMessage>{ sheetNameErrorMessage }</FormErrorMessage>
            </FormControl>
            <FormControl width='full' isRequired isInvalid={errors.settings && errors.settings.row_count}>
              <FormLabel mb='2'>
                Amount of rows
                <Tooltip label="Determine how many rows of data will be generated inside the sheet (Excluding header's row).">
                  <QuestionIcon ml='1' />
                </Tooltip>
              </FormLabel>
              <NumberInput
                defaultValue={settings.row_count}
                min={2}
                max={1000000}
                disabled={isLoading}
                onChange={(value) => handleChangeSettings({ name: 'row_count', value })}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormErrorMessage>{ rowCountErrorMessage }</FormErrorMessage>
            </FormControl>
            <FormControl width='full' isRequired isInvalid={errors.settings && errors.settings.format}>
              <FormLabel mb='2'>
                File format
              </FormLabel>
              <Select
                name='format'
                placeholder="Select format"
                disabled={isLoading}
                value={settings.format || ''}
                onChange={handleChangeSettings}
              >
                <option value='csv'>.csv</option>
                <option value='xls'>.xls</option>
                <option value='xlsx'>.xlsx</option>
              </Select>
              <FormErrorMessage>{ formatErrorMessage }</FormErrorMessage>
            </FormControl>
          </Grid>
        </Box>
        <LightMode>
          <Button
            my='5'
            width='full'
            leftIcon={<DownloadIcon />}
            isLoading={isLoading}
            colorScheme='teal'
            onClick={handleGenerateDateSheet}
          >
            Download Spreadsheet
          </Button>
        </LightMode>
      </Container>
    </Flex>
  );
}

export default App;
