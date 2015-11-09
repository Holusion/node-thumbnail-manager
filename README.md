# node-thumbnail-manager

A Thumbnail Manager in native javascript

[![Build Status](https://travis-ci.org/Holusion/node-thumbnail-manager.svg?branch=master)](https://travis-ci.org/Holusion/node-thumbnail-manager)[![Test Coverage](https://codeclimate.com/github/Holusion/node-thumbnail-manager/badges/coverage.svg)](https://codeclimate.com/github/Holusion/node-thumbnail-manager/coverage)


using freedesktop's [Thumbnail Managing Standard](http://specifications.freedesktop.org/thumbnail-spec/thumbnail-spec-latest.html).

It's like the [xdg-thumbnails](https://www.npmjs.com/package/xdg-thumbnails) module but without dbus.

**Pros** :
- You don't need any additional service except some freedesktop compliant thumbnailers
- Your thumbnailers can be dead simple without dbus.
- it's the chosen way of doing things in Gnome 3 so it should spread.

**Cons** :
- Generic thumbnailers like [tumbler](https://github.com/nemomobile/tumbler) don't provide a `.thumbnailer` interface while they sometimes provide the thumbnailing dbus service.

This module is likely the best choice if you don't really care about existing generic thumbnailers but want to install and choose your own -simple as possible- thumbnailing apps.

It leverages the ```Thumb::MTime``` key (like defined in the [PNG spec](http://www.w3.org/TR/PNG/#C.tEXt)) to define if the thumbnail is valid.

## Usage

### Request a thumbnail

    var Thumbnailer = require("thumbnail-manager");
    var thumbnailer = new Thumbnailer();
    thumbnailer.request("/absolute/path/to/file",function(err,thumb_path){
      if(err){
        //thumbnail failed
      }
      //Do something with the image located at "thumb_path".
    });

Can be used with es-6 Promises :

    thumbnailer.request("/absolute/path/to/file").then(function(thumb_path){
      //Do something with the thumbnail
    }).catch(function(e){
      //There was an error.
    });

### Clean thumbnails

no cleaning is done by default. The reason is cleaning is a time consuming process you might want to customize :

- Periodicity
  - Clean everything on start, then keep unused thumbnails until next restart
  - Periodically clean thumbnails
  - limit the amount of time spent doing cleanup on each start (if a thousand files have changed...)
- Restrictivity
  - keep thumbnails that doesn't have a valid URI key
  - delete oldest / least used thumbnails
    - Based on time since last access
    - Based on a max disk usage we want to respect

The module provide a basic `clean` method that doesn't offer this level of tuning. Help on improving this based on real use cases is welcomed.

    thumbnailer.clean({},function(err){
      //Manage error
    });

Currently only clean outdated thumbnails. The option object will later allow to choose which thumbnails should be kept.

### Tuning

No options are required, but one can tune the manager by providing an "option" object with the following arguments :

    {
      dir:"$HOME/.cache/thumbnails", //destination dir, replacing XDG's default,
      timeout: 5000, //thumbnailer max time before it's killed. in milliseconds.
      threads: 2 //Max allowed concurrent builds.
    }

## Writing a thumbnailer

Possible informations a thumbnailer could be given :

%u URI of the file
%i input filename
%o output file path
%s maximum desired size

These options can be given in any order using a **Thumbnailer Entry** block :

    [Thumbnailer Entry]
    Exec=your-thumbnailer %i %o %s
    MimeType=application/x-yourType;

Placed in `/usr/share/thumbnailers/your_thumbnailer_name.thumbnailer`

To declare a new mime type, you should use the [shared mime info](http://www.freedesktop.org/wiki/Specifications/shared-mime-info-spec/) specification.

### Basic implementation

Simplest thing is an image thumbnailer using imagemagick :

    #!/bin/sh
    MTIME=$(stat -c "%y" "$1")
    convert -background black -resize $3x$3 "$1" -set Thumb::URI "$1" -set Thumb::MTime "$MTIME" "$2"

Which will be placed in /usr/local/bin and called with :

    Exec=/usr/local/bin/image-thumbnbailer %i %o %s

More command line tags available on the Gnome [Spec](https://tecnocode.co.uk/2013/10/21/writing-a-gnome-thumbnailer/).

### Better implementation

Implementing the `Thumb::URI` and `Thumb::MTime` keys is a required minimum. Better implementations could use the **fail** mechanism to speed up failure.

For a thumbnail request to `$HOME/.cache/thumbnails/normal/<md5_hash>.png`, one could write an empty png in `$HOME/.cache/thumbnails/fail/<thumbnailer>-<version>/<md5_hash>.png` to register a failure.


## TODO

- **cleanup**. The specification doesn't recommend a precise clean [method](http://specifications.freedesktop.org/thumbnail-spec/thumbnail-spec-latest.html#DELETE).
  - in every case it's usefull to have a clean() method which will be called by any mean.
- **load balancing**
  - Possibly activated via an option.
  - Prevent more than *x* thumbnails from being created at the same time. *x* can be the number of CPU cores or an explicit option.
- prevent zombie child processes
  - If for some reason a thumbnailer doesn't exit, we should kill it after a reasonable amount of time.
- **fail**. The specification advise to povide a `fail/` directory to allow implementors to register a thumbnail that could not be created.
  - It's unclear whether the manager should first check for previous failure or just leave the thumbnailer with the responsibility to do it.
  - Should the manager have to verify failed thumbnails, we don't have a recommended mechanism to verify the generator's version to know about an update which might have fixed it.
