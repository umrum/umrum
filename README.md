# UMRUM [![wercker status](https://app.wercker.com/status/6352eaeefa758f4d3b98d6de80d8e82c/s/master "wercker status")](https://app.wercker.com/project/bykey/6352eaeefa758f4d3b98d6de80d8e82c)
An open source Real User Monitoring built using NodeJS.

### Dependencies
- MongoDB: it's necessary to define env variable `MONGO_URI` before running the app or tests (or run a local mongodb);
- Redis: it's necessary to run a local instance of Redis before starting the app;


### Running with [azk](https://github.com/azukiapp/azk)

```bash
git clone https://github.com/umrum/umrum.git && cd umrum
azk start
azk shell umrum -c 'npm run watch-assets'
azk shell umrum -c 'npm run watch-webpack'
```


### Running without provision

```bash
git clone https://github.com/umrum/umrum.git && cd umrum
# start redis-server
# start mongo-server
# check Azkfile.js and set the environment's variables to you own env
npm install
npm run watch-assets &
npm run watch-webpack &
npm start
```


### Running unit tests

```bash
$ grunt unittest
```


### Set pre-commit trigger

```bash
$ echo "grunt unittest || exit 1" > .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit
```
