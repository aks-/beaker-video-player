# beaker-video-player

* beaker-video-player works with dat links apart from working with as any other HTML5 video player does.
* It would automatically find the subtitles for you in dat directory.
* Given a playlist dat link, it returns `next, prev` functions which you can use to navigate through playlist.

```
npm install beaker-video-player
```

## example

``` js
const videoPlayer = require('beaker-video-player')
var url = 'dat://1047fec2e6c4bc9756811a768396912ce89af5f691b7fbbabad3d10/playlist.m3u'

// classname is optional, you can also pass just url string like *videoPlayer(url)*
var { el, prev, next } = videoPlayer({ url, classname: 'foobar' })
el.setAttribute('controls', true)
el.setAttribute('autoplay', true)
el.setAttribute('height', 500)
el.setAttribute('width', 500)

document.body.appendChild(el)

document.getElement
```

## License

MIT
