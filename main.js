// Declaramos nuestras constantes de aplicación invocando a Electron y algunas API's ya conocidas de NodeJS 
const electron = require('electron');
const path = require('path');
const url = require('url');

// Establecer la variable Environment, para habilitar y deshabilitar el DevTools
process.env.NODE_ENV = 'production';

/*Declaramos nuestras constantes de aplicación que usaremos con Electron en nuestra aplicacion.
  Estos módulos son propios de electron y se identifican siempre con el mismo nombre
  BrowserWindow es un módulo de Chromiun para el gestor de ventanas */
const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let childWindow;


// Escucha que la aplicación esté lista
app.on('ready', function(){
  // Crea una ventana
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden', //Podemos comentar si no se quiere ocultar el TitleBar, propiedad de nuestra ventana
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#ececec',
    show: false,  // No lo mostramos en un inicio, Electron lo hará cuando este 'ready-to-show' 
    icon: __dirname + '/favicon.ico', // Podemos ejecutar con un favicon.
    //icon: path.join(__dirname, 'assets/icons/mac/icon.icns')
  });
  // Carga el html page en un window
    mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes:true
  }));
   // Mediante este evento muestra la ventana principal cuando está cargada y lista para mostrar
    mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  });
 
  /* Emite el evento a través de un handler cuando la ventana está cerrada
     Liberamos los recursos referentes a la ventana
  */
    mainWindow.on('closed', function () {
    /* Des-referencia el objeto de windows, para poder instanciar y almacenar más ventanas 
       en un array de memoria, si la aplicación dispone de mas ventanas, sabrá 
       cuando debe eliminar el elemento correspondiente.
    */
    mainWindow = null
  });

    // Crear menú desde plantilla (template), que vamos a construir líneas abajo.
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insertamos el menu en la aplicación
    Menu.setApplicationMenu(mainMenu);
  
});

// Función handler para crea la ventana hija
function createChildWindow(){
    childWindow = new BrowserWindow({ 
    titleBarStyle: 'hidden',  //Le damos algunas propiedades de nuestra ventana, por ejemplo ocultamos el TitleBar y sin frame.
    frame: false,
    width: 270,
    height:180,
    title:'Agregar una tarea', 
    icon: __dirname + '/favicon.ico', // Podemos ejecutar con un favicon.
    //icon: path.join(__dirname, 'assets/icons/mac/icon.icns'),
    parent: mainWindow, // Aquí le indicamos de quien depende
    show: false,  // No lo mostramos en un inicio, hasta que este totalmente lista 'ready-to-show' 
    modal: true, //Le damos la propiedad de Modal Window  
});
   // Muestra la ventana hija cuando está cargada y lista para mostrar, invocando al evento ready-to-show
    childWindow.once('ready-to-show', () => {
        childWindow.show()
    });
  // Y desde este método asignando al objeto, cargamos un html, que se comportará como ventana hija  
    childWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'task.html'),
        protocol: 'file:',
        slashes:true
    }));

/* Emite el evento 'close' a través de un handler cuando la ventana esta cerrada
   Liberamos los recursos referentes a la ventana 
*/
  childWindow.on('close', function(){
      childWindow = null;
  });

}

/*************************************************************** */
// Ventana Acerca
function openAboutWindow() {
  
    let aboutWindow = new BrowserWindow({
      parent: mainWindow,
      modal: true,
      show: false,
      width: 400,
      height: 252
    });
    aboutWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'about.html'),
      protocol: 'file:',
      slashes: true
    }));
    // Muestra la ventana hija cuando está cargada y lista para mostrar, invocando al evento ready-to-show
    aboutWindow.once('ready-to-show', () => {
      aboutWindow.show()
    });

    /* Emite el evento 'close' a través de un handler cuando la ventana esta cerrada
       Liberamos los recursos referentes a la ventana 
    */
    aboutWindow.on('close', function(){
    aboutWindow = null;
    });
  }
  /*************************************************************** */

  /* Escuchamos el evento `window-all-closed` y si no estamos en Mac cerramos la aplicación
   lo de Mac es debido a que en este SO es común que se pueda cerrar todas las ventanas sin cerrar
   la aplicación completa 
*/
app.on('window-all-closed', () => {
  //	if (process.platform !== 'darwin') {
      app.quit();
  //	}
  });

/************************************************************************************************** */
/* Este módulo ipcMain, API de Electron, es una instancia de la clase EventEmitter. 
   Cuando se usa en el proceso principal (Main Process), escucha mensajes asíncronos 
   y síncronos enviados desde un proceso de representación (renderes process) o un evento 
   en una o varias renderers html web.
   Debemos tener en cuenta que el Main Process escucha a través de un canal una función de 
   tipo listener desde main.js cualquier evento o mensaje desde cualquier Renderer Process a 
   través de los identificadores de channels.
   Este elemento captura el evento a través del channel 'addItem', en nuestro caso cuando 
   agregamos un ítem (desde la ventana hija, task.html), que nos permite enviar mensajes a 
   través de un canal de forma asíncrona a la ventana principal desde los demás 
   procesos (renderer process),en nuestro caso cual comunicación a main.js desde cualquier
   archivo .js o un .html.

   Referencia https://electron.atom.io/docs/api/ipc-main/
*/


ipcMain.on('addItem', function(e, item){

  /* Lo usaremos para recibir eventos con mensajes sobre los ítems de las tareas que escribiremos. 
     El cual envía una solicitud para recibir los contenidos del objeto tipo Texbox que es 
     enviado desde nuestra ventana hija, estableciendo un canal 'addItem' de mensajes 
     desde nuestro Main a la ventana padre (index.html)
     createdWindow.webContents.send(channel, object)
  */
    mainWindow.webContents.send('addItem', item);

    /* Cerramos la ventana, y como todavía tiene una referencia de la ventana hija (task.html) 
       en la memoria, ya no es necesario y lo eliminamos (garbage collection) */
    childWindow.close(); 
    childWindow = null;
});
/************************************************************************************************* */


/* Creamos el templeate del menu  de la aplicación
   Cada objeto será un representado como un menu común al estilo dropdown, tanto para Windows y MacOS
   Indicamos el nombre del ítem del menu y establecemos el keyboard shortcut para las plataformas
   Y las opciones o ítems del menu, enviarán mensajes de eventos al nuestros procesos principales 
*/
const mainMenuTemplate =  [
  
   {
     label: 'Acciones',
     submenu:[
       {
         label:'Agregar tarea', 
         //La combinación de teclas son conocidos como Accelerators 
         accelerator:process.platform == 'darwin' ? 'Alt+I' : 'Alt+I', 
         click(){
              createChildWindow(); // Llamamos a la función de cargar la ventana hija
         }
       },
       {
         label:'Limpiar Tareas',
         accelerator:process.platform == 'darwin' ? 'Command+D' : 'Alt+D',
         click(){
         /* Envía desde el evento Click la invocación para recibir una función de eliminación 
             de ítems a una instancia de ipcRenderer. 
         */
             mainWindow.webContents.send('clearItems'); // Invocamos a la función del renderer index.html
         }
       },
       {
         label: 'Salir',
         accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
         click(){
           app.quit();
         }
       }
     ]
   },
   {
    label: 'Ayuda',
    submenu: [
      {
        label: 'Acerca',
        click(){
          openAboutWindow();
        }
      },
    ]
   }

 ];

    
    


// Si es MacOS, quitamos el menu por defecto que nos asocia, para eso agregamos solo el nonbre del APP.
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({label: app.getName()});
}

/* Agregue la opción de herramientas de desarrollador si está en el entorno de desarrollo (developer tools option)
   Esta funcionalidad afecta al modulos process del NodeJs a través de la variable process.env.NODE_ENV = 'development'
*/
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload' // Podemos recargar nuestra App Commnad+R o Ctrl+R cuando tengamos cambios, es un shortcut default
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });

/* Verifica si alguien intentó ejecutar una segunda instancia, deberíamos enfocar nuestra ventana. */
/* Single Instance Check */
const shouldQuit = app.makeSingleInstance((argv) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    }
    return true;
});

if (shouldQuit) {
  app.quit();
  return;
}
}

// var iShouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
//     if (mainWindow) {
//         if (mainWindow.isMinimized()) mainWindow.restore();
//             mainWindow.show();
//             mainWindow.focus();
//         }
//     return true;
// });
// if(iShouldQuit){app.quit();return;}
// }