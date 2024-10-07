export class Consts {
  static APP_NAME: string = 'NETWORK-CORE-SYSTEM';
  static APP_VERSION: string = '1.0.0';
  static APP_DESCRIPTION: string = 'NETWORK Core System';
  static PORT_SYSTEM: number = 2525;

  static GUARDIAN_SYSTEM_VERBOSE: boolean = false;

  static DEFAULT_INPUT_LANG: string = 'en';
  static DEFAULT_OUTPUT_LANG: string = 'fr';

  static DEFAULT_ROLE_WEB: string = 'web';
  static DEFAULT_ROLE_JOB: string = 'job';

  static DEFAULT_ROLES: string[] = [
    Consts.DEFAULT_ROLE_WEB,
    Consts.DEFAULT_ROLE_JOB,
  ];

  static DEFAULT_FILLING_TYPES: string[] = ['manual', 'automatic', 'mixed'];

  static MAP_ROLE_FILLING_TYPES: object = {
    [Consts.DEFAULT_ROLE_WEB]: [
      Consts.DEFAULT_FILLING_TYPES[0],
      Consts.DEFAULT_FILLING_TYPES[2],
    ],
    [Consts.DEFAULT_ROLE_JOB]: [
      Consts.DEFAULT_FILLING_TYPES[1],
      Consts.DEFAULT_FILLING_TYPES[2],
    ],
  };

  static DEFAULT_FIELD_TYPES: object[] = [
    {
      label: 'Simple Text',
      value: 'simple-text',
    },
    {
      label: 'Long Text',
      value: 'long-text',
    },
    {
      label: 'Email',
      value: 'email',
    },
    {
      label: 'Uuid',
      value: 'uuid',
    },
    {
      label: 'Number',
      value: 'number',
    },
    {
      label: 'Integer',
      value: 'integer',
    },
    {
      label: 'Float',
      value: 'float',
    },
    {
      label: 'Date',
      value: 'date',
    },
    {
      label: 'Time',
      value: 'time',
    },
    {
      label: 'Datetime',
      value: 'datetime',
    },
    {
      label: 'Boolean',
      value: 'boolean',
    },
    {
      label: 'Select',
      value: 'select',
    },
  ];
}
