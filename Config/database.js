const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        await mongoose.connect('mongodb://typicalsleepingboy:Logical91@ac-nmujy0y-shard-00-00.8m7nxuo.mongodb.net:27017,ac-nmujy0y-shard-00-01.8m7nxuo.mongodb.net:27017,ac-nmujy0y-shard-00-02.8m7nxuo.mongodb.net:27017/?replicaSet=atlas-ksbjnd-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=typicalsleepingboy', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};
module.exports = connectdb;