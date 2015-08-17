# Curve.app

Curve App is a vector drawing desktop application written in JavaScript and based on Electron. It is mostly an Electron wrapper over the [Curve](http://github.com/benogle/curve) vector drawing library.

![shot](https://cloud.githubusercontent.com/assets/69169/9296032/f8031768-4436-11e5-9917-d186d15c9c38.png)

Note: at this point it is a toy (MVP!) intended to serve as a real-ish example of an Electron app. It has all the trimmings most apps will need:

* Window management
* File management (open, save, save as, dealing with modified files)
* Menus
* Keyboard shortcuts
* Passing command line parameters from the browser process to the renderer process

## Features

* Open and save SVG files
* Create Paths (pen tool)
* Create Rectangles (rectangle tool)
* Create Ellipses (ellipse tool)
* Edit object shapes (rectangles, ellipses, paths: nodes and their handles)
* Edit object fill color

## TODO

* Undo
* Zoom
* Multi-select
* Better handle management on nodes (break, join, pull)
* Legit color picker that allows alpha
* The editing of more parameters (more than just fill!)
* Layer management
* Like everything else a legit vector drawing app has...

## Developing

```bash
script/bootstrap
script/run

# To open a file from the command line
script/run path/to/file.svg
```
