'use strict';

const mongoose = require('mongoose'),
  mongoosePaginate = require('mongoose-paginate'),
  Schema = mongoose.Schema;

//getter for Date field
function transformDate(d) {
  if (!d) {
    return d;
  }
  return `${("0" + d.getDate()).slice(-2)}-${("0"+(d.getMonth()+1)).slice(-2)}-${
    d.getFullYear()} ${("0" + d.getHours()).slice(-2)}:${("0" + d.getMinutes()).slice(-2)}:${("0" + d.getSeconds()).slice(-2)}`;
}

const DeviceSchema = new Schema({
  name: String,
  data: Schema.Types.Mixed,
  date: {type: Date, default: Date.now, get: transformDate}
});
DeviceSchema.plugin(mongoosePaginate);

mongoose.model('Device', DeviceSchema);

