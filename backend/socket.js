import User from "./models/userModel.js";

export const socketHandler = async (io) => {
  io.on("connection", (socket) => {
    socket.on("identify", async ({ userId }) => {
      try {
         await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true }
        );
      } catch (error) {
        console.log(error);
      }
    })
    socket.on('disconnect',async()=>{
        try {
            await User.findOneAndUpdate({socketId:socket.id},{
                  socketId: null,
            isOnline: false
            })
        } catch (error) {
            console.log(error);
            
        }
    })
  })




};
