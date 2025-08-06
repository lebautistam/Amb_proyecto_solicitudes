sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/m/ToolbarSpacer",
    "sap/ui/thirdparty/jquery",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "../service/service",
    "../utils/utils",
    "../utils/Operaciones",
    "../utils/Lenguaje"
], (Controller, Log, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, MessageBox, MessageToast, formatter, service, utils, Operaciones, Lenguaje) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.Main", {
        formatter: formatter,
        onInit() {
            this._managementRouter();
            this._requestBusy();
            this._getUserOnLine();
            this._initializeAsyncData();
        },
        /**
         Obtiene los datos del usuario actual desde el endpoint "/user-api/currentUser".
        * Esta función maneja tanto el ambiente de desarrollo local (usando datos simulados con la extensión .json)
        * como el de producción (sin la extensión .json). Los datos del usuario obtenidos
        * se establecen como un modelo JSON en la vista y se almacenan en el "session storage".
        * @returns {Promise<void>} - Una promesa que se resuelve cuando los datos del usuario han sido cargados y establecidos exitosamente.
        * @throws {Error} Si la obtención de datos falla o la respuesta no es válida, se crea un registro de error y se muestra un cuadro de mensaje de error al usuario.
        */
        _getUserOnLine: async function () {
            try {
                const oResponse = await fetch(`${sap.ui.require.toUrl("com/amb/ambpendiapro")}/user-api/currentUser.json`);
                const oUserData = await oResponse.json();
                var oViewUserModel = new JSONModel([{
                    "displayName": oUserData.displayName,
                    "email": oUserData.email,
                    "firstname": oUserData.firstname,
                    "lastname": oUserData.lastname,
                    "name": oUserData.name
                }]);
                this.getView().setModel(oViewUserModel, "oModelUser");
                // sap.ui.getCore().setModel(oViewUserModel, "oModelUser");
                sessionStorage.setItem("userName", oViewUserModel.getProperty("/0/name"))
            } catch (oError) {
                const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                const sLogMessage = oResourceBundle.getText("errorUserLog");
                const sUserMessage = oResourceBundle.getText("errorUserDataMessage");
                const sTitle = oResourceBundle.getText("errorLoadDataTitle");
                const sDetails = oResourceBundle.getText("errorLoadDataDetails");
                Log.error(sLogMessage, JSON.stringify(oError, null, 2), this.getMetadata().getName());
                const oParams = {
                    title: sTitle,
                    details: sDetails,
                    actions: [MessageBox.Action.CLOSE]
                }
                utils.onShowMessage(sUserMessage, "error", null, oParams)
            }
        },
        /**
        * Realiza el cargue de la información principal de manera asyncrona,
        * esto para que la siguiente función espere a que la primera haga todo su
        * proceso.
        * @private
        */
        _initializeAsyncData: async function () {
            try {
                this.getOwnerComponent().getModel("busy").setProperty("/tableBusy", true);
                await this._getParametersApp();
                await this._getMainDataEntity();
                await this._getRowsTable();
            } catch (oError) {
                const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                const sLogMessage = oResourceBundle.getText("logErrorInitializeData");
                const sTitle = oResourceBundle.getText("errorLoadDataTitle");
                const sMessage = oResourceBundle.getText("errorLoadDataMessage");
                const sDetails = oResourceBundle.getText("errorLoadDataDetails");
                Log.error(sLogMessage, JSON.stringify(oError, null, 2), this.getMetadata().getName());
                const oParams = {
                    title: sTitle,
                    details: sDetails,
                    actions: [MessageBox.Action.CLOSE]
                }
                utils.onShowMessage(sMessage, "error", null, oParams)
                console.log(oError)
            } finally {
                this.getOwnerComponent().getModel("busy").setProperty("/tableBusy", false);
            }
        },
        /**
        * Realiza actualización en sf aprobando una solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento de la tabla.
        * @public
        */
        onApprove: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionApprove(oContext, this);
        },
        /**
        * Realiza actualización en sf rechazando una solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento de la tabla.
        * @public
        */
        onReject: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionReject(oContext, this);
        },
        /**
        * Realiza actualización en sf retrocede una solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento de la tabla.
        * @public
        */
        onReturn: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionReturn(oContext, this);
        },
        /**
        * Realiza actualización en sf devuelve la solicitud.
        * @param {sap.ui.base.Event} oEvent El objeto del evento de la tabla.
        * @public
        */
        onBack: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionBack(oContext, this);
        },
        /**
        * Realiza redireccionamiento a nueva ruta de form dinámico.
        * @param {sap.ui.base.Event} oEvent El objeto del evento de la tabla.
        * @public
        */
        onDetailRequest: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001");
            this.getOwnerComponent().getRouter().navTo("RouteVisualizacionSolicitud", {
                externalCode: oContext.getProperty("externalCode"),
                effectiveStartDate: oContext.getProperty("effectiveStartDate").getTime(),
                cust_object: oContext.cust_object
            });
        },
        /**
        * Manejador de la ruta.
        * Se ejecuta cada vez que el usuario navega a esta vista. Su propósito es
        * ejecutar siempre una función cada que se navega a la ruta.
        * @private
        */
        _managementRouter: function () {
            this.getOwnerComponent().getRouter().getRoute("RouteMain").attachPatternMatched(this._onRouteMatched, this);
        },
        /**
         * Manejador para el evento 'patternMatched' de la ruta.
         * Se ejecuta cada vez que el usuario navega a esta vista. Su propósito es
         * limpiar los filtros de la tabla de solicitudes pendnientes de aprobar.
         * @param {sap.ui.base.Event} oEvent El objeto del evento de la ruta.
         * @private
         */
        _onRouteMatched: function (oEvent) {
            this.onClearAllFilters();
        },
        /**
         * Realiza conteo de las filas de la tabla luego que esta renderizada
         * y guarda el conteo en un modelo
         * @private
         */
        _updateTableCount: function () {
            var oTable = this.byId("requestsTable");
            var oBinding = oTable.getBinding("rows");
            let iFilteredCount = oBinding.getLength();
            let oViewModel = this.getView().getModel("view");
            oViewModel.setProperty("/filteredCount", iFilteredCount);
        },
        /**
        * Crea los filtros conforme la query obtenida en el input filter global
        * @public
        */
        onGlobalFilter: function (oEvent) {
            const sQuery = oEvent.getParameter("newValue");
            this._oGlobalFilter = null;

            if (sQuery) {
                // Crea un filtro OR para buscar en múltiples campos
                this._oGlobalFilter = new Filter({
                    filters: [
                        new Filter("cust_nombreSolicitud", FilterOperator.Contains, sQuery),
                        new Filter("cust_nombreTSolicitud", FilterOperator.Contains, sQuery),
                        new Filter("cust_solicitante", FilterOperator.Contains, sQuery)
                    ],
                    and: false // and: false significa que es un OR
                });
            } else {
                this.onClearAllFilters();
            }

            this._applyFiltersToTable();
        },

        /**
         * Maneja el evento 'filter' que se dispara desde las columnas de la tabla.
         * (Puedes dejarlo vacío por ahora si no tienes lógica de filtro de columna compleja)
         */
        onColumnFilter: function (oEvent) {
            return;
        },

        /**
        * Limpia TODOS los filtros y ordenamientos. Llamado por el botón 'X' del input.
        * @private
        */
        onClearAllFilters: function () {
            // Limpia el campo de búsqueda
            this.getView().getModel("modeloLocal").setProperty("/globalFilter", "");

            this._oGlobalFilter = null;

            // Limpia los filtros de las columnas (la forma correcta)
            const oTable = this.byId("requestsTable");
            //Eliminamos el ordenamiento en la tabla si lo hay
            this.byId("requestsTable")?.getBinding("rows")?.sort(null);
            oTable.getColumns().forEach(oColumn => {
                oColumn.setFiltered(false);
                oColumn.setSorted(false); // También resetea el ordenamiento
            });

            // Finalmente, aplica los filtros (que ahora estarán vacíos)
            this._applyFiltersToTable();
        },

        /**
         * Función centralizada para aplicar los filtros al binding de la tabla.
         * @private
         */
        _applyFiltersToTable: function () {
            const oTable = this.byId("requestsTable");
            const oBinding = oTable.getBinding("rows");
            oBinding?.filter(this._oGlobalFilter, "Application");
        },
        /**
         * Crea nuevo modelo para variable de busy table (boolean)
         * @private
         */
        _requestBusy: function () {
            const oModelScf = this.getOwnerComponent().getModel();
            const oLocalModel = this.getOwnerComponent().getModel("busy");
            if (!oLocalModel) {
                const oNewLocalModel = new JSONModel({
                    cellFilterOn: false,
                    globalFilter: "",
                    tableBusy: false
                });
                this.getOwnerComponent().setModel(oNewLocalModel, "busy");
            } else {
                oLocalModel.setProperty("/tableBusy", false); // Asegura que esté en false al inicio
            }
        },
        /**
         * Configura los listeners de eventos en el binding de la tabla de solicitudes.
         * Se asegura de que la función _updateTableCount se ejecute cada vez que los
         * datos de la tabla cambian (filtrado, ordenamiento, carga inicial) para
         * actualizar el contador de filas visibles.
         * @private
         */
        _getRowsTable: function () {
            let oViewModel = this.getView().getModel("view");
            let oTable = this.byId("requestsTable");
            if (!oViewModel) {
                let oViewModel = new JSONModel({
                    filteredCount: 0
                });
                this.getView().setModel(oViewModel, "view");
            }
            const oBinding = oTable.getBinding("rows");
            if (oBinding) {
                oBinding.attachChange(this._updateTableCount, this);
                oBinding.attachEvent("dataReceived", this._updateTableCount, this);
                this._updateTableCount();
            }
        },
        /**
         * Obtiene y los títulos y textos de botones o placeholders
         * y establece el nombre de la vista principal
         * @private
         */
        _getParametersApp: async function () {
            const oModelApi = this.getOwnerComponent().getModel();
            const oModelC0001 = await service.readDataERP("/cust_INETUM_SOL_C_0000", oModelApi)
            const oNewModelC0000 = new JSONModel(oModelC0001.data.results)
            this.getOwnerComponent().setModel(oNewModelC0000, "cust_INETUM_SOL_C_0000");
            const sTitle = Lenguaje.obtenerNombreConcatenado('cust_titulo3');
            //Asignamos el título de la página a un modelo
            const oNewModelTitle = new JSONModel({ title: oModelC0001.data.results[0][sTitle] || 'Pendientes de aprobar' })
            this.getOwnerComponent().setModel(oNewModelTitle, "modelTitle");
        },
        /**
         * Obtiene y filtra los datos principales para la tabla de vista principal
         * se realiza lógica para mostrar solicitudes unicamente donde el usuario
         * conectado sea aprobador
         * @private
         */
        _getMainDataEntity: async function () {
            let oModel = this.getOwnerComponent().getModel();
            let oViewModelC0000 = this.getView().getModel("cust_INETUM_SOL_C_0000");
            const sUserOnLine = sessionStorage.getItem("userName")
            const oParameters = {
                bParam: true,
                oParameter: {
                    "$expand": "cust_steps,cust_solFields",
                    "$select": "cust_nombreSol,cust_nombreTSol,cust_solFields,effectiveStartDate,externalCode,cust_solicitante,cust_fechaSol,cust_deadLine,cust_steps,cust_indexStep,cust_maxStep,cust_status,cust_object"
                }
            };
            const oData = await service.readDataERP("/cust_INETUM_SOL_DM_0001", oModel, [], oParameters);
            const aEnrichedData = oData.data.results.map(element => {
                console.log(element)
                element.cust_nombreSolicitud = element?.cust_nombreSol || "Sin nombre";
                element.cust_nombreTSolicitud = element?.cust_nombreTSol || "Sin nombre tipo";
                return element;
            });

            const aFiltered = aEnrichedData.filter(element => {
                return element.cust_steps.results.some(step => step.cust_aprobUser === sUserOnLine && step.cust_activeStep === false);
            }).map(element => {
                const sCustVto = Lenguaje.obtenerNombreConcatenado("cust_vto");
                element.cust_vto = oViewModelC0000.oData[0][sCustVto];
                return element;
            });

            const oNewModelDm0001 = new JSONModel({ cust_INETUM_SOL_DM_0001: aEnrichedData });
            this.getOwnerComponent().setModel(oNewModelDm0001, "cust_INETUM_SOL_DM_0001");
        }
    });
});