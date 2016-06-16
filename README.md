# Routing

Simple JavaScript routing library that can be used as a modlue or called in to use in the browser!

## Installing

To install the latest release version:

```bash
npm install --save reflex-routing
```

## Basic usage

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
router.route('/user/1');
```

We leave the choice of how your routes get fired to you! 

## More routing options

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

Want to handle an action before or after a route is fired? Use `Router.before()` or `Router.after()` to add callbacks! 

```javascript
router.before((router, route, uri) => {
    // do something with any of the above parameters prior to route being fired
});

router.after((router, route, uri) => {
    // do something with any of the above parameters post route firing
});
```

Want to add a callback to an existing route at any point, no problem!
```javascript
// Adds an additional callback to an existing route!
router.add('user/:user_id/edit', () => console.log('another callback for this route'));
```

# Other features

Some other features of our routing library

## Wildcard Routes
```javascript
// file => console.log(file) gets fired, where the parameter file 'is in/some/dir/hello.txt'
router.route('file/in/some/dir/hello.txt');
```

## Optional Parameters
```javascript
// Supports optional parameters
router.add('user(/:action)/:id', (action, id) => console.log(action || 'view', id));
```