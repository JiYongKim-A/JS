// 서버측 
const express = require('express'); // express 불러옴
const http = require('http'); // http 모듈 
const path = require('path'); //path 모듈
const socketModule = require('socket.io'); //socket.io 모듈
const moment = require('moment');
const dotenv = require('dotenv');
const app = express();
const server = http.createServer(app);
const io = socketModule(server);

dotenv.config();

// 각 채팅방 별 이름 저장 공간
const nameList_A = []
const nameList_B = []
const nameList_C = []

//정규표현식 패턴
const pattern = /\([^.(?!\n)]+\)/

app.use(express.static(path.join(__dirname, "Client")))

    
io.on("connection", (socket)=>{
 
    socket.on("room",(room,name)=>{
        console.log("room",room)
        console.log("name",name)

        socket.join(room)
        if(room=="A"){
            socket.id = "(A)"+name
            nameList_A.push(name)
            io.to(room).emit("naming", nameList_A,name)
        }
        else if (room =="B"){
            socket.id = "(B)"+name
            nameList_B.push(name)
            io.to(room).emit("naming", nameList_B,name)
        }
        else{
            socket.id = "(C)"+name
            nameList_C.push(name)
            io.to(room).emit("naming", nameList_C,name)
        }

    })


    socket.on("chatSocket",(socketData,room)=>{// 전체채팅시 사용하는 소켓
        
        io.to(room).emit("chatSocket",{ //받은 소켓의 데이터를  객체형식으로 모아서 client.js로 보내줌
            name : socketData.name,
            message : socketData.message,
            time : moment(new Date()).format("h:mm A")  
        })
    })

    socket.on("partChatSocket", (data,room)=>{ // 귓속말에 사용하는 소켓
        io.to(room).emit("partChatSocket",{ // 귓속말 소켓을 받았을때 전체채팅과 같은방식으로 데이터를 client.js 로 보내준다.
            name: data.name,
            message : data.message,
            time: moment(new Date()).format("h:mm A"),
            // 여기서의 type은 귓속말을 보냈을때 모든 사용자가 이 소켓을 받고 그중에 data.type이 자신의 이름과 동일할때 html 리스트
            //에 추가 시키게 하여 귓속말을 구현함
            type : data.type 
        })
    })

    socket.on("disconnect",()=>{ // 여기부분은  사용자가 나갈시 disconnect event가 발생하는데 서버는 disconnect로 
                                // 사용자가 나갔을때 어떻게 하겠다고 구현한 곳
        console.log(socket.id)
        var socket_name = socket.id
        var room = socket_name.match(pattern)[0][1]
        console.log(room)
        var realname = socket_name.replace(pattern,"")
        
        if(room =="A"){
            nameList_A.pop(realname)
        }
        else if(room =="B"){
            nameList_B.pop(realname)
        }
        else{
            nameList_C.pop(realname)
        }

        
        io.to(room).emit("userDisconnect", realname) // userDisconnect 소켓으로  client.js에게 나간사용자 이름 보냄
    })

})

server.listen(process.env.PORT,()=>console.log(`${process.env.PORT}Port Server is open!!`))
