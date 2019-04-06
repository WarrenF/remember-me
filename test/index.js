'use strict'
const cache = require('../app/index.js')

const getInfo = (cacheCharacterLimit = 104857600, cacheEntries = 0, cacheSize = 0) => {
  return {
    cacheCharacterLimit,
    cacheEntries,
    cacheSize
  }
}

describe('Cache', () => {
  describe('Can store cache', () => {
    it('Allows you add a cache item', () => {
      cache.set('test', { someStuff: true })
      cache.info((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal(getInfo(104857600, 1, 18))
      })
    })

    it('Allows you to fetch a single key from cache', async () => {
      cache.get('test', (err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal({ someStuff: true })
      })
    })

    it('Allows you to delete items by key', () => {
      cache.del('test')
      cache.info((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal(getInfo(104857600, 0, 0))
      })
    })

    it('Does not blow up when you try to delete something that does not exist', () => {
      cache.del('testingz')
      cache.info((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal(getInfo(104857600, 0, 0))
      })
    })

    it('Does not blow up when you try to set a max size without passing anything in', () => {
      cache.setMaxSize()
    })

    it('Does not blow up when you try to fetch something that does not exist', () => {
      cache.get('nope', (err, data) => {
        expect(err).to.equal(null)
        expect(data).to.equal(undefined)
      })
    })

    it('Does not blow up when you try to fetch multiple keys that do not exist', () => {
      cache.mget(['nope', 'nope2'], (err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal([
          undefined,
          undefined
        ])
      })
    })

    it('Does not blow up when you pass an empty array into mget', () => {
      cache.mget(undefined, (err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal([])
      })
    })

    it('Allows you to add an item with an expiry', () => {
      cache.set('test', { someStuff: true }, 250, () => {})
      cache.info((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal(getInfo(104857600, 1, 18))
      })
    })

    it('Deletes the keys that have an expiry', async () => {
      await new Promise(resolve => {
        setTimeout(() => {
          cache.info((err, data) => {
            // The object should still in cache at this point
            expect(err).to.equal(null)
            expect(data).to.deep.equal(getInfo(104857600, 1, 18))
          })
        }, 100)
        setTimeout(() => {
          cache.info((err, data) => {
            // The object should have expired at this point
            expect(err).to.equal(null)
            expect(data).to.deep.equal(getInfo(104857600, 0, 0))
            resolve()
          })
        }, 251)
      })
    })

    it('Does not allow you to store more than the maximum allowed characters', () => {
      cache.setMaxSize(1)
      cache.set('test', { someStuff: true }, 500, (err, data) => {
        expect(err).to.not.equal(null)
        expect(data).to.equal(undefined)
      })
    })

    it('Allows you fetch multiple keys at once', async () => {
      cache.setMaxSize(10000000)
      cache.set('test', { someStuff: true })
      cache.set('test2', { someOtherStuff: true })
      cache.mget(['test','test2'], (err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal([
          { someStuff: true },
          { someOtherStuff: true }
        ])
      })
    })

    it('Allows you to fetch all data at once', async () => {
      cache.getAll((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal([
          { someStuff: true },
          { someOtherStuff: true }
        ])
      })
    })

    it('Allows you to fetch all keys from the cache', async () => {
      cache.getAllKeys((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal(['test', 'test2'])
      })
    })

    it('Deletes all the cache', async () => {
      cache.flush((err, data) => {
        expect(err).to.equal(null)
        expect(data).to.deep.equal('success')
      })
    })
  })
})
