A generic apollo-link-like composing function to create functional pipelines featuring both middlewares (called before) and afterwares (called after) the decorated function.

The middleware function may optionally return an afterware function, which may access and alter return values of the preceeding afterware.

```js
// With afterware:
const foo = (next) => (...args) => {
  /* Executed before the terminating function is called.
  Arguments may be modified here. */
  next(...args)
  return (result) => {
    /* Executed after the terminating function is called.
    Returns may be modifed here. */
    return result
  }
}

// Without afterware
const bar = (next) => (...args) => {
  next(...args)
  // Nothing is returned. Non-function returns will throw an error.
}
```

`next()` calls the next function in the pipeline. As such, the pipeline may be
interrupted by omitting the call to `next()`:
```js
const baz = (next) => (value) => {
  // interrupts pipeline if the value is falsy
  if (value) {
    next(value)
  }
}
```

*`usePipeline()`* returns two functions with argument-functions composed from
right to left.
The first argument is the function to decorate which will be
called last. The rest are the middle- and after-wares.

*`runMiddleware(...args)`* runs the function with middleware only, no afterware.

*`runAfterware(...args)`* run the function with both middle- and after-ware.
```js
const fnToDecorate = (value) => value

const {
  runMiddleware,
  runAfterware
} = usePipeline(fnToDecorate, foo, bar)
```
