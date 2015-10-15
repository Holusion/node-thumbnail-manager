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
- Generic thumbnailers like [tumbler](https://github.com/nemomobile/tumbler) don't provide an interface while they sometimes provide the thumbnailing dbus service.
- no built in Enqueue / Dequeue capabilities. No load balancing. Try to query a hundred thumbnails at a time...

This module is likely the best choice if you don't really care about existing generic thumbnailers but want to install and choose your own -simple as possible- thumbnailing apps.

It leverages the ```Thumb::MTime``` key (like defined in the [PNG spec](http://www.w3.org/TR/PNG/#C.tEXt)) to define if the thumbnail is valid.

## Writing a thumbnailer

Possible informations a thumbnailer could be given :

%u URI of the file
%i input filename
%o output file path
%s maximum desired size

These options can be given in any order using a **Thumbnailer Entry** block :

    [Thumbnailer Entry]
    TryExec=your-thumbnailer
    Exec=your-thumbnailer -s %s %u %o
    MimeType=application/x-yourType;

To declare a new mime type, you should use the [shared mime info](http://www.freedesktop.org/wiki/Specifications/shared-mime-info-spec/) specification.

## TODO

- **cleanup**. The specification doesn't recommend a precise clean [method](http://specifications.freedesktop.org/thumbnail-spec/thumbnail-spec-latest.html#DELETE).
  - in every case it's usefull to have a clean() method which will be called by any mean.
- load balancing
  - Possibly activated via an option.
  - Prevent more than *x* thumbnails from being created at the same time. *x* can be the number of CPU cores or an explicit option.
- prevent zombie child processes
  - If for some reason a thumbnailer doesn't exit, we should kill it after a reasonable amount of time.
- Use the ```fail/``` folder.
  - Register failed attempts in ```fail/<thumbnailer_name>/<hash>.png```
  - Check in this directory if the thumbnail already failed before.
