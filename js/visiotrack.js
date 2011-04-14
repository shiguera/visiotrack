/**
 * visiotrack.js
 * 13/04/2011
 */

/**
 * Inicialización de variables
 */
window.onload = init;
idmanga = 1001;
parseurl();

var map = null;
var marcas = null;

function init() {
	
	// Ajustar tamaños de pantalla
	dibujapantalla();
	
	// Dibujar mapa
	dibujamapa();
	
	// Dibuja marcas
	dibujamarcas();
		
	// Activa eventos
	activaeventos();
};
function parseurl() {
	idmanga = 1001;
	pars = location.search.substr(1,location.search.length-1);
	arrpars = pars.split('&');
	if (arrpars.length > 0) {
		for ( i= 0; i< arrpars.length; i++) {
			ap = arrpars[i].split('=');			
			if (ap[0] == 'id') {
				if(!isNaN(ap[1])) {
					idmanga = ap[1];					
				}
			}
		}
	}	
}
function dibujapantalla() {
	
}
function dibujamapa() {
	
}
function dibujamarcas() {
	
}
function activaeventos() {
	
}
