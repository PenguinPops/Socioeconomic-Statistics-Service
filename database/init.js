db.createUser({
    user: 'myuser',
    pwd: 'mypassword',
    roles: [
        { role: 'readWrite', db: 'statsdb' }
    ]
});

db.createCollection('stats');