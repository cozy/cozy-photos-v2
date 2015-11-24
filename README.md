# [Cozy](http://cozy.io) Photos

Cozy Photos makes your photo management easy. Main features are:

* Simple UI
* Photo upload
* Galleries
* Gallery Sharing

## Install

We assume here that the Cozy platform is correctly [installed](http://cozy.io/host/install.html)
 on your server.

You can simply install the Photos application via the app registry. Click on ythe *Chose Your Apps* button located on the right of your Cozy Home.

From the command line you can type this command:

    cozy-monitor install photos


## Contribution

You can contribute to the Cozy Photos in many ways:

* Pick up an [issue](https://github.com/cozy/cozy-photos/issues?state=open) and solve it.
* Translate it in [a new language](https://github.com/cozy/cozy-photos/tree/master/client/app/locales).
* Photo tagging
* Contact tagging
* Last added photo stream


## Hack

Hacking the Photos app requires you [setup a dev environment](http://cozy.io/hack/getting-started/). Once it's done you can hack Cozy Contact just like it was your own app.

    git clone https://github.com/cozy/cozy-photos.git

Run it with:

    node server.js

Each modification of the server requires a new build, here is how to run a
build:

    cake build

Each modification of the client requires a specific build too.

    cd client
    brunch build

Make sure you have installed imagemagick on your local system otherwise you won't be able to much.

## Tests

![Build
Status](https://travis-ci.org/cozy/cozy-photos.png?branch=master)

To run tests type the following command into the Cozy Photos folder:

    cake tests

In order to run the tests, you must only have the Data System started.

## Icons

by [iconmonstr](http://iconmonstr.com/)

Main icon by [Elegant Themes](http://www.elegantthemes.com/blog/freebie-of-the-week/beautiful-flat-icons-for-free).

## Contribute with Transifex

Transifex can be used the same way as git. It can push or pull translations. The config file in the .tx repository configure the way Transifex is working : it will get the json files from the client/app/locales repository.
If you want to learn more about how to use this tool, I'll invite you to check [this](http://docs.transifex.com/introduction/) tutorial.

## License

Cozy Photos is developed by Cozy Cloud and distributed under the AGPL v3 license.

## What is Cozy?

![Cozy Logo](https://raw.github.com/cozy/cozy-setup/gh-pages/assets/images/happycloud.png)

[Cozy](http://cozy.io) is a platform that brings all your web services in the
same private space.  With it, your web apps and your devices can share data
easily, providing you
with a new experience. You can install Cozy on your own hardware where no one
profiles you.

## Community

You can reach the Cozy Community by:

* Chatting with us on IRC #cozycloud on irc.freenode.net
* Posting on our [Forum](https://forum.cozy.io/)
* Posting issues on the [Github repos](https://github.com/cozy/)
* Mentioning us on [Twitter](http://twitter.com/mycozycloud)
