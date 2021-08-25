# Demo of using JSON Web Tokens with Cookies in Express

## Background

JSON Web Tokens (JWT) are an interesting way to authenticate remote users that
do not require a central "Session" store on the backend.  However, one common
way that they have been used in Single Page Applications (SPA) is to store the
token in localStorage and then send it back down on each request in an Authorization
header.

It turns out, that this is a very *bad* idea as localStorage is not protected by any
cross origin protections in the browser.  This means XSS attacks against localStorage
are possible.

Because of this, the recommended way to use JWTs with a frontend framework like
React is to just store the JWT in a `httpOnly` cookie, with the `sameSite` protections
on that cookie to prevent CSRF attacks (much like you would do with a session token)

Unfortunately, I have not seen a lot of examples of how to do this in a modern React
frontend and Express backend.  So this project is a demonstration of how to set this up.

## How this is done

First we need a module to create and verify our JWTs, this project uses the `jsonwebtoken` npm module.

Then we can just use the built in support for cookies in express to send and receive the cookies.

### Setting up the cookie parser middleware

You need to configure the cookie parser middleware, providing a secret to sign
the cookies.

```js
app.use(cookieParser(cookieSecret));
```

### Authenticating Users and Generating a JWT

In your `login` method on your backend, you will need to first verify the user
in whatever way you normally would (email and password, username and password etc)

Then once they are verified you generate a JWT and set the cookie on the response.

```js
// We sign a JWT and store it in a cookie on the response.
    // The browser will store it and send it back down
    res.cookie('token', jwt.sign({
      username
    }, secret),{
      sameSite: 'strict',
      httpOnly: true,
      signed: true
    })
```

### Reauthenticating users when they access a protected route

To accomplish this, we create an authRequired middleware function that verifies
the jwt that should be present in the cookie.

```js
// This is middleware that checks the JWT token in the cookie to see if it's valid
// if it is, we call next(), otherwise we send a 401 Unauthorized
const authRequired = (req, res, next) => {
  // We grab the token from the cookies
  const token = req.signedCookies.token;
  // jwt verify throws an exception when the token isn't valid
  try {
    jwt.verify(token, secret)
  }
  catch (error) {
    res.status(401).send({
      loggedIn: false,
      message: "Unauthorized"
    });
    return;
  }
  next();
}
```

We can now attach this middleware to any route in our application that we want to
be protected by the JWT.

### Logging the user out

Logging the user out is just a matter of clearing the token cookie.

```js
res.clearCookie('token', {
    sameSite: 'strict',
    httpOnly: true,
    signed: true
  });
```

## Handling this on the client

On the client, you mostly don't have to do anything special. You don't have to store the token in your React app at all. In fact because the cookie is httpOnly
it's impossible for JavaScript to access it.

However, when your React app loads, you probably want to make an authenticated
request to your backend to determine if the user's JWT is valid or not before rendering the logged in version of your application.

We do this in the `<App>` component in react with a fetch call to the backend.

```js
  useEffect(() => {
    async function fetchAuthenticated() {
      const response = await fetch('/authenticated');
      const result = await response.json();
      setMessage(result.message);
      setLoggedIn(result.loggedIn);
    }
    fetchAuthenticated();
  },[loggedIn])
```

### Other things to handle

Other things that would be good to handle would be to have the JWT token expire,
and to have a refresh token. This demo doesn't not go into the details of how to
implement those as I wanted to keep this as simple as possible.
