/* istanbul ignore file */

// IMPORTANT! leave upper blank line so this file is ignored for coverage!!! More on this issue here
// https://github.com/facebook/create-react-app/issues/6106#issuecomment-550076629
import { REACT_PLAYER_WRAPPER_ID } from "../../constants/appConstants";

export default () => {
  const player = document.querySelector(
    `#${REACT_PLAYER_WRAPPER_ID} > video`
  );
  if (!player) return;
  // @ts-ignore
  if (player.requestFullScreen) {
    // @ts-ignore
    player.requestFullScreen();
    // @ts-ignore
  } else if (player.webkitRequestFullScreen) {
    // @ts-ignore
    player.webkitRequestFullScreen();
    // @ts-ignore
  } else if (player.mozRequestFullScreen) {
    // @ts-ignore
    player.mozRequestFullScreen();
    // @ts-ignore
  } else if (player.msRequestFullscreen) {
    // @ts-ignore
    player.msRequestFullscreen();
    // @ts-ignore
  } else if (player.webkitEnterFullscreen) {
    // @ts-ignore
    player.webkitEnterFullscreen(); //for iphone this code worked
  }
};
