# Routing

JavaScript Routing library!

## Installing

To install the latest release version:

```bash
npm install --save reflex-routing
```

## How to...?

Create a new instance of the Router object

```javascript
var router = new Router;
```

Then add your routes!

```javascript
router.add('/home', () => {
    // Do some home actions
    app.setView('home');
});

router.add('/user/:id', (id) => {
    // Do some 'profile' actions...
    app.setView('user-profile', {id});
});
```

To action a route

```javascript
var response = router.route('/user/1');
```

We leave the choice of how your routes get fired to you! 

### More routing options

You can instantiate an instance of the `Router` with your routes, and you can add nested routes, too!

```javascript
var router = new Router(
    {
        home: () => console.log('default'),

        about: () => console.log('about'),

        'user/:user_id': {
            edit: user_id => console.log(`editing user ${user_id}`),

            delete: user_id => console.log(`deleting user ${user_id}`)
        },

        'file/*file': file => console.log(file)
    }
);
```

### Going somewhere? Go here instead!

New in version 4.2 is the ability to `redirect` to other routes, this means that if you want to avoid firing the `before` or `after` callbacks you can! 

```javascript
    router.redirect('/somewhere-nice');
```

### Find and do something - but don't launch!

If for some reason you do not wish to 'fire' the route once located, pass `false` as the second parameter to `route()` e.g.

```javascript
var route = router.route('/about', false);

// Do something with route here...
// Then fire the route!
route.launch();
```

The above functionality is essentially the same as the `find()` method, however, the `route()` method triggers the `before` and `after` callbacks.

### Taking Action Prior and Post Route

Want to handle an action before or after a route is fired? Use `Router.before()` or `Router.after()` to add callbacks! 

```javascript
router.before((router, route, uri) => {
    if ('/old-route' == uri) {
        router.route('/replacement-route');
    }
    // do something with any of the above parameters prior to route being fired
});

router.after((router, route, uri, response) => {
    // Looks like there was no route
    if (response == null) {
        router.redirect('/');
    }
    // do something with any of the above parameters post route firing
});
```

### Adding a new response post initialization

Want to add a callback to an existing route at any point, no problem!
```javascript
// Adds an additional callback to an existing route!
router.add('user/:user_id/edit', () => console.log('another callback for this route'));
```

# Other features

Some other features of our routing library

### Wildcard Routes

Need to capture a big segment of 'stuff' but don't know what it'll look like? Use a wildcard!

```javascript
// file => console.log(file) gets fired, where the parameter file 'is in/some/dir/hello.txt'
router.route('file/in/some/dir/hello.txt');
```

### Optional Parameters

The Router supports optional parameters, e.g.

```javascript
router.add('user(/:action)/:id', (action, id) => console.log(action || 'view', id));
```