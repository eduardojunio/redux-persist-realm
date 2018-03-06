import Realm from 'realm';

class RealmPersistInterface {
    constructor({ encryptionKey }) {
        const config = {
            schema: [{
                name: 'Item',
                primaryKey: 'name',
                properties: {
                    name: 'string',
                    content: 'string',
                },
            }],
        };

        if (encryptionKey) {
            config.encryptionKey = encryptionKey;
        }

        this.realm = new Realm(config);

        this.items = this.realm.objects('Item');
    }

    getItem = (key, callback) => {
        try {
            const matches = this.items.filtered(`name = "${key}"`);

            if (matches.length > 0 && matches[0]) {
                callback(null, matches[0].content);
            } else {
                throw new Error(`Could not get item with key: '${key}'`);
            }
        } catch (error) {
            callback(error);
        }
    };

    setItem = (key, value, callback) => {
        try {
            this.getItem(key, (error) => {
                this.realm.write(() => {
                    if (error) {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            }
                        );
                    } else {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            },
                            true
                        );
                    }

                    callback();
                });
            });
        } catch (error) {
            callback(error);
        }
    };

    removeItem = (key, callback) => {
        try {
            this.realm.write(() => {
                const item = this.items.filtered(`name = "${key}"`);

                this.realm.delete(item);
            });
        } catch (error) {
            callback(error);
        }
    };

    getAllKeys = (callback) => {
        try {
            const keys = this.items.map(
                (item) => item.name
            );

            callback(null, keys);
        } catch (error) {
            callback(error);
        }
    };
}

export default (realmConfig = {}) => new RealmPersistInterface(realmConfig);
