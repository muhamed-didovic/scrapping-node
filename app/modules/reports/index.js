'use strict';

const moment = require('moment'),
  _ = require('lodash'),
  excel = require('exceljs');

// @flow
module.exports = docs => {
  console.log(moment().format(), `Entered reports module with data length ${docs.length}`);

  const workbook = new excel.Workbook();
  workbook.created = new Date();
  workbook.modified = new Date();

  const docsGroupedByName = _.groupBy(docs, 'name');
  let worksheet = '';
  _(docsGroupedByName).each((elem, key) => {
    worksheet = workbook.addWorksheet(key);
    _(elem).each(properties => {
      worksheet.addRow(['', '']);
      worksheet.addRow(['Date', properties.date]);//moment(properties.date).utc().toString()
      _(properties.data).each((prop, ke) => {
        // if (ke === 'DeviceName') {
        //   worksheet.addRow(['Date', moment(properties.date).utc().toString()]);
        // }
        worksheet.addRow([ke, prop]);
      });
    });

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 50 },
      { header: 'Value', key: 'value', width: 50 }
    ];
  });
  console.log(moment().format(), `End of reports module`);
  return workbook;
};
