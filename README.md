# Routing
Javascript routing library

## Installing

To install the latest release version:

```bash
npm install --save reflex-routing
```

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
    },
    {
        /**
         * Fallout function, handles errors
         */
        fallout: (code) => {
            if (404 == code) {
                return router.route('default');
            }

            throw new Error(`[Router] Fallout code: ${code}`);
        }
    }
);

router.before((router, route, uri) => {
    // do something with any of the above parameters
});

router.after((router, route, uri) => {
    // do something with any of the above parameters
});

router.add('user/:user_id/edit', function() {
    console.log('another callback for this route'); 
});

// Launch a route
router.route('user/1/edit');

// user_id => console.log(`editing user ${user_id}`) gets fired, where user_id replaced with 1

router.route('file/in/some/dir/hello.txt');
// file => console.log(file) gets fired, where file is in/some/dir/hello.txt

// Supports optional parameters
router.add('user(/:action)/:id', (action, id) => console.log(action || 'view', id));
```