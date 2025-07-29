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
    "../utils/Operaciones"
], (Controller, Log, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, MessageBox, MessageToast, formatter, service, utils, Operaciones) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.Main", {
        formatter: formatter,
        onInit() {
            var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
            console.log(sLanguage);
            this._loadUserInfo();
            this._requestBusy();
            this._cargarListaDeSolicitudes();
            // this._getRowsTable();
            let oViewModelC0000 = this.getView().getModel("cust_INETUM_SOL_C_0000");
            let oViewModelDM0001 = this.getView().getModel("cust_INETUM_SOL_DM_0001");
            if (!oViewModelC0000) {
                this._getParametersApp();
            }
            if (!oViewModelDM0001) {
                this._getMainDataEntity();
            }

            let oModel2 = this.getOwnerComponent().getModel("modeloLocal");
            let oModel = this.getOwnerComponent().getModel();
            // const fechaDeseada = new Date('2025-07-16T11:52:03');
            let fechaDeseada = new Date();
            let fechaDeseada2 = new Date('2025-07-14T11:52:03');

            // 2. Obtén los milisegundos ("ticks") desde la época Unix.
            let ticks = fechaDeseada.getTime();
            let ticks2 = fechaDeseada2.getTime();

            // 3. Construye la cadena en el formato que OData V2 espera.
            let fechaODataV2 = `/Date(${ticks})/`;
            let fechaODataV22 = `/Date(${ticks2})/`;
            let aRecords = oModel2.getProperty("/solicitudes");
            let i = 11;
            let j = 1;
            // aRecords.forEach(function (oRecord) {
            //   // fechaDeseada2 = new Date(fechaDeseada2);
            //   var oPayload = {
            //     cust_INETUM_SOL_DM_0001_effectiveStartDate: fechaODataV2,
            //     cust_INETUM_SOL_DM_0001_externalCode: `${i}`,
            //     cust_aprobUser: oRecord.cust_aprobUser,
            // cust_activeStep: oRecord.cust_activeStep
            // cust_deadLine: fechaODataV22,
            // externalCode: `${i}`,
            // effectiveStartDate: fechaODataV2,
            // cust_fechaSol: fechaODataV2,
            // cust_solicitante: "SFADMIN_LBM"
            // };
            // fechaDeseada2 = fechaDeseada2.setDate(fechaDeseada2.getDate() + j);
            // console.log(fechaDeseada2)
            // ticks2 = fechaDeseada.getTime(); 
            // fechaODataV22 = `/Date(${ticks2})/`;
            //   i ++;
            //   j++;
            //   // Crear una operación para cada registro
            //   oModel.create("/cust_INETUM_SOL_DM_0002", oPayload, {
            //         success: (oData, oResponse) => {
            //           console.log(oData, oResponse)
            //         },
            //         error: oError => {
            //           console.log(oError)
            //         }
            //   })
            // });


            // 4. Ahora crea tu payload con el formato correcto.
            let oPayload = {
                effectiveStartDate: fechaODataV2,
                externalCode: '123456789'
            };

            // oModel.create("/cust_INETUM_SOL_C_0000", oPayload, {
            //     success: (oData, oResponse) => {
            //       console.log(oData, oResponse)
            //     },
            //     error: oError => {
            //       console.log(oError)
            //     }
            //   })
            // for (let index = 1; index < 11; index++) {

            //   var oKey = oModel.createKey('/cust_INETUM_SOL_DM_0002', {
            //     effectiveStartDate: '2025-07-16T11:52:03',
            //     externalCode: `${index}`
            //   });
            //   oModel.remove(oKey, {
            //       success: (oData, oResponse) => {
            //         console.log(oData, oResponse)
            //       },
            //       error: oError => {
            //         console.log(oError)
            //       }
            //     })
            // }
            const oFilterSimple = new Filter("PickListV2_id", FilterOperator.EQ, "INETUM_SOL_P_0008");
            oModel.read("/PickListValueV2", {
                // urlParameters: {
                //     "$expand": "cust_solFields/cust_fieldNav,cust_steps,cust_objectNav/parentPickListValueNav,cust_tipoObjectNav",
                //     // "$filters": "key eq 'A'"
                // },
                urlParameters: {
                    "$expand": "parentPickListValueNav",
                    // "$filters": "key eq 'A'"
                },
                filters: [oFilterSimple],
                success: (oData, oResponse) => {
                    console.log(oData, oResponse)
                },
                error: oError => {
                    console.log(oError)
                }
            })
            // console.log(aRecords)
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
            this._oPriceFilter = null;
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
                    new Filter("cust_nombreSol_defaultValue", FilterOperator.Contains, sQuery),
                    new Filter("cust_nombreTSol_defaultValue", FilterOperator.Contains, sQuery),
                    new Filter("cust_solicitante", FilterOperator.Contains, sQuery)
                ], false);
            }

            this._filter();
            this._updateTableCount();
        },
        _filter: function () {
            let oFilter = null;
            if (this._oGlobalFilter && this._oPriceFilter) {
                oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
            } else if (this._oGlobalFilter) {
                oFilter = this._oGlobalFilter;
            } else if (this._oPriceFilter) {
                oFilter = this._oPriceFilter;
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

            if (!oModelScf) {
                console.error("Error: El modelo OData no está disponible en onInit.");
                // Puedes lanzar una excepción o manejar este caso de alguna manera.
                return; // Detener la ejecución si el modelo no está listo
            }
            oModelScf.attachRequestSent(function () {
                this.getView().getModel("busy").setProperty("/tableBusy", true);
            }, this);

            oModelScf.attachRequestCompleted(function () {
                this.getView().getModel("busy").setProperty("/tableBusy", false);
                this._updateTableCount
            }, this);

            oModelScf.attachRequestFailed(function () {
                this.getView().getModel("busy").setProperty("/tableBusy", false);
            }, this);
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

            oTable.attachEventOnce("rowsUpdated", function () {
                const oBinding = oTable.getBinding("rows");
                if (oBinding) {
                    oBinding.attachEvent("dataReceived", this._updateTableCount, this);
                    this._updateTableCount();
                } else {
                    console.warn("Binding de filas de la tabla no encontrado después de rowsUpdated.");
                }
            }, this);
        },
        _getParametersApp: function () {
            let oModelApi = this.getOwnerComponent().getModel();
            service.readDataERP("/cust_INETUM_SOL_C_0000", oModelApi)
                .then(data => {
                    let oNewModelC0000 = new JSONModel(data.data.results)
                    this.getOwnerComponent().setModel(oNewModelC0000, "cust_INETUM_SOL_C_0000");
                })
                .catch(error => {
                    console.error("Error: ", error.message);
                });
        },
        _getMainDataEntity: function () {
            let oModel = this.getOwnerComponent().getModel();
            let aDataModel = [];
            let ii = 0;
            oModel.read("/cust_INETUM_SOL_DM_0001", {
                urlParameters: {
                    "$expand": "cust_steps,cust_solFields",
                    "$select": "cust_solFields,effectiveStartDate,externalCode,cust_solicitante,cust_fechaSol,cust_deadLine,cust_steps,cust_indexStep,cust_maxStep,cust_status,cust_object"
                },
                success: (oData, oResponse) => {
                    oData.results.forEach(element => {
                        if (element.cust_steps.results.length > 0) {

                            let filter = element.cust_steps.results.filter(step => step.cust_aprobUser == "SFADMIN_LBM" && step.cust_activeStep == false);
                            if (filter.length) {
                                let oKey = oModel.createKey('/cust_INETUM_SOL_C_0000', {
                                    effectiveStartDate: '2025-07-15T19:00:00',
                                    externalCode: '123456789'
                                });
                                service.readDataERP(oKey, oModel)
                                    .then(data => {
                                        element.cust_vto = data.data.cust_vto_defaultValue;
                                    })
                                    .catch(error => {
                                        console.error("Error: ", error.message);
                                    });
                                aDataModel.push(element);
                                filter = [];
                                ii++;
                            }
                        }
                        console.log(aDataModel);
                    });
                    const oNewModelDm0001 = new JSONModel({ cust_INETUM_SOL_DM_0001: oData.results })
                    this.getOwnerComponent().setModel(oNewModelDm0001, "cust_INETUM_SOL_DM_0001");
                },
                error: oError => {
                    console.log(oError)
                }

            });
            this._getRowsTable();
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

            // Creamos un objeto vacío 'grouped' para asignarle los elementos de la entidad de forma correcta
            // ya que el read inicial devuelve hijos con padres anidados, requerimos transformar a padres con hijos anidados.
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