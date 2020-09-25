[![codecov](https://codecov.io/gh/pavlobu/test-electron-boilerplate-ci/branch/master/graph/badge.svg)](https://codecov.io/gh/pavlobu/deskreen)
![build and test](https://github.com/pavlobu/deskreen/workflows/build%20and%20test/badge.svg?event=pull_request)
![release all os -- no code signing](https://github.com/pavlobu/deskreen/workflows/release%20all%20os%20--%20no%20code%20signing/badge.svg)
![codecov generate](https://github.com/pavlobu/deskreen/workflows/codecov%20generate/badge.svg)

## Howto:

### to generate test coverage results

```
yarn coverage
```

### to run sonarqube scanner to put results to sonarqube

```
sonar-scanner
```

### sonar-project.properties example:

```
sonar.projectKey=test-electron-react-boilerplate
# sonar.testExecutionReportPaths=test-reporter.xml
sonar.testExecutionReportPaths=test-reports/test-reporter.xml
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.sources=./app
sonar.tests=./test
sonar.host.url=http://localhost:9000
sonar.login=d0c254aaff5ebd89dd5c6f0663238ab6ad5fddea
# sonar.login=039884f95817f7b26d781d7cdd47430cb3734a0a

```

## Maintainer

- [Pavlo (Paul) Buidenkov](https://github.com/pavlobu)

## License

MIT © [Pavlo (Paul) Buidenkov](https://github.com/pavlobu/deskreen)

## Copyright

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate)

## Test ?
