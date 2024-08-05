const jsmediatags = window.jsmediatags;
let audios = [];
let id = 0;
const audioURLs = [
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/A%20Dramatic%20Irony.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/apathy.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/BAIXO.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/EMPTY%20DREAMS.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/Fine.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/Has%20To%20Be.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/I%20Am%20Atomic.mp3",
    "https://iyf7oq2ise0fykszkb5rtq.on.drv.tw/www.hostingmyweb.com/Moonlight%20Sonata.mp3",
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
                        duration: `${formatDuration(duration)}`,
                        src: song,
                        thumbnail: picture ? `data:image/jpeg;base64,${arrayBufferToBase64(picture.data)}` : null,
                    });

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
                    musicDuration.innerHTML = formatDuration(duration);
                    musicId.innerHTML = id;
                    titleMusic.innerHTML = title;
                    artistMusic.innerHTML = artist;


                    music.appendChild(musicAlbum)
                    music.appendChild(musicDuration)

                    document.querySelector("#songs").appendChild(music)

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
        console.log("Audios:", audios);

        let userData = {
            songs: [...audios],
            currentSong: null,
            songCurrentTime: null,
            duration: 0,
        };

        console.log("User Data:", userData);

        const playpause = document.querySelector(".playpause");
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

                audio.addEventListener('timeupdate', () => {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    progressBar.value = progress;
                    const currentTime = formatDuration(audio.currentTime);
                    ongoingDuraton.innerHTML = currentTime;
                    userData.songCurrentTime = currentTime;
        
                    if (currentTime===userData.duration) {
                        renderSong();
                        playNextSong();
                    }
                });
                progressBar.addEventListener('input', () => {
                    const seekTime = (progressBar.value / 100) * audio.duration;
                    audio.currentTime = seekTime;
                });
            } else {
                console.log(`Song with id ${id} not found`);
            }
        };

        // Render the song info to the screen
        const renderSong = () => {
            const currentSongId = userData.currentSong;
            const song = userData.songs.find((song) => song.id === currentSongId);
            title.innerHTML = song?.title;
            artist.innerHTML = song?.artist;
            songDuraton.innerHTML = song?.duration;
            const currentDuration = userData?.songCurrentTime ? userData?.songCurrentTime : "0:00"; 
            ongoingDuraton.innerHTML = currentDuration;
            thumbnail.setAttribute("src", song?.thumbnail)
        }

        const playNextSong = () => {
            let currentSongId = userData.currentSong;
            if (currentSongId < userData.songs.length) {
                currentSongId += 1;
            } else {
                currentSongId = 0;
            }
            userData.currentSong = currentSongId;
            playSong(currentSongId);
            renderSong();
        }
        const playPreviousSong = () => {
            if (playButton.classList.contains("active")) {
                pauseButton.classList.add("active");
                playButton.classList.remove("active");
            }

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
            renderSong();
        }

        userData.currentSong = 0;
        renderSong()

        // - Events - //

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
                renderSong()
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
            const songId = classname.split("-")[1];
            song.addEventListener("click", () => {
                playSong(songId);
                renderSong();
                document.querySelector(".album-page").classList.toggle("active")
            })
        })
        //end
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
