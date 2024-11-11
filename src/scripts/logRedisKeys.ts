import redisClient from '../config/redis';

const connectToRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
};

const getAllKeys = async () => {
    try {
        const keys = await redisClient.keys('*');
        console.log('All keys:', keys);
        return keys;
    } catch (err) {
        console.error('Error fetching keys:', err);
        return [];
    }
};

const getValuesForKeys = async (keys: string[]) => {
    try {
        const values = await redisClient.mGet(keys);
        console.log('Values:', values);
    } catch (err) {
        console.error('Error fetching values:', err);
    }
};

const clearCurrentDatabase = async () => {
    try {
        const succeeded = await redisClient.flushDb();
        console.log('Database cleared:', succeeded);
    } catch (err) {
        console.error('Error clearing database:', err);
    }
};

const clearAllDatabases = async () => {
    try {
        const succeeded = await redisClient.flushAll();
        console.log('All databases cleared:', succeeded);
    } catch (err) {
        console.error('Error clearing all databases:', err);
    }
};

const getKeyValue = async (key: string): Promise<void> => {
    try {
        const value = await redisClient.get(key);
        if (value !== null) {
        console.log(`Key: ${key}, Value: ${value}`);
        } else {
        console.log(`Key: ${key} does not exist.`);
        }
    } catch (err) {
        console.error(`Failed to retrieve value for key ${key}:`, err);
    }
};

(async () => {
    await connectToRedis();

    getAllKeys();

    // const keys = await getAllKeys();
    // if (keys.length > 0) {
    //     await getValuesForKeys(keys);
    // }
    getKeyValue('player:67309669db47f81fa7216b82');

    //await clearCurrentDatabase();
    // await clearAllDatabases();

    // Disconnect from Redis when done
    await redisClient.quit();
})();
