import mongoose from 'mongoose'

const connectDb = async()=>{
    try {
        await mongoose.connect(process.env.Mongo_URI)
        console.log("monngodb is connected")
    } catch (error) {
        console.log("db error");
        
    }
}

export default connectDb;