sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../service/service",
    "../model/formatter",
    "com/amb/ambpendiapro/utils/creadorFormulario",
    "com/amb/ambpendiapro/utils/Operaciones",
    "com/amb/ambpendiapro/utils/utils",
    "sap/ui/core/routing/History"

], (Controller, JSONModel, Filter, FilterOperator, Service, formatter, creadorFormulario, Operaciones, utils, History) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.VisualizarSolicitud", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteVisualizacionSolicitud").attachPatternMatched(this._onObjectMatched, this);
        },
        /**
        * Realiza actualización en sf aprueba la solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento.
        * @public
        */
        onApprove: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionApprove(oRequest, this, true);
        },
        /**
        * Realiza actualización en sf rechaza la solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento.
        * @public
        */
        onReject: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionReject(oRequest, this, true);
        },
        /**
        * Realiza actualización en sf retrocede la solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento.
        * @public
        */
        onReturn: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionReturn(oRequest, this, true);
        },
        /**
        * Realiza actualización en sf regresa la solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento.
        * @public
        */
        onBack: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionBack(oRequest, this, true);
        },
        /**
        * Navega a la página anterior en el historial de navegación.
        * Si no hay una página anterior en el historial de la aplicación, navega a la vista
        * principal ("RouteMain") como ruta por defecto.
        * @public
        */
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteMain", {}, true); // Ruta por defecto si no hay historial
            }
        },        /**
        * Redirige a la vista (RouteMain)
        * @public
        */
        onCancel: function () {
            this.onNavBack();
        },
        /**
        * Manejador para el evento 'patternMatched' de la ruta.
        * Se ejecuta cada vez que el usuario navega a esta vista. Su propósito es
        * obtener los parametros de url, consultar datos y pasar datos a la función 
        * generarFormulario
        * @param {sap.ui.base.Event} oEvent El objeto del evento de la ruta.
        * @private
        */
        _onObjectMatched: async function (oEvent) {
            try {
                const oGrupoModelos = this.getOwnerComponent().getModel("cust_INETUM_SOL_DM_0001");
                if (!oGrupoModelos) {
                    this.onNavBack();
                    return;
                }
                utils.showBI(true);
                const sExternalCode = oEvent.getParameter("arguments").externalCode;
                const sEffectiveDate = oEvent.getParameter("arguments").effectiveStartDate;
                const oRequestDetail = await this._buscarSolicitudEnModeloDM(sExternalCode);
                if (oRequestDetail) {
                    await this._prepararModeloFiltrado(oRequestDetail);
                    const aCampos = oRequestDetail.cust_solFields?.results;
                    await creadorFormulario.generarFormulario(this, "FormularioDinamico_visualizacion", aCampos);
                }
            } catch (error) {
                console.error(error)
            } finally {
                utils.showBI(false);
            }
        },
        /**
        * Se encarga de buscar la solicitud en el modelo por sus ids
        * @param {int} sExternalCode Id de la solicitud
        * @return {array} Array con la solicitud seleccionada para ver detalle
        * @private
        */
        _buscarSolicitudEnModeloDM: function (sExternalCode) {
            const oGrupoModelos = this.getOwnerComponent().getModel("cust_INETUM_SOL_DM_0001");
            const oSolicitudes = oGrupoModelos?.getProperty("/cust_INETUM_SOL_DM_0001");
            //Comentado porque no se logra obtener el objeto con las dos llaves externalCode y effectiveStartDate
            // const timestampAsNumber = parseInt(sEffectiveDate); 

            // if (isNaN(timestampAsNumber)) { // Verificar si la conversión fue exitosa
            //     console.error("El timestamp de la URL no es un número válido:", sEffectiveDate);
            //     sap.m.MessageToast.show("Error: Fecha de inicio inválida en la URL.");
            //     return;
            // }
            // const oEffectiveDate = String(new Date(timestampAsNumber));

            const oRequest = oSolicitudes?.find(item => item.externalCode === sExternalCode);
            return oRequest;
        },
        /**
         * Crea y asigna un nuevo modelo JSON que contiene únicamente la solicitud seleccionada.
         * @param {object} oDataSolicitud El objeto que contiene el tipo y los datos de la solicitud.
         * @private
         */
        _prepararModeloFiltrado: function (oDataSolicitud) {
            const oModeloFiltrado = new JSONModel({
                request: oDataSolicitud
            });
            this.getOwnerComponent().setModel(oModeloFiltrado, "filteredModelDM_0001");
        },

        /**
         * Manejador para el evento de carga de archivos (generalmente 'change' del FileUploader).
         * Lee el archivo seleccionado, lo convierte a formato Base64 y almacena el contenido
         * y el nombre en variables privadas del controlador (_contenidoArchivo, _nombreArchivo)
         * para su posterior envío.
         * @param {sap.ui.base.Event} oEvent El objeto del evento que contiene los archivos cargados.
         */
        onDetectorAdjunto: function (oEvent) {
            // Se obtiene el archivo cargado.
            const oFile = oEvent.getParameter("files")[0];
            if (!oFile) {
                return;
            }

            this._nombreArchivo = oFile.name;
            // Se crea un objeto de tipo FileReader que permite leer el archivo.
            const oReader = new FileReader();

            // Se define la acción a realizar cuando la lectura del archivo sea exitosa.
            oReader.onload = (e) => {
                // Se transforma el archivo en base64 y se almacena en una variable del controlador.
                const sBase64Content = e.target.result.split(",")[1];
                this._contenidoArchivo = sBase64Content;
                sap.m.MessageToast.show("Archivo listo para ser guardado.");
            };

            // Se define la acción en caso de error.
            oReader.onerror = (e) => {
                sap.m.MessageToast.show("Error al leer el archivo.");
            };

            // Se inicia la lectura del archivo.
            oReader.readAsDataURL(oFile);
        }
    });
});