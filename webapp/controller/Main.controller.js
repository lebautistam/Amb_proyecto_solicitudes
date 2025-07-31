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
    "../utils/Lenguaje",
], (Controller, Log, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, MessageBox, MessageToast, formatter, service, utils, Operaciones, Lenguaje) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.Main", {
        formatter: formatter,
        async onInit() {
            // this._loadUserInfo();
            this._requestBusy();
            await this._getParametersApp();
            await this._getMainDataEntity();
            this._getRowsTable();
        },
        _loadUserInfo: function () {
            // Comprueba si el servicio UserInfo está disponible
            if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                sap.ushell.Container.getServiceAsync("UserInfo")
                    .then(function (oUserInfo) {
                        // Información básica del usuario
                        const sId = oUserInfo.getId(); // ID del usuario (ej. 'JOHN.DOE')
                        const sEmail = oUserInfo.getEmail(); // Correo electrónico
                        const sFirstName = oUserInfo.getFirstName(); // Nombre
                        const sLastName = oUserInfo.getLastName(); // Apellido
                        const sFullName = oUserInfo.getFullName(); // Nombre completo
                        const sLanguage = oUserInfo.getLanguage(); // Idioma del usuario (configurado en el perfil)

                        console.log("Usuario Conectado (UserInfo Service):");
                        console.log("  ID:", sId);
                        console.log("  Nombre Completo:", sFullName);
                        console.log("  Correo:", sEmail);
                        console.log("  Idioma (Perfil):", sLanguage);

                        // Puedes almacenar esta información en un modelo JSON local para usarla en la vista
                        const oUserModel = new JSONModel({
                            id: sId,
                            email: sEmail,
                            firstName: sFirstName,
                            lastName: sLastName,
                            fullName: sFullName,
                            language: sLanguage
                        });
                        this.getView().setModel(oUserModel, "userModel");

                    }.bind(this))
                    .catch(function (oError) {
                        console.error("Error al obtener UserInfo Service:", oError);
                    });
            } else {
                console.warn("Servicio UserInfo no disponible. ¿La aplicación está en Launchpad o simulada?");
                // En desarrollo local sin Launchpad, puedes simular un usuario
                const oUserModel = new JSONModel({
                    id: "USUARIO_DEV",
                    email: "dev.user@example.com",
                    firstName: "Usuario",
                    lastName: "Desarrollo",
                    fullName: "Usuario Desarrollo",
                    language: "es"
                });
                this.getView().setModel(oUserModel, "userModel");
            }
        },
        onApprove: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionApprove(oContext, this);
        },
        onReject: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionReject(oContext, this);
        },
        onReturn: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionReturn(oContext, this);
        },
        onBack: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001").getObject();
            Operaciones.actionBack(oContext, this);
        },
        onDetailRequest: function (oEvent) {
            let oButton = oEvent.getSource()
            let oContext = oButton.getBindingContext("cust_INETUM_SOL_DM_0001");

            this.getOwnerComponent().getRouter().navTo("RouteVisualizacionSolicitud", {
                externalCode: oContext.getProperty("externalCode"),
                effectiveStartDate: oContext.getProperty("effectiveStartDate").getTime(),
                cust_object: oContext.cust_object
            });

        },
        _managementRouter: function () {
            this.getOwnerComponent().getRoute("RoutelistaSolicitudes").attachPatternMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
            var oList = this.byId("requestList");
            var oBinding = oList.getBinding("items");

            // Elimina los filtros que se crearon al ingresar a alguna solicitud y volver
            if (oBinding) {
                oBinding.filter([]);
            }
        },
        _updateTableCount: function () {
            var oTable = this.byId("requestsTable");
            var oBinding = oTable.getBinding("rows");
            let iFilteredCount = oBinding.getLength();
            let oViewModel = this.getView().getModel("view");
            oViewModel.setProperty("/filteredCount", iFilteredCount);
        },
        clearAllSortingsFilters: function (oEvent) {
            var oTable = this.byId("requestsTable");
            oTable.getBinding().sort(null);

            var oUiModel = this.getView().getModel("modeloLocal");
            oUiModel.setProperty("/globalFilter", "");
            oUiModel.setProperty("/availabilityFilterOn", false);

            this._oGlobalFilter = null;
            this._filter();

            var aColumns = oTable.getColumns();
            for (var i = 0; i < aColumns.length; i++) {
                oTable.filter(aColumns[i], null);
            }

            this._resetSortingState();
        },
        _resetSortingState: function () {
            var oTable = this.byId("requestsTable");
            var aColumns = oTable.getColumns();
            for (var i = 0; i < aColumns.length; i++) {
                aColumns[i].setSorted(false);
            }
        },
        filterGlobally: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            this._oGlobalFilter = null;

            if (sQuery) {
                this._oGlobalFilter = new Filter([
                    new Filter("cust_nombreSolicitud", FilterOperator.Contains, sQuery),
                    new Filter("cust_nombreTSolicitud", FilterOperator.Contains, sQuery),
                    new Filter("cust_solicitante", FilterOperator.Contains, sQuery)
                ], false);
            }

            this._filter();
            this._updateTableCount();
        },
        _filter: function () {
            let oFilter = null;
            if (this._oGlobalFilter) {
                oFilter = new Filter([this._oGlobalFilter], true);
            } else if (this._oGlobalFilter) {
                oFilter = this._oGlobalFilter;
            }
            this.byId("requestsTable").getBinding().filter(oFilter, "Application");
        },
        _requestBusy: function () {
            const oModelScf = this.getOwnerComponent().getModel();
            const oLocalModel = this.getView().getModel("busy");
            if (!oLocalModel) {
                const oNewLocalModel = new JSONModel({
                    cellFilterOn: false,
                    globalFilter: "",
                    tableBusy: false // Inicializa el estado de la tabla como no ocupado
                });
                this.getView().setModel(oNewLocalModel, "busy");
            } else {
                oLocalModel.setProperty("/tableBusy", false); // Asegura que esté en false al inicio
            }
        },
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
            oBinding.attachChange(this._updateTableCount, this);
            oTable.attachEventOnce("rowsUpdated", function () {
                if (oBinding) {
                    oBinding.attachEvent("dataReceived", this._updateTableCount, this);
                    this._updateTableCount();
                } else {
                    console.warn("Binding de filas de la tabla no encontrado después de rowsUpdated.");
                }
            }, this);
        },
        _getParametersApp: async function () {
            const oModelApi = this.getOwnerComponent().getModel();
            const oModelC0001 = await service.readDataERP("/cust_INETUM_SOL_C_0000", oModelApi)
            const oNewModelC0000 = new JSONModel(oModelC0001.data.results)
            this.getOwnerComponent().setModel(oNewModelC0000, "cust_INETUM_SOL_C_0000");
            const sTitle = Lenguaje.obtenerNombreConcatenado('cust_titulo3');
            //Asignamos el título de la página a un modelo
            const oNewModelTitle = new JSONModel({ title: oModelC0001.data.results[0][sTitle] || 'Pendientes de aprobar'})
            this.getOwnerComponent().setModel(oNewModelTitle, "modelTitle");
        },
        _getMainDataEntity: async function () {
            let oModel = this.getOwnerComponent().getModel();
            let oViewModelC0000 = this.getView().getModel("cust_INETUM_SOL_C_0000");
            const oParameters = {
                bParam: true,
                oParameter: {
                    "$expand": "cust_steps,cust_solFields",
                    "$select": "cust_solFields,effectiveStartDate,externalCode,cust_solicitante,cust_fechaSol,cust_deadLine,cust_steps,cust_indexStep,cust_maxStep,cust_status,cust_object"
                }
            };
            this.getView().getModel("busy").setProperty("/tableBusy", true);
            try {
                const oData = await service.readDataERP("/cust_INETUM_SOL_DM_0001", oModel, [], oParameters);
                const aEnrichmentPromises = oData.data.results.map(async (element) => {
                    try {
                        // Esperamos a que la llamada anidada termine PARA CADA elemento
                        const oNameData = await this._getNameTypeRequest(oModel, element);
                        // Modificamos el elemento con los datos obtenidos
                        element.cust_nombreSolicitud = oNameData?.cust_nombreSol_defaultValue;
                        element.cust_nombreTSolicitud = oNameData?.cust_idTipo2Nav?.cust_nombreTSol_defaultValue;
                        
                        return element;
                    } catch (oError) {
                        console.error(oError);
                    }
                });
                const aEnrichedData = await Promise.all(aEnrichmentPromises);
            
                const aFiltered = aEnrichedData.filter(element => {
                    return element.cust_steps.results.some(step => step.cust_aprobUser == "SFADMIN_LBM" && step.cust_activeStep === false);
                }).map(element => {
                    const sCustVto = Lenguaje.obtenerNombreConcatenado("cust_vto");
                    element.cust_vto = oViewModelC0000.oData[0][sCustVto];
                    return element;
                });
        
                // console.log("Datos finales filtrados y mapeados:", aFiltered);
                
                const oNewModelDm0001 = new JSONModel({ cust_INETUM_SOL_DM_0001: aEnrichedData });
                this.getOwnerComponent().setModel(oNewModelDm0001, "cust_INETUM_SOL_DM_0001");
        
            } catch (oError) {
                console.error("Error al cargar los datos principales:", oError);
                MessageToast.show("Error al cargar los datos");
            } finally {
                this.getView().getModel("busy").setProperty("/tableBusy", false);
            }
        },
        _getNameTypeRequest: async function (oModel, oData) {
            let oKeyC0001 = oModel.createKey('/cust_INETUM_SOL_C_0001', {
                cust_object: oData.cust_object
            });
            const aFilter = [
                new Filter("cust_object", FilterOperator.EQ, oData.cust_object)
            ];
            const oParameters = {
                bParam: true,
                oParameter: {
                    "$expand": "cust_idTipo2Nav",
                    "$select": "cust_idTipo2Nav,cust_nombreSol_ca_ES,cust_nombreSol_defaultValue,cust_nombreSol_en_DEBUG,cust_nombreSol_en_US,cust_nombreSol_es_ES,cust_nombreSol_localized"
                }
            };
            try {
                const oDataC0001 = await service.readDataERP("/cust_INETUM_SOL_C_0001", oModel, aFilter, oParameters)
                return oDataC0001.data.results[0]
            } catch (error) {
                console.log(error)
            }
        },
        /**
        * Carga, procesa y agrupa la lista de solicitudes desde la entidad C_0001.
        * @private
        * @returns {Promise}
        */
        _cargarListaDeSolicitudes: async function () {
            const oModel = this.getOwnerComponent().getModel();

            // Filtro para el llamado al back
            const aFilters = [
                new sap.ui.model.Filter("cust_status", sap.ui.model.FilterOperator.EQ, "A")
            ];

            const oParameters = {
                bParam: true,
                oParameter: {
                    "$expand": "cust_idTipo2Nav"
                }
            };

            // Se hace un llamado a la entidad de las solicitudes hijas 'C_0001', 
            // con un parametro de expand a las solicitudes padres 'cust_idTipoNav' ('C_0002' a través de la navegación)
            return service.readDataERP("/cust_INETUM_SOL_C_0001", oModel, aFilters, oParameters)
                .then((oData) => {
                    const finalData = this._procesarYAgruparResultados(oData.data.results);

                    // Se pasa el array a un modelo json para pasarlo a la vista
                    const oGroupedModel = new JSONModel({
                        requests: finalData
                    });
                    this.getOwnerComponent().setModel(oGroupedModel, "groupedModel_0001");
                });
        },
        /**
         * Procesa y transforma los resultados del servicio para agruparlos por tipo.
         * @param {Array} aResults - El array de datos crudos del servicio.
         * @returns {Array} El array de datos procesados y agrupados.
         * @private
         */
        _procesarYAgruparResultados: function (aResults) {
            const sNombreTipoSolicitud = "cust_nombreTSol_defaultValue";
            const sNombreSolicitud = "cust_nombreSol_defaultValue";
            const grouped = {};

            aResults.forEach(item => {
                // Se itera en los resultados de la entidad 0001, se le asigna a la variable 'tipo' el valor
                // actual del nombre de la solicitud desde la entidad 0002 (obtenida por el expand),
                // esto con el fin de buscar dentro de 'grouped' si ya hay un grupo con ese nombre.
                const tipo = item.cust_idTipo2Nav?.[sNombreTipoSolicitud] || "Sin tipo definido";

                // Se busca por ese nombre en el objeto 'grouped'. Si no se encuentra en el primer llamado,
                // se asigna un array vacío. Ej: grouped['Solicitud de Vacaciones'] = [],
                // para que los elementos que coincidan con ese nombre se puedan agregar.
                if (!grouped[tipo]) {
                    grouped[tipo] = [];
                }

                // Ahora que el array del grupo está inicializado, se le puede hacer push de los elementos del hijo (entidad 0001).
                grouped[tipo].push({
                    id: item.externalCode,
                    nombre: item[sNombreSolicitud],
                    fecha: item.effectiveStartDate,
                    evento: item.cust_event,
                    razonEvento: item.cust_eventReason,
                    objeto: item.cust_object,
                    tipoObjeto: item.cust_tipoObject,
                    campos_C_0004: item.cust_solFields,
                    WFNav_C_0003: item.cust_idWFNav
                });
            });

            // Se transforma el objeto en un array para el binding de la vista.
            return Object.keys(grouped).map(tipo => ({
                type: tipo,
                items: grouped[tipo]
            }));
        }
    });
});