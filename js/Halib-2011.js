/**
* 
* Halib-2011.js
* @fileOverview
* @author <a href="http://www.ingemoral.es">Santiago Higuera</a> 
*/ 

/**
 * @namespace Objeto base para todas las clases de la Halib
 */
Hal = {};

/**
 * @constant URL del portal
 */
Hal.defaultUrl = "http://www.bicimap.es";
/**
 * @constant Proyección WGS84
 */
Hal.wgs84Projection = new OpenLayers.Projection("EPSG:4326");
/**
 * @constant Proyección SphericalMercator
 */
Hal.sphericalMProjection = new OpenLayers.Projection("EPSG:900913");

/**
 * Base class used to construct all other classes. Includes support for 
 *     multiple inheritance.<br/>
 * To create a new OpenLayers-style class, use the following syntax:<br/>
 * <em>var MyClass = OpenLayers.Class(prototype);</em><br/>
 * To create a new OpenLayers-style class with multiple inheritance, use the
 * following syntax:<br/>
 * <em>var MyClass = OpenLayers.Class(Class1, Class2, prototype);</em><br/>
 * Note that instanceof reflection will only reveil Class1 as superclass.
 * Class2 ff are mixins.
 * @class 
*/
Hal.Class = function() {
	var Class = function() {
        this.initialize.apply(this, arguments);
    };
    var extended = {};
    var parent, initialize;
    /**
     * @private
     */
    var Type;
    for(var i=0, len=arguments.length; i<len; ++i) {
        Type = arguments[i];
        if(typeof Type == "function") {
            // make the class passed as the first argument the superclass
            if(i == 0 && len > 1) {
                initialize = Type.prototype.initialize;
                // replace the initialize method with an empty function,
                // because we do not want to create a real instance here
                /**
                 * @private
                 */
                Type.prototype.initialize = function() {};
                // the line below makes sure that the new class has a
                // superclass
                extended = new Type();
                // restore the original initialize method
                if(initialize === undefined) {
                    delete Type.prototype.initialize;
                } else {
                    Type.prototype.initialize = initialize;
                }
            }
            // get the prototype of the superclass
            parent = Type.prototype;
        } else {
            // in this case we're extending with the prototype
            parent = Type;
        }
        Hal.Util.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};
/**
 * @namespace Colección de funciones estáticas utilitarias de caracter general.
 */
Hal.Util = {};

/**
 * Copia las propiedades del objeto fuente en el objeto destino.
 * Modifies the passed in destination object.  Any properties on the source object
 * that are set to undefined will not be (re)set on the destination object.
 * @function
 * @param {Object} destination The object that will be modified
 * @param {Object} source The object with properties to be set on the destination
 *
 * @returns {Object} The destination object.
 */
Hal.Util.extend = function(destination, source) {
    destination = destination || {};
    if(source) {
        for(var property in source) {
            var value = source[property];
            if(value !== undefined) {
                destination[property] = value;
            }
        }
        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */

        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object
         * is an instance of window.Event.
         */
        var sourceIsEvt = typeof window.Event == "function"
                          && source instanceof window.Event;

        if(!sourceIsEvt
           && source.hasOwnProperty && source.hasOwnProperty('toString')) {
            destination.toString = source.toString;
        }
    }
    return destination;
};
/**
 * Convenience method to cast an object to a Number, rounded to the
 * desired floating point precision.
 * @function: toFloat
 * 
 * @param {Number} number The number to cast and round.
 * @param {Number} precision An integer suitable for use with
 *      Number.toPrecision(). Defaults to OpenLayers.Util.DEFAULT_PRECISION.
 *      If set to 0, no rounding is performed.
 * @returns {Number} The cast, rounded number.
 */
Hal.Util.toFloat = function (number, precision) {
    if (precision == null) {
        precision = OpenLayers.Util.DEFAULT_PRECISION;
    }
    var number;
    if (precision == 0) {
        number = parseFloat(number);
    } else {
        number = parseFloat(parseFloat(number).toPrecision(precision));
    }
    return number;
};
/**
 * Calcula la distancia ortodrómica en millas entre dos posiciones definidas
 * por sus coordenadas geograficas encapsuladas en objetos OpenLayers.LonLat
 * @function
 * @param {OpenLayers.LonLat} lonlat1 Primer punto
 * @param {OpenLayers.LonLat} lonlat2 Segundo punto
 * @returns {Number} Devuelve la distancia en millas entre los dos puntos
 */
Hal.Util.distOrtodromica = function(lonlat1, lonlat2) {
	// Distancia en millas entre dos posiciones geográficas
	// lonlat1 = [lon1, lat1]
	// lonlat2 = [lon2, lat2]
	
	var lon1 = lonlat1[0]*Math.PI/180;
	var lat1 = lonlat1[1]*Math.PI/180;
	var lon2 = lonlat2[0]*Math.PI/180;
	var lat2 = lonlat2[1]*Math.PI/180;	
	var incLon = Math.abs(lon2-lon1);
	var cosd = Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(incLon);
	var d = Math.acos(cosd)*180/Math.PI*60; // Distancia en millas
	if(isNaN(d)) {
		d=0.0;
	}
	return d;
};
/**
 * Remove an object from an array. Iterates through the array
 *     to find the item, then removes it. 
 * @function:
 * 
 * @param {Array} array Array en el que se quiere suprimir el objeto
 * @param {Object} item Objeto que se quiere suprimir del Array 
 * @returns {Array} A reference to the array
 */
Hal.Util.removeItem = function(array, item) {
    for(var i = array.length - 1; i >= 0; i--) {
        if(array[i] == item) {
            array.splice(i,1);
            //break;more than once??
        }
    }
    return array;
};
/*
 * @function Utilidades de fechas
 */
Hal.Util.parseFechaUTC = function(cadfecha, cadhora) {
	// Parametros :
	//		cadfecha = "2010-12-21"
	// 		cadhora = "12:00:00" (se puede omitir)
	// Devuelve :
	// 		objeto Date
	var dt = new Date(); 
	var y = parseInt(cadfecha.substr(0,4),10);
	var m = parseInt(cadfecha.substr(5,2),10)-1;
	var d = parseInt(cadfecha.substr(8,2),10);
	dt.setUTCFullYear(y,m,d);
	var h = 0;
	var min = 0;
	var s = 0;
	if (cadhora != null) {
		h = parseInt(cadhora.substr(0,2),10);
		min = parseInt(cadhora.substr(3,2),10);
		s = parseInt(cadhora.substr(6,2),10);
	}
	dt.setUTCHours(h, min, s, 0);
	return dt;
};
Hal.Util.parseFechaHoraUTC = function(cadfechahora) {
	// Parametros :
	//		cadfechahora = "2010-12-21 12:00:30"
	// Devuelve   :
	// 		objeto Date
	var dt = new Date(); 
	var y = parseInt(cadfechahora.substr(0,4),10);
	var m = parseInt(cadfechahora.substr(5,2),10)-1;
	var d = parseInt(cadfechahora.substr(8,2),10);
	dt.setUTCFullYear(y,m,d);
	var h = 0;
	var min = 0;
	var s = 0;
	cadhora = cadfechahora.substr(11,8);
	h = parseInt(cadhora.substr(0,2),10);
	min = parseInt(cadhora.substr(3,2),10);
	s = parseInt(cadhora.substr(6,2),10);
	dt.setUTCHours(h, min, s, 0);
	return dt;
};
/**
 * Devuelve un String con el entero ajustado al nmero de digitos 
 * añadiendo ceros delante hasta completar la longitud ('01', '023')
 * @function
 */
Hal.Util.intToString = function(number, digits) {
	// Convierte en cadena un numero entero
	// Rellena con ceros a la izda hasta numero de digitos
	var cad = number.toString();
	if(cad.length < digits) {
		var dif = digits - cad.length;
		var ceros ="";
		for (var i=0; i<dif; i++) {
			ceros += "0";
		}
		cad = ceros + cad;
	}
	return cad;
};
Hal.Util.getCadFechaUTC = function (date) {
	var y = date.getUTCFullYear();
	var m = Hal.Util.intToString(date.getUTCMonth()+1,2);
	var d = Hal.Util.intToString(date.getUTCDate(),2);
	var cad = y +"-"+ m +"-"+ d;
	return cad;
};
Hal.Util.getCadHoraUTC = function(date) {
	var h = Hal.Util.intToString(date.getUTCHours(),2);
	var m = Hal.Util.intToString(date.getUTCMinutes(),2);
	var s = Hal.Util.intToString(date.getUTCSeconds(),2);
	var cad = h +":"+ m +":"+ s;
	return cad;
};
Hal.Util.getCadFechaHoraUTC = function(date) {
	var f = Hal.Util.getCadFechaUTC(date);
	var h = Hal.Util.getCadHoraUTC(date);
	var fh = f+' '+h;
	return fh;
};
Hal.Util.getVectorDuracion = function(dtinicio,dtactual) {
	var horas = 0;
	var min = 0;
	var sg = (dtactual.getTime() - dtinicio.getTime())/1000;
	if(sg>59) {
		min = Math.floor(sg/60);
		sg = sg%60;
		if(min>59) {
			horas = Math.floor(min/60);
			min = min%60;
		}
	}	
	return [horas, min, sg];
};
/** 
 * Devuelve el índice de un elemento dentro de un array.
 * @Function: indexOf
 * 
 * 
 * @param {array} array Array en el que se quiere encontrar el elemento
 * @param {Object}  obj Objeto que se quiere encontrar en el Array
 * 
 * @returns {Integer} The index at, which the first object was found in the array.
 *           If not found, returns -1.
 */
Hal.Util.indexOf = function(array, obj) {
    // use the build-in function if available.
    if (typeof array.indexOf == "function") {
        return array.indexOf(obj);
    } else {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] == obj) {
                return i;
            }
        }
        return -1;   
    }
};

