const APP_ID = "7ba92285b9a747d0bbe429009de04513"
let uid = sessionStorage.getItem('uid')
if (!uid) {
    uid = String(Math.floor(Math.random() * 10000))
    sessionStorage.setItem('uid', uid)
}
let token = null;
let client;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')
if (!roomId) {
    roomId = 'main'
}
let localTracks = []//stores audio and video streams
let remoteUsers = {}

let joinRoomInit = async () => {
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    await client.join(APP_ID, roomId, token, uid)
    joinStream()
}
let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `<div class="video__container" id="user-container-${uid}">
                                <div class="video-player" id="user=${uid}"></div>
                     </div>`
    document.getElementById('streams__container').insertAdjacentHTML('beforeend',player)
    localTracks[1].play(`user-${uid}`)                 
}
//room.html?room=234