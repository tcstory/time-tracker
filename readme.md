# firefox-extension-webpack

## how to

step 1:

install dependencies.

step 2:

run `npm run start`

step 3:

in another terminal, run `./node_modules/.bin/web-ext run -s build`.


**difference in chrome-extension-webpack-boilerplate**

even though `web-ext` will automatically reload your extension into firefox, but it won't reload your web page, 
you have to reload the page manually. there is `hot-reload` in the chrome-extension-webpack-boilerplate, 
but i cant make it work in firefox, so if you can solve the problem, feel free to submit a pr.

# inspired by the following projects

1. [chrome-extension-webpack-boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)