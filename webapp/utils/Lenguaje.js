sap.ui.define([], function () {
    "use strict";

    // Obtener idioma UI5 (ej: "es", "es-ES", "ca", "en-US")
    var sLang = sap.ui.getCore().getConfiguration().getLanguage().toLowerCase();

    // Mapa de idiomas a sufijos
    var mMap = {
        "es": "_es_ES",
        "es-es": "_es_ES",
        "ca": "_ca_ES",
        "ca-es": "_ca_ES",
        "en": "_en_US",
        "en-us": "_en_US"
    };

    var sSufijo = mMap[sLang] || "_defaultValue";

    return {
        /**
         * @param {string} sNombreBase 
         * @returns {string} 
         */
        obtenerNombreConcatenado: function (sNombreBase) {
            return sNombreBase + sSufijo;
        }
    };
});