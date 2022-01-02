const usePipeline = require('./index')

// function to decorate
const foo = (num) => -num

// middle- and after-wares
const bar = (next) => (num) => {
  next(num + 1)
  return (result) => {
    return result - 1
  }
}

const baz = (next) => (num) => {
  next(num + 1)
}

test('May modify arguments and results', () => {
  const { runAfterware } = usePipeline(foo, bar, baz)
  const result = runAfterware(0)
  /* middleware adds 1
  function inverts to negative
  afterware subtracts 1 */
  expect(result).toBe(-3)
})

test('Throws on non-function return', () => {
  const noFnReturn = (next) => (...args) => {
    next(...args)
    return 'non-function'
  }
  const { runAfterware } = usePipeline(foo, noFnReturn)
  expect(() => { runAfterware(0) }).toThrowError()
})

test('Afterware is optional', () => {
  const { runAfterware } = usePipeline(foo, baz)
  /* middleware adds 1
  function inverts to negative
  no afterware is returned, so the function returns remain unchanged */
  expect(runAfterware(0)).toBe(-1)
})

test('May omit next() to interrupt call-chain', () => {
  const interrupt = (next) => (num) => {
    // not calling next(num)
  }

  const { runAfterware } = usePipeline(foo, interrupt)

  expect(runAfterware(0)).toBe(undefined)
})
