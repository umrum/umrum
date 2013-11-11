#UMRUM
An open source Real User Monitoring

###Install, configure and running

```
$ git clone git@github.com:nko4/frontend-bahia.git
$ cd frontend-bahia
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
