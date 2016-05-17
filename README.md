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
    fallout: (code) => {
        if (404 == code) {
            return router.route('default');
        }

        throw new Error(`[Router] Fallout code: ${code}`);
    }
});

// Map your routes
router.map({
    default: () => console.log('default'),

    about: () => console.log('about'),

    'user/:user_id': {
        edit: user_id => console.log(`editing user ${user_id}`),

        delete: user_id => console.log(`deleting user ${user_id}`)
    }
});

// Launch a route
router.route('user/1/edit');
```