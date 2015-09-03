# Gifbomb

A node script that generates a hu-uge GIF image.

No external dependencies, just run `node gifbomb` and ~~it will freeze~~ sooner or later it will give the gif contents to `stdout`. That's just a proof of concept, not a prod tool.


## Usage

```
node gifbomb [width [height]]
```

For example,

```
node gifbomb 65535 > enormous.gif
```

