# Routing
Javascript routing library

## Installing

To install the latest release version:

```bash
npm install --save npm install reflex-routing
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

router.map({
    'home': function home() {
        console.log('home');
    },

    '': function _() {
        console.log('home');
    },

    'about': function about() {
        console.log('about');
    }
});


// Launch a route
router.route('home');
router.route('about');
```