chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let imageSizes = calcImages();
  sendResponse({imageSizes});
});

function calcImages() {
  let images = document.getElementsByTagName('img');
  let sizes = [];
  for (let image of images) {
    sizes.push({
      width: image.width,
      height: image.height
    });
  }
  return sizes;
}

