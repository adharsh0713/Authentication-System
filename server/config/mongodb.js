import mongoose from 'mongoose';

const connectDB = async () => {
    mongoose.connection.on('connected', ()=> console.log("Database Connected"));
    mongoose.connection.on('error', err => console.error("DB Error:", err));
    mongoose.connection.on('disconnected', ()=> console.log("DB Disconnected"));
    await mongoose.connect(`${process.env.MONGODB_URI}/Authentication-System`);
}

export default connectDB;