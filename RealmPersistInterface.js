import Realm from 'realm'

class RealmPersistInterface {
  constructor () {
    this.realm = new Realm({
      schema: [{
        name: 'Item',
        primaryKey: 'name',
        properties: {
          name: 'string',
          content: 'string'
        }
      }]
    })

    this.items = this.realm.objects('Item')
  }

  getItem (key) {
    return new Promise((resolve, reject) => {
      const matches = this.items.filtered(`name = "${key}"`)
      if (matches.length > 0 && matches[0]) {
        resolve(matches[0].content)
      } else {
        reject(new Error(`Could not get item with key: '${key}'`))
      }
    })
  }

  setItem (key, value) {
    return new Promise((resolve, reject) => {
      this.getItem(key)
        .then(() => {
          try {
            this.realm.write(() => {
              this.realm.create('Item', { name: key, content: value }, true)
              resolve()
            })
          } catch (e) {
            reject(e)
          }
        })
        .catch(() => {
          try {
            this.realm.write(() => {
              this.realm.create('Item', { name: key, content: value })
              resolve()
            })
          } catch (e) {
            reject(e)
          }
        })
    })
  }

  removeItem (key) {
    return new Promise((resolve, reject) => {
      try {
        this.realm.write(() => {
          const item = this.items.filtered(`name = "${key}"`)
          this.realm.delete(item)
          resolve()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  getAllKeys () {
    return new Promise((resolve, reject) => {
      try {
        const keys = this.items.map((item) => item.name)
        resolve(keys)
      } catch (error) {
        reject(error)
      }
    })
  }
}

const singleton = new RealmPersistInterface()

export default singleton
