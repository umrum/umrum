# UMRUM [![wercker status](https://app.wercker.com/status/6352eaeefa758f4d3b98d6de80d8e82c/s/master "wercker status")](https://app.wercker.com/project/bykey/6352eaeefa758f4d3b98d6de80d8e82c)
An open source Real User Monitoring built using NodeJS.

Visit the [umrum.io](http://umrum.io) website to know more.

### Install, configure and run

```
$ git clone https://github.com/umrum/umrum.git
$ cd umrum
$ npm install
$ grunt server
```

### Dependencies
- MongoDB: it's necessary to define env variable `MONGO_URI` before running the app or tests (or run a local mongodb);
- Redis: it's necessary to run a local instance of Redis before starting the app;

### Running Grunt before commit

```
$ echo "grunt unittest || exit 1" > .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit
```

### Running unit tests

```
$ grunt unittest
```

### License
MIT License

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/umrum/umrum/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

