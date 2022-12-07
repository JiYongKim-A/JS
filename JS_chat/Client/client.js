// client 측

"use strict"

const socketIo = io();

// index.html의 스크립트에서 동적으로 사용할 것들을 불러옴
const username = document.querySelector("#userName"); // 사용자이름입력칸에 작성한 이름 불러옴

const ListBox = document.querySelector(".ListBox"); //메세지 창을 불러옴

const messageList = document.querySelector(".ListBox-messageList"); //메세지 창의 각 채팅칸을 불러옴

const sendBoxmessage = document.querySelector(".sendBox-inputBox"); // 메세지 입력창의 작성한 메세지 불러옴

const sendButton = document.querySelector(".sendBox-sendButton"); // 메세지 전송버튼 불러옴

const select = document.querySelector(".selecting"); // 귓속말 select박스 사용  (콤보박스라고도함)

const nameCheck = document.getElementById("nameCheck");


async function idCheck(usrname) {
    socketIo.emit("nameCheck")
    socketIo.on("nameCheck", names => {
        document.getElementById("nameCheck").innerText = names.split(" ").includes(usrname);
    })
    return 0;
}


while (true) { // 처음 서버에 접속시 이름 적용할 수 있게 만든 prompt()
    var usrname = prompt("채팅에서 사용하실 이름을 입력하세요" + "");
    
    if ((usrname == "") || (usrname === null)) { // 이름에 아무것도 쓰지 안거나 null 값이 들어가면 무한루프 돌림
        alert("잘못 입력하셨습니다.")
    }
    else {
        socketIo.emit("naming", usrname)
        alert("'" + usrname + "'" + "님 으로 입장하셨습니다.")
        break;
    }

}

document.getElementById("userName").value = usrname; // 사용자명 ㅁ <-- 여기에 이름을 고정시킴 (html에 disabled 시켜놓음)


function sendfunc() { //client측에서 서버로 sendData 객체를 보내는 함수
    const sendData = {
        name: usrname, // name에는 내가 작성한 값
        message: sendBoxmessage.value, //message에는 메세지 입력란의 값
        type: select.value // 여기서 select박스에 이름값 즉 귓속말을 보내고 싶은 사람의 이름을 선택해서 type에 귓속말 받을 사람이름을 넣어서 보냄
    }
    let today = new Date();   
    let hours = today.getHours(); // 시
    let minutes = today.getMinutes();  // 분

    if (select.value == 'all') { //전쳇일때
        socketIo.emit("chatSocket", sendData) // emit메소드를 통해 서버로 chatSocket이라는 id로  sendData 객체를보냄
        sendBoxmessage.value = ""; // 입력창에 메세지 입력후 전송시 입력창에 작성한 값 지움.
    }
    else {
        socketIo.emit("partChatSocket", sendData) // 귓속말일때 partChatSocket으로 sendData 객체 보냄
        sendBoxmessage.value = "";


        //여기는 귓속말을 보냈을때 내 채팅창에서 내가 보낸 메세지도 모기위해 html list에 추가시키는 것임
        const partChatList = document.createElement("li");
        partChatList.classList.add("sent")

        const frame3 = `<span class="profile">
        <span class="user">${select.value}<---(귓속말)---${sendData.name}</span>
        <img class="image" src="https://placeimg.com/50/50/any" alt="any">
        </span>
        <span class="message">${sendData.message}</span>
        <span class="time">${ hours + ':' + minutes}</span>`;
        partChatList.innerHTML = frame3;
        messageList.appendChild(partChatList);
    }
}



sendBoxmessage.addEventListener('keypress', (button) => { //Enter입력시 
    if ((button.key === 'Enter') && (sendBoxmessage.value !== "")) {
        sendfunc() // sendfunc 함수를 실행시킴
    }
})
sendButton.addEventListener("click", () => {
    if (sendBoxmessage.value !== "") {
        sendfunc()
    }
}); // 버튼 클릭시 sendfunc를 실행시킴




socketIo.on("naming", (namelist, newName) => { //naming이라는 소켓을 서버로부터 받았을때 뭘해야하는지 구성해놓음
    var selectElement = [] //현재 select박스에 구성되어있는 이름을 넣을 배열
    var list = document.getElementById('selecting'); // select박스 쓰겠다라는것

    for (var i = 0; i < list.length; i++) { // selectElement 배열에 이름값을 넣음
        selectElement.push(list[i].value)
    }

    var names = [] // 서버에 저장된 이름리스트들을 받아서 넣을 배열
    for (var i = 0; i < namelist.length; i++) { // 서버의 namelist에 이름들을 names에 넣음
        names.push(namelist[i])
    }

    // 여기 filter씀 서버에서 받아온 현재 서버에접속되어있는 사람들의 이름을 받아와서 select 박스에 중복되어서 들어가는것을 방지하기위해
    // 모든 이름중 자신의 html의 select박스에 있는 이름을 필터링 시킨 배열을 names 로 반환받음
    names = names.filter(x => !selectElement.includes(x));


    for (var a = 0; a < names.length; a++) { // 필터링한 names 배열의 요소를 하나씩 밑의 selectAdd 함수로 보냄
        selectAdd(names[a])
    }

    //이부분은 새로운 사용자가 들어왔을경우 그 이름을 채팅창에 입장하셨다고 올리기 위해 사용
    const newNameList = document.createElement("li");
    const frame2 = `<div class="newName"><span>
    <span class="user">'${newName}'님이 입장하셨습니다.</span>   
    </span></div>`;
    newNameList.classList.add("newName")
    newNameList.innerHTML = frame2;
    messageList.appendChild(newNameList);
})



function selectAdd(naming) { // 위의 names의 이름 요소를 하나씩 받아옴 ##여기서 이름요소는 이미 중복되는경우를 뺀 이름들임
    if (naming != usrname) { // 여기서 names 이름중 자신의 이름이 있을경우는 slect박스 option요소를 만들지 않음
        // 여기 부분이 select 요소 만드는 부분
        const optionFrame = document.createElement("option");
        optionFrame.text = naming;
        optionFrame.value = naming;
        select.appendChild(optionFrame);
    }
}



socketIo.on("userDisconnect", (removename) => { // 서버측에서 사용자가 나갈경우 userDisconnect 소켓으로 나간사용자 이름을 보내줌
    //여기서는 나간사용자 이름과 select박스의 이름과 동일한 경우가 있을경우 그 부분을 삭제시킴
    var parent = document.getElementById('selecting');
    for (var i = 0; i < parent.length; i++) {
        if (parent[i].value == removename) {
            parent.remove(i);
        }
    }

})



//  !!!!! client측에서 서버에서 응답을 받는 코드 on (서버에서 받는 응답은 (이름,메세지,사진,시간) 묶음을 받음)
// (서버측에서 클라이언트에게서 받은 내용을 필터잡고 보내면 호스트들은 받은것을 채팅에 올림)

function dataSetting(name, message, time) { // 생성자로 보면 되는 함수 (객체 생성및 초기화) 
    this.name = name;
    this.message = message;
    this.time = time;

    this.putList = () => { // (생성자로의 this === 객체 자신)을 이용하여 사용할 함수
        const list = document.createElement("li");

        if (userName.value === this.name) {// if 보낸 list일 경우 css에서 우측에 정렬
            list.classList.add("sent")
        }
        else {  // 받은 list일 경우 css에서 왼쪽 정렬
            list.classList.add("recieved")
        }

        //위의 this를 이용해 `${}` 으로 객체의 이름과 메세지와 시간을 담은 html의 <li>을 만들어
        // frame에 넣고 html코드의 ListBox-messageList에 추가한다.--> 까지가 putList 함수
        const frame = `<span class="profile">
        <span class="user">${this.name}</span>
        <img class="image" src="https://placeimg.com/50/50/any" alt="any">
    </span>
    <span class="message">${message}</span>
    <span class="time">${this.time}</span>`;
        list.innerHTML = frame;
        ListBox - messageList.appendChild(list);
    }
}

//socket io를 이용하여 서버에게서 받은 data를 datasetting 생성자 함수로 객체를 생성하여
//객체를 putList()메소드를 사용하여 list에 넣는다
socketIo.on('chatSocket', (recievedData) => {
    const recievedItem = new dataSetting(recievedData.name, recievedData.message, recievedData.time);
    recievedItem.putList()
    ListBox.scrollTo(0, ListBox.scrollHeight) // 입력시마다 마지막 스크롤을 보여주게 하기위함.
})

//귓속말 소켓을 받았을경우 위의 방식과 동일하게 채팅 리스트에 추가시킴 /(귓속말)이라는 말 추가하여 추가시킴
socketIo.on("partChatSocket", (partData) => {
    if (partData.type == usrname) {
        const partRecievedItem = new dataSetting("(귓속말) " + partData.name, partData.message, partData.time);
        partRecievedItem.putList()
        ListBox.scrollTo(0, ListBox.scrollHeight)
    }
})