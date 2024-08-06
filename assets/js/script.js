const jsmediatags = window.jsmediatags;
let audios = [];
let id = 0;
const audioURLs = [
    "http://localhost:8000/audios/A%20Dramatic%20Irony.mp3",
    "http://localhost:8000/audios/apathy.mp3",
    "http://localhost:8000/audios/BAIXO.mp3",
    "http://localhost:8000/audios/EMPTY%20DREAMS.mp3",
    "http://localhost:8000/audios/Fine.mp3",
    "http://localhost:8000/audios/Has%20To%20Be.mp3",
    "http://localhost:8000/audios/I%20Am%20Atomic.mp3",
    "http://localhost:8000/audios/Moonlight%20Sonata.mp3",
    "http://localhost:8000/audios/unravel%20-%20Slow%20Version%20(From_%20_Tokyo%20Ghoul_).mp3",
    "http://localhost:8000/audios/Sea%20Of%20Problems.mp3",
    "http://localhost:8000/audios/On%20My%20Own.mp3",
    "http://localhost:8000/audios/Lost%20Umbrella.mp3",
    "http://localhost:8000/audios/GigaChad%20Theme%20-%20Phonk%20House%20Version.mp3",
    "http://localhost:8000/audios/ecstacy.mp3",
    "http://localhost:8000/audios/this%20feeling.mp3",

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
        // console.log("Audios:", audios);

        let userData = {
            songs: [...audios],
            currentSong: null,
            songCurrentTime: null,
            duration: 0,
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

                audio.addEventListener('timeupdate', () => {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    progressBar.style.setProperty('--progress-width', `${progress}%`);
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
            sortSongs()
            if (!document.querySelector("li.song")) renderPlaylist();
            const currentSongId = userData.currentSong;
            const song = userData.songs.find((song) => song.id === currentSongId);
            document.querySelector("body").style.cssText = `
            background-image: url(${song?.thumbnail});`

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
            const songId = classname.split("-")[1] - 1;
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
    document.querySelector("#progress-bar").value = 0;
})
