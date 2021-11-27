export const wrapPromise = <T>(promise: Promise<T>): T => {
  const d = { status: 'pending', result: null }
  const s = promise.then(
    (result) => Object.assign(d, { status: 'success', result }),
    (result) => Object.assign(d, { status: 'error', result })
  )

  // @ts-expect-error
  return {
    read() {
      if (d.status === 'pending') throw s
      if (d.status === 'error') throw d.result
      if (d.status === 'success') return d.result
    },
  }
}
