#UMRUM
An open source Real User Monitoring

###Install, configure and running

```
$ git clone https://github.com/frontendbahia/umrum.git
$ cd umrum
$ npm install
$ nodemon server.js -e js,html
```

###Running grunt before commit

```
$ echo "grunt || exit 1" > .git/hooks/pre-commit
$ chmod +x .git/hooks/pre-commit
```

###Running unit tests

```
$ grunt unittest
```
