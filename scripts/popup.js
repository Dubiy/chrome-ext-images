document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {data: 'hello'}, function (response) {
      document.getElementById('total-images').innerText = response.imageSizes.length
      if (response.imageSizes.length) {
        updateGraph(response.imageSizes)
      }
    });
  });
});

function updateGraph(data) {
  let canvas = document.getElementById('chart');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'chart';
    document.body.appendChild(canvas);
  }
  let ctx = canvas.getContext('2d');
  let rect = canvas.getBoundingClientRect();
  let padding = 25, stepX = 3, stepY = 3;
  ctx.canvas.width = rect.width;
  ctx.canvas.height = rect.height;

  let minWidth = Math.min(...data.map(size => size.width));
  let maxWidth = Math.max(...data.map(size => size.width));
  let minHeight = Math.min(...data.map(size => size.height));
  let maxHeight = Math.max(...data.map(size => size.height));

  let mapX = x => (x - minWidth) * (ctx.canvas.width - padding) / (maxWidth - minWidth) + padding / 2;
  let mapY = y => ctx.canvas.height - (y - minHeight) * (ctx.canvas.height - padding) / (maxHeight - minHeight) - padding / 2;

  let groupedData = {};
  data.forEach(size => {
    let x = parseInt(size.width / stepX, 10) * stepX;
    let y = parseInt(size.height / stepY, 10) * stepY;

    if (!groupedData[x]) {
      groupedData[x] = {};
    }

    if (!groupedData[x][y]) {
      groupedData[x][y] = {
        count: 0
      }
    }
    groupedData[x][y].count++;
  });

  ctx.fillStyle = 'rgba(0,0,0,0.5)';

  for (let x of Object.keys(groupedData)) {
    for (let y of Object.keys(groupedData[x])) {
      ctx.beginPath();
      ctx.arc(mapX(x), mapY(y), groupedData[x][y].count, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  //draw scales
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#000000'
  ctx.font = "12px Arial";
  ctx.fillStyle = 'rgba(0,0,0,1)';

  ctx.beginPath();
  ctx.moveTo(padding / 2, padding / 2);
  ctx.lineTo(padding / 2, ctx.canvas.height - padding / 2);

  ctx.moveTo(padding / 2, ctx.canvas.height - padding / 2);
  ctx.lineTo(ctx.canvas.width - padding / 2, ctx.canvas.height - padding / 2);
  ctx.textAlign = "left";
  ctx.fillText(minWidth + 'px', padding / 2, ctx.canvas.height - 2);
  ctx.textAlign = "right";
  ctx.fillText(maxWidth + 'px', ctx.canvas.width - padding / 2, ctx.canvas.height - 2);

  ctx.save();
  ctx.translate(0, 0);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "left";
  ctx.fillText(minHeight + 'px', -(ctx.canvas.height - padding / 2), padding / 2 - 3);
  ctx.textAlign = "right";
  ctx.fillText(maxHeight + 'px', -padding / 2 + 2, padding / 2 - 3);
  ctx.restore();

  ctx.stroke();
}