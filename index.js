const compose = (...fns) => (x) => fns.reduce((a, fn) => fn(a), x)

module.exports = function usePipeline (fn, ...middlewares) {
  const runMiddleware = (...args) => {
    /* Middlewares are composed, right to left, to recieve the next function.
    The last middleware (the second argument) recieves the terminating function,
    as it's next-variable.

    The terminating function and all of the middlewares are wrapped in a
    decorator that appends their returns to the afterware array upon
    execution if the terminating function was called.

    If any of the middlewares do not call next(), the terminating function will
    not be called, didTerminate will remain false and no afterwares will be
    appended. */
    let afterwares = []
    let didTerminate = false

    const watchTermination = (fn) => (...args) => {
      didTerminate = true
      return fn(...args)
    }

    const append = (middleware) => (...args) => {
      const afterware = middleware(...args)
      if (didTerminate) {
        afterwares.push(afterware)
      }
    }

    const middleware = middlewares.reduce(
      (a, middleware) => append(middleware(a, fn)),
      compose(append, watchTermination)(fn)
    )

    middleware(...args)

    return afterwares
  }

  const runAfterware = (...args) => {
    /* Executes runMiddleware and destruct the results to obtain the return
    value, "result" of the terminating function, and the return value of each
    middleware - it's afterware. If the middleware doesn't return an afterware,
    it's returns are skipped. */
    const [result, ...afterwares] = runMiddleware(...args)

    return afterwares
      .filter((afterware, i) => {
        if (!afterware) {
          return false
        } else if (typeof afterware !== 'function') {
          throw new Error(`Middleware of index: "${i}" returned a non-function.`)
        } else {
          return true
        }
      })
      .reduce((a, afterware) => afterware(a), result)
  }

  return {
    runMiddleware,
    runAfterware
  }
}
