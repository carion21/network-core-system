import * as randomstring from 'randomstring';
import * as moment from 'moment';
import { Consts } from './constants';
import axios from 'axios';
import * as slug from 'slug';
import {
  isBoolean,
  isEmail,
  isInt,
  isNotEmpty,
  isNumber,
  isString,
  isUUID,
} from 'class-validator';
import { Workbook } from 'exceljs';
import { generateUsername } from 'unique-username-generator';

const getSlug = (text: string) => {
  return slug(text, {
    lower: true,
    locale: 'fr',
  });
};

const generateFriendlyUsername = () => {
  return generateUsername('-');
};

const translate = (text: string) => {
  return text;
};

const generateNumberCodeSpecial = () => {
  return randomstring.generate({
    length: 4,
    charset: '1234567890',
  });
};

const generatePassword = () => {
  return randomstring.generate({
    length: 32,
    // charset: 'alphanumeric',
    charset: 'alphanumeric',
  });
};

const generateCode = (keyword: string) => {
  const now = moment();
  const suffix =
    now.format('YYMMDDHH_mmss').substring(2) +
    '_' +
    generateNumberCodeSpecial();
  return keyword + '' + suffix;
};

const genEntityCode = () => {
  return generateCode('ENT');
};

const genProfileCode = () => {
  return generateCode('PRF');
};

const genDistributionChannelCode = () => {
  return generateCode('DTC');
};

const genNodeTypeCode = () => {
  return generateCode('NTY');
};

const genNodeCode = () => {
  return generateCode('NDE');
};

const genIndividualCode = () => {
  return generateCode('IND');
};

const genDataFieldTypeCode = () => {
  return generateCode('DFT');
};

const genDataFieldCode = () => {
  return generateCode('DFD');
};

const control_data = (inputs: object) => {
  const result = {
    success: true,
    message: 'Data is valid',
  };

  let error = '';

  try {
    const mapFieldTypes = inputs['mapFieldTypes'];
    const allFields = inputs['allFields'];
    const requiredFields = inputs['requiredFields'];
    const data = inputs['data'];
    const dataKeys = Object.keys(data);

    // check if all required fields are present
    const missingFields = requiredFields.filter(
      (field: string) => !dataKeys.includes(field),
    );
    if (missingFields.length > 0) {
      error = `Missing required fields: ${missingFields.join(', ')}`;
    }

    const presentFields = allFields.filter((field: string) =>
      dataKeys.includes(field),
    );

    // const unknownFields = dataKeys.filter((field: string) => !allFields.includes(field));

    // check if the field type is correct
    presentFields.forEach((field: string) => {
      const field_type = mapFieldTypes[field];
      const field_value = data[field];
      const control = control_field_type(field, field_value, field_type);
      if (!control.success) {
        error = control.message;
      }
    });
  } catch (err) {
    error = err;
  }

  if (error) {
    result.success = false;
    result.message = error;
  }

  return result;
};

const control_field_type = (field: string, value: any, field_type: string) => {
  let result = {
    success: false,
    message: 'The field is valid',
  };

  let error = '';

  switch (field_type) {
    case 'simple-text':
      if (isString(value) && isNotEmpty(value) && value.length <= 255) {
        result.success = true;
      } else {
        error = 'the field ' + field + ' must be a simple text and not empty';
      }
      break;
    case 'long-text':
      if (isString(value) && isNotEmpty(value)) {
        result.success = true;
      } else {
        error = 'the field ' + field + ' must be a long text and not empty';
      }
      break;
    case 'email':
      if (isEmail(value)) {
        result.success = true;
      } else {
        error = 'the field ' + field + ' must be an email';
      }
      break;
    case 'uuid':
      if (isUUID(value)) {
        result.success = true;
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a uuid';
      }
      break;
    case 'date':
      if (isString(value) && isNotEmpty(value)) {
        if (moment(value, 'YYYY-MM-DD').isValid()) {
          result.success = true;
        }
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a string date';
      }
      break;
    case 'time':
      if (isString(value) && isNotEmpty(value)) {
        if (moment(value, 'HH:mm:ss').isValid()) {
          result.success = true;
        }
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a string time';
      }
      break;
    case 'datetime':
      if (isString(value) && isNotEmpty(value)) {
        if (moment(value, 'YYYY-MM-DD HH:mm:ss').isValid()) {
          result.success = true;
        }
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a string datetime';
      }
      break;
    case 'boolean':
      if (isBoolean(value)) {
        result.success = true;
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a boolean';
      }
      break;
    case 'integer':
      if (isInt(value)) {
        result.success = true;
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a integer';
      }
      break;
    case 'number':
      if (isNumber(value)) {
        result.success = true;
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a number';
      }
      break;
    case 'float':
      if (isNumber(value)) {
        result.success = true;
      }
      if (!result.success) {
        error = 'the field ' + field + ' must be a float';
      }
      break;
    default:
      error = 'the field ' + field + ' has an unknown type';
      break;
  }

  if (error != '') {
    result.message = error;
  }

  return result;
};

const generateWorksheetBuffer = (columns: string[]) => {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  sheet.columns = columns.map((column) => {
    return { header: column, key: column, width: 32 };
  });
  return workbook.xlsx.writeBuffer();
};

const formatNodeData = (node: object) => {
  let data = {};
  for (const individual of node['Individual']) {
    const dataRows = individual['DataRow'];
    for (const dataRow of dataRows) {
      data[dataRow['dataField']['slug']] = dataRow['value'];
    }
  }
  return {
    id: node['id'],
    label: node['label'],
    nodeType: {
      id: node['nodeType']['id'],
      label: node['nodeType']['label']
    },
    expanded: true,
    type: 'person',
    data: data,
  };
};

export {
  getSlug,
  generateFriendlyUsername,
  translate,
  genEntityCode,
  generatePassword,
  genProfileCode,
  genDistributionChannelCode,
  genNodeTypeCode,
  genNodeCode,
  genIndividualCode,
  genDataFieldTypeCode,
  genDataFieldCode,
  control_data,
  generateWorksheetBuffer,
  formatNodeData,
};
