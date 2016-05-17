# Routing
Javascript routing library

## Installing

To install the latest release version:

```bash
npm install --save reflex-routing
```

```javascript
var router = new Router({
    /**
     * Fallout function, handles errors
     */
    fallout: function fallout(code) {
        if (404 == code) {
            return router.route('home');
        }

        throw new Error('[Router] Fallout code: ' + code);
    }
});

// Map your routes
router.map({
    'home': function home() {
        console.log('home');
    },

    '': function _() {
        console.log('home');
    },

    'about': function about() {
        console.log('about');
    },

    'user/:user_id': {
        'edit': function (user_id) {
            console.log('editing user ' + user_id);
        },

        'delete': function (user_id) {
            console.log('deleting user ' + user_id);
        }
    }
});

// Launch a route
router.route('home');
router.route('about');
```