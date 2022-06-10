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
    console.log('hi');
    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    await client.join(APP_ID, roomId, token, uid)
    client.on('user-published', handleUserPublished)
    client.on('user-left', handleUserLeft)
    joinStream()
}
let joinStream = async () => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    /*localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:{
        width:{min:640,ideal:1920,max:1920},
        height:{min:480,ideal:1080,max:1080}
    }})
    use  only when working with multiple users
    */
    let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"></div>
                     </div>`
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    document.getElementById(`user-container-${uid}`).addEventListener('click',expandVideoFrame);
    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[0], localTracks[1]])
}
let handleUserPublished = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player === null) {
        player = `<div class="video__container" id="user-container-${user.uid}">
                         <div class="video-player" id="user-${user.uid}"></div>
                      </div>`
        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click',expandVideoFrame);

    }
    if(displayFrame.style.display)
    {
        let player1 = document.getElementById(`user-container-${user.uid}`);
        player1.style.height='300px';
        player1.style.width='300px';
    }
    if (mediaType === 'video') {
        console.log(user.videoTrack)
        user.videoTrack.play(`user-${user.uid}`)
    }
    if (mediaType === 'audio') {
        user.audioTrack.play()
    }

}
expandVideoFrame=(e)=>{
    let child=displayFrame.children[0];
    if(child)
    {
       document.getElementById('streams__container').appendChild(child);
    }
    displayFrame.style.display='block';
    displayFrame.appendChild(e.currentTarget)
    userIdInDisplayFrame=e.currentTarget.id
    console.warn(displayFrame);
    for(let i=0;i<videoFrames.length;i++)
    {
       if(videoFrames[i].id!=userIdInDisplayFrame){
           videoFrames[i].style.width='150px';
           videoFrames[i].style.height='150px';
       }
    }
}
let handleUserLeft=async(user)=>{
    delete remoteUsers[user.id];
    document.getElementById(`user-container-${user.uid}`).remove()
    if(userIdInDisplayFrame === `user-container-${user.uid}`){  //if the user in main frame leaves
        displayFrame.style.display='none';
    }
    for(let i=0;i<videoFrames.length;i++)
    {
        videoFrames[i].style.height='300px';
        videoFrames[i].style.width='300px';
    }
}
let toggleCamera=async(e)=>{
   let button=e.currentTarget;
   if(localTracks[1].muted)
   {
    await localTracks[1].setMuted(false);
    button.classList.add('active')
   }
   else{
    await localTracks[1].setMuted(true);
    button.classList.remove('active')
   }
}
let toggleAudio=async(e)=>{
    let button=e.currentTarget;
    if(localTracks[0].muted)
    {
     await localTracks[0].setMuted(false);
     button.classList.add('active')
    }
    else{
     await localTracks[0].setMuted(true);
     button.classList.remove('active')
    }
 }
document.getElementById('camera-btn').addEventListener('click',toggleCamera)
document.getElementById('mic-btn').addEventListener('click',toggleAudio)
joinRoomInit();

//room.html?room=234