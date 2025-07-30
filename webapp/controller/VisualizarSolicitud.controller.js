sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../service/service",
    "../model/formatter",
    "../utils/creadorFormulario",
    "../utils/Operaciones",
    "sap/ui/core/routing/History"

], (Controller, JSONModel, Filter, FilterOperator, Service, formatter, creadorFormulario, Operaciones, History) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.VisualizarSolicitud", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteVisualizacionSolicitud").attachPatternMatched(this._onObjectMatched, this);
        },
        onApprove: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionApprove(oRequest, this, true);
        },
        onReject: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionReject(oRequest, this, true);
        },
        onReturn: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionReturn(oRequest, this, true);
        },
        onBack: function (oEvent) {
            const oModelFiltered = this.getOwnerComponent().getModel("filteredModelDM_0001");
            const oRequest = oModelFiltered.getProperty("/request");
            Operaciones.actionBack(oRequest, this, true);
        },
        /**
         * Navega a la página anterior en el historial de navegación.
         * Si no hay una página anterior en el historial de la aplicación, navega a la vista
         * principal ("RoutelistaSolicitudes") como ruta por defecto.
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
        },
        onCancel: function () {
            this.onNavBack();
        },
        _onObjectMatched: function (oEvent) {
            const sExternalCode = oEvent.getParameter("arguments").externalCode;
            const sEffectiveDate = oEvent.getParameter("arguments").effectiveStartDate;
            const oRequestDetail = this._buscarSolicitudEnModeloDM(sExternalCode, sEffectiveDate);
            if (oRequestDetail) {
                this._prepararModeloFiltrado(oRequestDetail);
                // const oRequestHead = this._buscarSolicitudEnModeloC(oRequestDetail.cust_object);
                // if (!oRequestHead) {
                //     console.warn("No se encontró la solicitud con ID:", sSolicitudID);
                //     return;
                // }
            }

            const aCampos = oRequestDetail.cust_solFields.results;
            
            console.log(aCampos)
            creadorFormulario.generarFormulario(this, "FormularioDinamico_visualizacion", aCampos);
        },
        _buscarSolicitudEnModeloDM: function (sExternalCode, sEffectiveDate) {
            const oGrupoModelos = this.getOwnerComponent().getModel("cust_INETUM_SOL_DM_0001");
            if(!oGrupoModelos){
                this.onNavBack();
            }
            const oSolicitudes = oGrupoModelos.getProperty("/cust_INETUM_SOL_DM_0001");

            const timestampAsNumber = parseInt(sEffectiveDate); // Opción 1: parseInt (recomendado por claridad y seguridad)

            if (isNaN(timestampAsNumber)) { // Verificar si la conversión fue exitosa
                console.error("El timestamp de la URL no es un número válido:", sEffectiveDate);
                sap.m.MessageToast.show("Error: Fecha de inicio inválida en la URL.");
                return;
            }
            const oEffectiveDate = String(new Date(timestampAsNumber));

            const oRequest = oSolicitudes.find(item => item.externalCode === sExternalCode);
            return oRequest;
        },
        _buscarSolicitudEnModeloC: function (sCust_Object) {
            const oGrupoModelos = this.getOwnerComponent().getModel("groupedModel_0001");
            const aSolicitudes = oGrupoModelos.getProperty("/requests");
            let oResultado = null;

            aSolicitudes.forEach(function (oTipo) {
                const oItemEncontrado = oTipo.items.find(oItem => oItem.objeto === sCust_Object);
                if (oItemEncontrado) {
                    oResultado = {
                        tipo: oTipo.type,
                        solicitud: oItemEncontrado
                    };
                }
            });

            return oResultado;
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
        //Función para cargar adjunto
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