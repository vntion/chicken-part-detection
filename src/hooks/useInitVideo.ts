import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";

type Props = {
  file: File | null;
  videoNode: RefObject<HTMLVideoElement | null>;
  videoURLRef: RefObject<string | null>;
  playerRef: RefObject<Player | null>;
  onReadyToPlay: Dispatch<SetStateAction<boolean>>;
};

const useInitVideo = ({
  file,
  videoNode,
  videoURLRef,
  playerRef,
  onReadyToPlay,
}: Props) => {
  useEffect(() => {
    if (!videoNode.current || !file) return;

    const videoElement = videoNode.current;

    // Bersihkan URL lama sebelum membuat yang baru
    if (videoURLRef.current) {
      URL.revokeObjectURL(videoURLRef.current);
    }

    const videoURL = URL.createObjectURL(file);
    videoURLRef.current = videoURL;

    // Hapus player sebelumnya jika ada
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // Tunggu sebentar sebelum inisialisasi player baru
    // untuk memastikan DOM sudah bersih
    const timeoutId = setTimeout(() => {
      // Buat player baru
      const newPlayer = videojs(videoElement, {
        controls: true,
        preload: "auto",
        responsive: true,
        fluid: true,
        sources: [{ src: videoURL, type: file.type }],
      });

      playerRef.current = newPlayer;

      newPlayer.on("loadedmetadata", () => {
        onReadyToPlay(true);
      });

      // Load video secara eksplisit
      newPlayer.load();
    }, 100);

    return () => {
      clearTimeout(timeoutId);

      // Cleanup player
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      // Cleanup URL object
      if (videoURLRef.current) {
        URL.revokeObjectURL(videoURLRef.current);
        videoURLRef.current = null;
      }
    };
  }, [file, onReadyToPlay, playerRef, videoNode, videoURLRef]);
};

export default useInitVideo;
