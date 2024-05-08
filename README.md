## Project setup

```
npm init -y
npm install --save-dev typescript
npx tsc --init
npm install --save-dev ts-node nodemon
```

### Create `package.json` file:

```
"scripts": {
  "start": "node dist/app.js",
  "dev": "nodemon --exec ts-node src/app.ts",
  "build": "tsc",
  "watch": "tsc --watch"
}
```
