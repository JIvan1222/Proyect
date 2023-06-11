/*Es una declaración que activa el modo estricto en JavaScript, 
lo cual ayuda a evitar errores comunes y hace que el código sea más seguro.*/
"use strict";

/*Se importa el paquete webtorrent-hybrid utilizando la sintaxis de importación de ECMAScript 6. 
Este paquete proporciona funcionalidad para descargar y compartir archivos torrent. 
La instancia importada se llama "WebTorrent".*/
import WebTorrent from "webtorrent-hybrid";

/*Se importa el módulo "fs" (File System) de Node.js, que proporciona funciones 
para trabajar con archivos y directorios en el sistema operativo. La instancia importada se llama "fs.*/
import fs from "fs";

/*Se importa el módulo "cli-progress", que es una biblioteca para mostrar una barra de progreso en la línea de comandos.
 La instancia importada se llama "cliProgress".*/
import cliProgress from "cli-progress";

/*Se lee el argumento proporcionado en la línea de comandos y se asigna a la constante "torrentId". 
Este argumento debe ser un archivo .torrent o un enlace magnet.*/
const torrentId = process.argv[2];
 /*Se imprime el valor de "torrentId" en la consola.*/
console.log("Torrent ID:~ \t" + torrentId);

/*Se crea una instancia de "WebTorrent" llamada "client". 
Esta instancia representa al cliente de descarga de torrents.
*/
const client = new WebTorrent();

/*Se crea una instancia de la barra de progreso utilizando la clase "SingleBar" proporcionada por "cli-progress".*/
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

/*Se agrega un nuevo elemento al cliente de torrents utilizando el método "add" de "client". 
Se pasa el "torrentId" y una función de callback que se ejecutará cuando se haya agregado el torrent correctamente.
*/
client.add(torrentId, (torrent) => {
/*Dentro de la función de callback de "add", se obtiene la lista de archivos del torrent en la variable "files".
*/
  const files = torrent.files;
  let length = files.length;

/*Se imprime la longitud de la lista de archivos en la consola.*/
  console.log("Number of files: ~ \t" + length);

/*Se inicia la barra de progreso con un total de 100 y un valor inicial de 0.*/
  bar.start(100, 0);

/*Se define un intervalo que actualiza la barra de progreso cada 5 segundos, utilizando el método "update" 
de la barra de progreso y el progreso del torrent.
*/
  let interval = setInterval(() => {
    bar.update(torrent.progress * 100);
  }, 5000);

/*Se recorren los archivos del torrent utilizando el método "forEach" de la lista de archivos.*/
  files.forEach((file) => {

/*Para cada archivo, se crea un flujo de lectura utilizando el método "createReadStream" del objeto "file".
 Esto nos permite leer el contenido del archivo.
 */
    const source = file.createReadStream();
    const destination = fs.createWriteStream(file.name);

/*Se crea un flujo de escritura utilizando el método "createWriteStream" de "fs". 
Este flujo se utiliza para escribir los datos del archivo en el sistema de archivos.
Se establece un manejador de eventos para el evento "end" del flujo de lectura.
Este evento se dispara cuando se ha terminado de leer todo el archivo.
*/
    source
      .on("end", () => {

/*Dentro del manejador de eventos, se imprime el nombre del archivo en la consola y se actualiza la longitud de archivos restantes.*/
        console.log("file: \t\t", file.name);
        length -= 1;
        if (length) {
          bar.stop();
          clearInterval(interval);

/*Si aún quedan archivos por procesar, se detiene la barra de progreso, se limpia el intervalo de actualización 
y se sale del programa utilizando "process.exit()".*/
          process.exit();
        }
      })

/*e realiza una tubería (pipe) entre el flujo de lectura y el flujo de escritura. Esto significa que los datos leídos del archivo se escribirán directamente en el archivo de destino.*/
      .pipe(destination);
  });
});
