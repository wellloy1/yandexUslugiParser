# Yandex Uslugi Parser v2.0.0

## Install NPM dependencies

```bash
> npm i --only=prod
```

## Install PM2 if not installed

```bash
> npm i pm2 -g
> pm2 startup
```

## Add process
```bash
> pm2 start pm2.config.js
> pm2 save
```

## To stop process

```bash
> pm2 stop yandexUslugiParser
```

## To delete process

```bash
> pm2 delete yandexUslugiParser
```
