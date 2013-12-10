# UMRUM [![Build Status](https://travis-ci.org/frontendbahia/umrum.png?branch=master)](https://travis-ci.org/frontendbahia/umrum)
An open source Real User Monitoring built using NodeJS.

### Install, configure and run

```
$ git clone https://github.com/frontendbahia/umrum.git
$ cd umrum
$ npm install
$ grunt server
```

### Dependencies
- MongoDB: it's necessary to define env variable `MONGO_URI` before running the app or tests (or run a local mongodb);
- Redis: it's necessary to run a local instance of Redis before starting the app;

### Running Grunt before commit

```
$ echo "grunt || exit 1" > .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit
```

### Running unit tests

```
$ grunt unittest
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/frontendbahia/umrum/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

