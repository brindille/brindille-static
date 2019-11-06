# brindille-static
Serverless starter for Brindille using:

- Webpack
- Stylus css
- Nunjucks templates
- Express & BrowserSync for local dev server

The goal of this starter is to have a rendering pipeline shared by the local dev server and by our custom static html generator. While developing you work on an express.js server distributing the app with various middlewares. When you build the app creates `.html` that can be used on AWS S3, github pages and the likes.

Here's the github page serving the static build of this repository : 
https://brindille.github.io/brindille-static


## Dev (local)
```bash
npm start
```

Launches a local server with live reload.


## Build (static)
```bash
npm run build
```

Build your static app to the `dist` folder.

It accepts a `-b` param (for base folder), useful if your site will not be hosted on the root or your domain but in a bubfolder. Ex: if your app needs to be hosted in `http://site.com/myapp/` you need to build like this :

```json
{
  "build": "node ./src/server/index.js --prod -b myapp"
}
```


## Preview
You can test your build (the static app) by launching the following command after build :

```bash
npm run preview
```

If you used the `-b` param don't forget to modify this command to open the app from the proper folder in the preview.

## Configurations

### Routes
You need to define all the routes of your app in  `data/routes.yaml`. This will be used both by client, local server and build tool. Default page will be the first entry from the list. The id of a route will be used to identity it and to create the class name of this routes (pascalcase). The path will be used by client and server routers and uses the [same route format than Express](http://expressjs.com/en/guide/routing.html).

```yaml
- id: 'home'
  path: 'home'
- id: 'about'
  path: 'about'
- id: 'posts'
  path: 'post'
- id: 'post'
  path: 'post/:id'
```

### Static datas
Each page template will be passed content from a `.yaml` file if it exists. 
Ex for Home page if you have the following `data/pages/home.yaml` file :
```yaml
title: 'Le Home Title'
```
You will be able to access the title variable from nunjucks using `{{ Home.title }}`

### Controllers
Each page of your app can use a server side controller to populate its data. This controller will be called on local dev by express server and by the build tool for the static site. Each controller must be placed in the section folder. Controllers should export a data and or a routes functions that each return promises. Ex for Post page `src/views/sections/post/controller.js`
```js 
module.exports = {
  data: (params) => {
    return new Promise(resolve => {
      resolve({
        foo: 'bar',
        a: 0
      })
    })
  },
  routes: () => {
    return new Promise(resolve => {
      resolve([
        'post/foo',
        'post/bar'
      ])
    })
  }
}
```

The `data` function should return a promise that resolves an object that will be available in nunjucks templates `{{ Home.foo }}` will render to `bar`. The function will be passed url params as an object, ex for a `post/:id` route and for a `post/toto` request, data will receive a `{id: 'toto'}` object. This method will be called each time the view is rendered (never on client side). Typically you could use this method to return content of a given post from your favorite CMS.

The `routes` function should return a promise that resolves an array of subroutes to be rendered. You will need this for routes with params like `post/:id` to tell the builder which value of `id` should be used for static rendering. This method will only be used on build. Typically you could use this method to return a list of post from your favorite CMS.