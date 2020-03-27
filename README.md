# brindille-static

Serverless starter for Brindille using:

- Webpack
- Stylus css
- Twig templates
- Express & BrowserSync for local dev server

The goal of this starter is to have a rendering pipeline shared by the local dev server and by our custom static html generator. While developing you work on an express.js server distributing the app with various middlewares. When you build the app creates `.html` that can be used on AWS S3, github pages and the likes. You can also use a node server version similar to the local server that doesn't build js and css but still renders pages.

Here's the github page serving the static build of this repository :
https://brindille.github.io/brindille-static

To start using `brindille-static` you should clone this repo like this:

```bash
git clone git@github.com:brindille/brindille-static.git ./my-project && cd ./my-project && rm -rf .git && npm i
```

Then you can start developping using `npm start`.

## Main tasks

### Dev (local)

```bash
npm start
```

Launches a local server with live reload.

### Build (static)

```bash
npm run build
```

Build your static app to the `dist` folder and launch webpack to generate the bundled and minified js and css files.

It will render every possible routes on distinct html files. Use this if you want to use the app as a generator for a static website.

### Webpack

```bash
npm run webpack
```

This will generate the bundled and minified js and css files to the `dist` folder. Should be used before the `serve` command in production if you are using a live node.js version of the app.

### Serve (node)

```bash
npm run serve
```

Launches a basic node.js server that will serve the content of the `dist` folder and try to render the routes if their `.html` file doesn't already exists. Meaning if you launch the `build` command before the `serve` command it will serve a fully static version of the app, whereas if you launch the `webpack` command before the `serve` command, it will serve a live (node.js) version of the app.

## Scaffolding

This repo comes with a couple of handy scaffolding scripts that will help you easily add components to the project.

### Components

```bash
npm run component
```

Adds a new component to our project with proper registering and files. We make the distinction between basic components, layout components (one off components like header or footer), and section components that are associated with a route. If you create a section component the scaffolder will create a route associated with it.

### Languages

```bash
npm run language
```

Adds a new language to our app and creates all data files associated with it.

## Configuration

### Config

In `data/config.yaml` you can set various parameters that will be used by brindille.

```yaml
folder: /brindille-static/
hostname: http://mysite.local/
sitemap: false
```

- `folder` will tell brindille in which subfolder url the website will be located in in production. In the above case, brindille will assume the final url of the website will be `http://mysite.local/brindille-static/`, thus all static files will be generated in `dist/brindille-static/`. Default is `/` which should be used if the app is located in the root of you url.

- `hostname` tells brindille the final production host url of your website. For now it's only used for sitemap generation. Default is emtpy.

- `sitemap` if true, the `build` task will generate a sitemap. Default is `false`.

### Languages

In `data/languages.yaml` is a list of all languages that will be used in our app. There always should be at least one language. If only one language is present, the lang param will not be included in the urls of the app.

### Routes

You need to define all the routes of your app in `data/routes.yaml`. This will be used both by client, local server and build tool. Default page will be the first entry from the list. The id of a route will be used to identity it and to create the class name of this routes (pascalcase). The path will be used by client and server routers and uses the [same route format than Express](http://expressjs.com/en/guide/routing.html).

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

You will be able to access the title variable from twig using `{{ Home.title }}`

### Controllers

Each page of your app can use a server side controller to populate its data. This controller will be called on local dev by express server and by the build tool for the static site. Each controller must be placed in the section folder. Controllers should export a data and or a routes functions that each return promises. Ex for Post page `src/views/sections/post/controller.js`

```js
module.exports = {
  data: params => {
    return new Promise(resolve => {
      resolve({
        foo: 'bar',
        a: 0
      })
    })
  },
  routes: () => {
    return new Promise(resolve => {
      resolve(['post/foo', 'post/bar'])
    })
  }
}
```

We also have a global controller located in `src/server/controller.js` that will be called for each request.

The `data` function should return a promise that resolves an object that will be available in twig templates `{{ Home.foo }}` will render to `bar`. The function will be passed url params as an object, ex for a `post/:id` route and for a `post/toto` request, data will receive a `{id: 'toto'}` object. This method will be called each time the view is rendered (never on client side). Typically you could use this method to return content of a given post from your favorite CMS.

The `routes` function should return a promise that resolves an array of subroutes to be rendered. You will need this for routes with params like `post/:id` to tell the builder which value of `id` should be used for static rendering. This method will only be used on build. Typically you could use this method to return a list of post from your favorite CMS.
