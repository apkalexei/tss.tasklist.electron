# TSS.Demo Lista de tareas en Electron Desktop App Cross Platform (EDACP)

TSS Demo TaskList de ejemplo construido con electron

### Version
1.0.0

## Como usar

### Instalación de Electron

Instalar Electron como paquete global ()

```sh
$ npm install -g electron
$ npm install -g electron-packager
$ npm install -g asar
```

```sh
$ yarn global add electron
$ yarn global add electron-packager
$ yarn global add asar
```

Instalar solo para la aplicación como devDependencies 

```sh
$ npm install electron --save-dev
$ npm install electron-packager --save-dev
```

```sh
$  yarn add --dev electron
$  yarn add --dev electron-packager
```

Instalar todas las dependencias

```sh
$ npm install
```

```sh
$ yarn install
```

### Correr la aplicación 
To run electron

```sh
$ npm start
```

```sh
$ yarn start
```

### Para empaquetar la aplicación para todas las plataformas

For Windows

```sh
$ npm run package-win
```

For Mac

```sh
$ npm run package-mac
```

For Linux

```sh
$ npm run package-linux
```

###  Create binaries for both Windows and OS X

```sh
$ npm run pack
```

###  Create installer for OS X

```sh
$ npm run build:osx
```
###  Start app directly

```sh
$ npm run dev  
```