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
    "../utils/utils"
], (Controller, Log, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, MessageBox, MessageToast, formatter, service, utils) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.Main", {
        formatter: formatter,
        vto: '',
        onInit() {
            var sLanguage = sap.ui.getCore().getConfiguration().getLanguage();
            console.log(sLanguage);
            this._loadUserInfo();
            this._requestBusy();
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
            oModel.read("/cust_INETUM_SOL_DM_0001", {
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
            let oModel = this.getOwnerComponent().getModel("modeloLocal");
            let oModelApi = this.getOwnerComponent().getModel();
            let oModelViewTable = this.getView().getModel("cust_INETUM_SOL_DM_0001");
            let oModelC0000 = this.getView().getModel("cust_INETUM_SOL_C_0000");
            let oMensajes = oModel.getProperty("/mensajes");
            let sMessage = oMensajes.I2.I2;
            let sAccept = oModelC0000.oData.cust_aceptar_defaultValue;
            let sCancel = oModelC0000.oData.cust_cancelar_defaultValue;
            let oProperties = {
                actions: [sAccept, sCancel],
                emphasizedAction: sAccept,

            };
            console.log(oContext)
            // Mostrar el pop-up de confirmación
            utils.onShowMessage(sMessage, oMensajes.I2.tipo,
                function (oAction) {
                    if (oAction === sAccept) {
                        let cust_activeStep
                        oContext.cust_steps.results.forEach(element => {
                            if (element.cust_seqStep == oContext.cust_indexStep) {
                                let oKey = oModelApi.createKey('/cust_INETUM_SOL_DM_0002', {
                                    cust_INETUM_SOL_DM_0001_effectiveStartDate: element.cust_INETUM_SOL_DM_0001_effectiveStartDate,
                                    cust_INETUM_SOL_DM_0001_externalCode: element.cust_INETUM_SOL_DM_0001_externalCode,
                                    externalCode: element.externalCode
                                });
                                cust_activeStep = true;
                                service.updateDataERP(oKey, oModelApi, { cust_activeStep })
                                    .then(data => {

                                    })
                                    .catch(error => {
                                        console.error("Error: ", error.message);
                                    });
                                this._getMainDataEntity();
                                MessageToast.show('ok');
                            }
                        });;
                    } else if (oAction === sCancel) {
                        MessageToast.show("Acción cancelada.");
                    }
                }.bind(this), oProperties
            );

        },
        onReject: function () {
            var sMessage = "Estás a punto de aprobar la(s) solicitud(es) seleccionada(s). ¿Deseas continuar?";
            var sTitle = "Confirmación de Aprobación";

            // Mostrar el pop-up de confirmación
            MessageBox.confirm(sMessage, {
                title: sTitle,
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                // details: "Esta acción no se puede deshacer.", // Opcional: Información adicional detallada
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        MessageToast.show("¡Confirmado! Procediendo con la aprobación.");
                    } else if (oAction === MessageBox.Action.CANCEL) {
                        MessageToast.show("Acción cancelada.");
                    }
                }.bind(this)
            });
        },
        onReturn1: function () {
            var sMessage = "Estás a punto de aprobar la(s) solicitud(es) seleccionada(s). ¿Deseas continuar?";
            var sTitle = "Confirmación de Aprobación";

            // Mostrar el pop-up de confirmación
            MessageBox.confirm(sMessage, {
                title: sTitle,
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                // details: "Esta acción no se puede deshacer.", // Opcional: Información adicional detallada
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        MessageToast.show("¡Confirmado! Procediendo con la aprobación.");
                    } else if (oAction === MessageBox.Action.CANCEL) {
                        MessageToast.show("Acción cancelada.");
                    }
                }.bind(this)
            });
        },
        onReturn: function () {
            var sMessage = "Estás a punto de aprobar la(s) solicitud(es) seleccionada(s). ¿Deseas continuar?";
            var sTitle = "Confirmación de Aprobación";

            // Mostrar el pop-up de confirmación
            MessageBox.confirm(sMessage, {
                title: sTitle,
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                // details: "Esta acción no se puede deshacer.", // Opcional: Información adicional detallada
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        MessageToast.show("¡Confirmado! Procediendo con la aprobación.");
                    } else if (oAction === MessageBox.Action.CANCEL) {
                        MessageToast.show("Acción cancelada.");
                    }
                }.bind(this)
            });
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
                    this.getView().setModel(oNewModelC0000, "cust_INETUM_SOL_C_0000");
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
                    "$expand": "cust_steps",
                    "$select": "effectiveStartDate,externalCode,cust_solicitante,cust_fechaSol,cust_deadLine,cust_steps,cust_indexStep,cust_maxStep"
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
                    const oNewModelDm0001 = new JSONModel({ cust_INETUM_SOL_DM_0001: aDataModel })
                    this.getView().setModel(oNewModelDm0001, "cust_INETUM_SOL_DM_0001");
                },
                error: oError => {
                    console.log(oError)
                }

            });
            this._getRowsTable();
        }
    });
});