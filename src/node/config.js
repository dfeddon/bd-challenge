const env = process.env.NODE_ENV; // 'dev', 'test' or 'prod'

// development
const dev = {
    app: {
        port: parseInt(process.env.DEV_APP_PORT) || 3000,
        timerInMinutes: 60
    },
    db: {
        host: process.env.DEV_DB_HOST || 'mongodb://localhost/challengeapp',
        port: parseInt(process.env.DEV_DB_PORT) || 27017,
        name: process.env.DEV_DB_NAME || 'db',
        batchThreshold: 100
    }
};

// testing
const test = {
    app: {
        port: parseInt(process.env.TEST_APP_PORT) || 3000,
        timerInMinutes: 60
    },
    db: {
        host: process.env.TEST_DB_HOST || 'mongodb://localhost/challengeapp-test',
        port: parseInt(process.env.TEST_DB_PORT) || 27017,
        name: process.env.TEST_DB_NAME || 'test',
        batchThreshold: 100
    }
};

// production
const prod = {
    app: {
      port: parseInt(process.env.TEST_APP_PORT) || 3000,
      timerInMinutes: 60
    },
    db: {
      host: process.env.TEST_DB_HOST || 'mongodb://localhost/challengeapp',
      port: parseInt(process.env.TEST_DB_PORT) || 27017,
      name: process.env.TEST_DB_NAME || 'db',
      batchThreshold: 100
    }
};
   
const config = {
 dev,
 test,
 prod
};

module.exports = config[env];