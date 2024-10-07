import { PrismaClient } from '@prisma/client';
import { Consts } from '../utilities/constants';

import { genDataFieldTypeCode } from '../utilities/functions';

const prisma = new PrismaClient();

async function main() {
  // Consts.DEFAULT_FIELD_TYPES.forEach(async (ftype) => {
  //   await prisma.dataFieldType.deleteMany({});
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //   await prisma.dataFieldType.create({
  //     data: {
  //       code: genDataFieldTypeCode(),
  //       label: ftype['label'],
  //       value: ftype['value'],
  //       description: `Il s'agit du type de champ ${ftype['label']}`,
  //     },
  //   });
  // });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
