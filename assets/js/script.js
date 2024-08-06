const jsmediatags = window.jsmediatags;
let audios = [];
let id = 0;
const audioURLs = [
    "https://dl.dropboxusercontent.com/scl/fi/0ibntrbhhs6q4gzfmht6b/BAIXO.mp3?rlkey=weotx6k0900vi698x05z6ktyz&st=c10ia2nt&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/jocjyj17a1nww4yhbbi0r/A-Dramatic-Irony.mp3?rlkey=y1b341xz6n52zsust78fc5cke&st=pdvr3vkd&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/92prriduaaww2hn3gd8za/apathy.mp3?rlkey=t7uepatyykjdzdn24pytytd3f&st=pkhn530x&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/m9spstcdk1jzwubzsxtm3/ecstacy.mp3?rlkey=qiksyngz5jtd23m4idjghf3oe&st=v5bujwkx&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/hoeb21l0qjlmgfp74xud6/EMPTY-DREAMS.mp3?rlkey=dfoyudp2m5n1fdcyjwfbbml0m&st=3s2e1ttz&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/9u2qxm9r8kmrt071yjy6u/Fine.mp3?rlkey=zd8pvdxhxp8icn85x5pvqr3nz&st=w56we9f0&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/34u2dlbzn7brqx4gton3x/GigaChad-Theme-Phonk-House-Version.mp3?rlkey=bka4esew6of7uwicup37fea37&st=e0aqril6&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/blwqfhbwtgxzof00bcdd3/Has-To-Be.mp3?rlkey=f5iofe2xfbz86k7q8mwqjzpcm&st=muy4cyd0&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/sln1jw5ppc35w7s2bf5ds/I-Am-Atomic.mp3?rlkey=mh90henl4oymt76ksznhmotxs&st=dx5yfae7&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/2ywvi1x3jbiaaexqen5bv/Lost-Umbrella.mp3?rlkey=cw090ge63t3vd0msr00pnyk6i&st=2uxbntjg&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/ehkiwv0889akzooonk5cl/Moonlight-Sonata.mp3?rlkey=j22frc8cz8j9h7y09l5fay9t3&st=aqmubuej&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/4uholk5hywj919eu8hjc9/On-My-Own.mp3?rlkey=3rog9bb4kipo2xfrk3exi6667&st=rmovf8bj&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/t9xabtzjr0lp3r76f2fob/Sea-Of-Problems.mp3?rlkey=buu0615mu9wixel37rxyp3447&st=hp9wobfu&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/yaxez8fh6t1orb7wi3eug/this-feeling.mp3?rlkey=a0bgvq6f55steay2gukhwlsgq&st=54oh3kkf&dl=0",
    "https://dl.dropboxusercontent.com/scl/fi/p3d4v621y09y2gea9m103/unravel-Slow-Version-From_-_Tokyo-Ghoul_.mp3?rlkey=j2mxnvfjefs7f3rpnnrmb229z&st=2uwc749o&dl=0"
];

// Function to process each audio
const processAudio = (song) => {
    return new Promise((resolve, reject) => {
        jsmediatags.read(song, {
            onSuccess: (tag) => {
                const tags = tag.tags;

                // Extracting the details
                const title = tags.TIT2 ? tags.TIT2.data : 'Unknown Title';
                const artist = tags.TPE1 ? tags.TPE1.data : 'Unknown Artist';
                const album = tags.TALB ? tags.TALB.data : 'Unknown Album';
                const year = tags.TYER ? tags.TYER.data : 'Unknown Year';
                const picture = tags.APIC ? tags.APIC.data : null;

                const audio = new Audio(song);
                audio.addEventListener('loadedmetadata', () => {
                    const duration = audio.duration;

                    audios.push({
                        id: id,
                        title: title,
                        artist: artist,
                        album: album,
                        duration: `${formatDuration(duration)}`,
                        src: song,
                        thumbnail: picture ? `data:image/jpeg;base64,${arrayBufferToBase64(picture.data)}` : null,
                    });
                    id += 1;
                    resolve();
                });
                audio.addEventListener('error', () => {
                    reject(new Error('Failed to load audio metadata'));
                });
            },
            onError: (error) => {
                reject(error);
            }
        });
    });
};

// Load all audio data
Promise.all(audioURLs.map(processAudio))
    .then(() => {
        console.log("All audio data loaded.");
        document.querySelector(".loader-body").style.display = "none";
        // console.log("Audios:", audios);

        let userData = {
            songs: [...audios],
            currentSong: null,
            duration: 0,
            songCurrentTime: null,
        };

        const playButton = document.querySelector(".play");
        const pauseButton = document.querySelector(".pause");

        const prevButton = document.querySelector(".prev");
        const nextButton = document.querySelector(".next");

        const title = document.querySelector(".song-title");
        const artist = document.querySelector(".song-artist");
        const thumbnail = document.querySelector("#thumbnail-img");

        const progressBar = document.querySelector("#progress-bar");
        const ongoingDuraton = document.querySelector(".ongoing-duration");
        const songDuraton = document.querySelector(".song-duration");

        const audio = new Audio();

        // - Functions - //
        // Play song
        const playSong = (id) => {
            id = Number(id)
            if (playButton.classList.contains("active")) {
                pauseButton.classList.add("active");
                playButton.classList.remove("active");
            }
            const song = audios.find((song) => song.id === id);
            if (song) {
                if (audio.src !== song.src) {
                    audio.src = song.src;
                }
                audio.play();
                console.log("Now playing:", song.title);
                userData.currentSong = id;
                userData.duration = song.duration;
                renderSong();
            } else {
                console.log(`Song with id ${id} not found`);
            }
        };

       const renderPlaylist = () => {
        userData.songs.forEach((audio) => {
            let id = audio.id + 1;
            let album = audio.album;
            let duration = audio.duration;
            let title = audio.title;
            let artist = audio.artist;

            let music = document.createElement("li");
                    music.classList.add(`song`);
                    music.classList.add(`song-${id}`);

                    let musicId = document.createElement("span");
                    musicId.classList.add("id");
                    music.appendChild(musicId)

                    let musicTitle = document.createElement("span");
                    musicTitle.classList.add("music-title");

                    let titleMusic = document.createElement("p")
                    titleMusic.classList.add("title")
                    
                    let artistMusic = document.createElement("p")
                    artistMusic.classList.add("artist")

                    music.appendChild(musicTitle)
                    musicTitle.appendChild(titleMusic)
                    musicTitle.appendChild(artistMusic)

                    let musicAlbum = document.createElement("span");
                    musicAlbum.classList.add("album")
                    let musicDuration = document.createElement("span");
                    musicDuration.classList.add("duration")


                    musicAlbum.innerHTML = album;
                    musicDuration.innerHTML = duration;
                    musicId.innerHTML = id;
                    titleMusic.innerHTML = title;
                    artistMusic.innerHTML = artist;


                    music.appendChild(musicAlbum)
                    music.appendChild(musicDuration)

                    document.querySelector("#songs").appendChild(music)
        })
       }
        const sortSongs = () => {
            userData.songs.sort((a, b) => a.title.localeCompare(b.title));        
            userData.songs.forEach((song, index) => {
                song.id = index;
            });
        }
        // Render the song info to the screen
        const renderSong = () => {
            sortSongs();
            progressBar.value = 0;
            if (!document.querySelector("li.song")) renderPlaylist();
            const currentSongId = userData.currentSong;
            const song = userData.songs.find((song) => song.id === currentSongId);
            document.querySelector("body").style.cssText = `background-image: url(${song?.thumbnail});`
            title.innerHTML = song?.title;
            artist.innerHTML = song?.artist;
            songDuraton.innerHTML = song?.duration;
            const currentDuration = userData?.songCurrentTime ? userData?.songCurrentTime : "0:00"; 
            ongoingDuraton.innerHTML = currentDuration;
            thumbnail.setAttribute("src", song?.thumbnail);
            const songs = document.getElementsByClassName("song");
            for (let i = 0; i < songs.length; i++) {
                songs[i].classList.remove("playing")
            }
            let currentSong = songs[userData.currentSong]
            currentSong.classList.add("playing");
            // console.log("User Data:", userData);
        }

        const playNextSong = () => {
            let currentSongId = userData.currentSong;
            if (currentSongId < userData.songs.length - 1) {
                currentSongId += 1;
            } else {
                currentSongId = 0;
            }
            userData.currentSong = currentSongId;
            playSong(currentSongId);

        }
        const playPreviousSong = () => {
            let currentSongId = userData.currentSong;
            if (currentSongId > 0) {
                currentSongId -= 1;
            } else {
                currentSongId = userData.songs.length-1;
            }
            const song = userData.songs.find((song) => song.id === currentSongId);
            userData.currentSong = currentSongId;
            userData.duration = song.duration;
            playSong(currentSongId);
        }
        userData.currentSong = 0;
        renderSong();

        // - Event listeners - //
        audio.addEventListener('timeupdate', () => {
            const progress = (audio.currentTime / audio.duration) * 100;
            userData.songCurrentTime = formatDuration(audio.currentTime);
            progressBar.style.setProperty('--progress-width', `${progress}%`);
            progressBar.value = progress;
            const currentTime = formatDuration(audio.currentTime);
            ongoingDuraton.innerHTML = currentTime;

            if (currentTime===userData.duration) {
                renderSong();
                playNextSong();
            }
        });
        progressBar.addEventListener('input', () => {
            const seekTime = (progressBar.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        });

        //  Play and pause buttons
        playButton.classList.add("active")
        playButton.addEventListener("click", () => {
            if (playButton.classList.contains("active")) {
                playButton.classList.remove("active");
                pauseButton.classList.add("active");
                let currentSongId;
                if (userData.currentSong == null) {
                    currentSongId = 0;
                    userData.currentSong = 0;
                } else {
                    currentSongId = userData.currentSong;
                }
                playSong(currentSongId);
            }
        });
        pauseButton.addEventListener("click", () => {
            if (pauseButton.classList.contains("active")) {
                pauseButton.classList.remove("active");
                playButton.classList.add("active");

                audio.pause();
                console.log("Paused:", userData.currentSong);
            }
        });
        nextButton.addEventListener("click", playNextSong)
        prevButton.addEventListener("click", playPreviousSong);

        document.querySelectorAll(`.song`).forEach((e) => {
            let classname = e.className.split(' ')[1]
            const song = document.querySelector(`.${classname}`)
            const songId = classname.split("-")[1] - 1;
            song.addEventListener("click", () => {
                playSong(songId);
                document.querySelector(".album-page").classList.toggle("active")
            })
        })
    })
    .catch((error) => {
        console.error('Error loading audio data:', error);
    });

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

window.addEventListener("DOMContentLoaded", () => {
    const albumPage = document.querySelector(".album-page")

    const playlistIcon = document.getElementById("playlistIcon")

    playlistIcon.addEventListener("click", () => {
        albumPage.classList.toggle("active")
    })
})
