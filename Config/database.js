const mongoose = require('mongoose');

const connectdb = async () => {
    try {
        await mongoose.connect('mongodb+srv://Epan:telorsetengahmateng212@cluster0.qi8ir.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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