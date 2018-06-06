# Water scraping

## Installation

### Requirements
In order to run locally you need to install and have running MongoDB and Node.js as services on your machine.
Details how to connect to MongoDB you can find in config.js file which is in root directory of the Micro-service.

Other important packages(best installed globally) that you need are gulp, mocha, nodemon

### Gitlab
After you clone or checked out from Gitlab repository, go to the project's directory and run commands
```sh
$ npm install (this will install all dependencies needed)
$ npm start   (this will start the server)
or
$ nodemon
or
$ gulp
```
### Run tests
   ```sh
$ npm test
```

## PM2 package
Info: https://github.com/Unitech/pm2, http://pm2.keymetrics.io/

Ensure that package pm2 is installed on your environment.

Important file is ecosystem.json, which holds configuration for app:
1. watcher for files, whenever there is change within a file restart server
2. which files not to watch
3. make clustering and load balancer
4. set the environments

In order to check state of the app or start the app use this steps:
   ```sh
$ cd /your-folder/
$ pm2 list (check if there is anything running, if not go to 3. step)
$ pm2 start ecosystem.json (start server and cronjob)
```
If you change the ecosystem.json file do the following
   ```sh
$ cd /your-folder/
$ pm2 delete ecosystem.json
$ pm2 start ecosystem.json
```

## MongoDB

Devices collection and indexing:

```
const DeviceSchema = new Schema({
  name: String,
  data: Schema.Types.Mixed,
  date: {type: Date, default: Date.now, get: transformDate}
});
```

## API

### GET /
Home route

### GET /reports
Route to get form for reports

### POST /reports
Route to post data to backend and get in response Excel file

### GET /scrape
Route to start scraping data from website

### GET /devices
Route to get all data from database and show them in table to the user

### GET /devices/:id
Route to get data of device

### PUT /devices/:id
Route to edit data of device

### DELETE /devices/:id
Route to delete device

### GET /healthcheck
Invoked when health check is needed
Route with information about the health of MongoDB and Scrape links,
test if we can connect to those services
