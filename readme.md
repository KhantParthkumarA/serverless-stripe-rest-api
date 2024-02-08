### Quick Start
> RUN SERVER
```sh
> cd server

> cd stripe

** Note : - check node version and use latest v18 node version to run server - :

** Note : - install serverless cli globally if does not exists - :

> npm install

> serverless offline --httpPort 9090

```

> RUN CLIENT
```sh
> cd client

** Note : - check node version and use latest v18 node version to run server  if not work then check with node version v14 - :

> npm install

> npm start

```


> ```If server return lambda timeout then first start client with node supported version then switch to server specific node version then run server again will works```



```js

UPCOMMING TODO

1) Implement token based authorisation to access api privately currently we have static token so static token will replace with encrypted token have user details to verfied requested user 

2) Implement token expiry logic so incase token expired then home page auto redirect to login page

3) Implement admin login and admin UI so admin can change stripe product price and view all users and subscriptions

4) Admin can send notification to user email if user subscription expired and user not subscribed

```