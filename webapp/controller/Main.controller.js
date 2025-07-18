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
], (Controller, Log, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, MessageBox, MessageToast) => {
  "use strict";

  return Controller.extend("com.amb.ambpendiapro.controller.Main", {
    onInit() {

      this._requestBusy();
      this._getRowsTable();
      let oModel = this.getOwnerComponent().getModel();
      let aDataModel = [];
      oModel.read("/cust_INETUM_SOL_DM_0001", {
        urlParameters: {
          "$expand": "cust_steps",
          "$select": "cust_nombreSol_defaultValue,cust_nombreTSol_defaultValue,cust_solicitante,cust_fechaSol,cust_deadLine,cust_steps"
        }, 
        success: (oData, oResponse) => {
          oData.results.forEach(element => {
            if (element.cust_steps.results.length > 0) {
              if (Array.isArray(element.cust_steps.results)) {
                let filter = element.cust_steps.results.filter(step => step.cust_aprobUser == "SFADMIN_LBM" && step.cust_activeStep == true);
                if(filter.length > 0) {
                  aDataModel.push(element);
                }
              } else {
                console.log("Descripción:", element.cust_steps);
              }
            }
          });
          console.log(aDataModel)
        },
        error: oError => {
          console.log(oError)
        }

      });
      let oModel2 = this.getOwnerComponent().getModel("modeloLocal");
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
      // var oKey = oModel.createKey('/cust_INETUM_SOL_DM_0000', {
      //   effectiveStartDate: '2025-07-16T11:52:03',
      //   externalCode: '123456789'
      // });
      // oModel.remove(oKey, {
      //     success: (oData, oResponse) => {
      //       console.log(oData, oResponse)
      //     },
      //     error: oError => {
      //       console.log(oError)
      //     }
      //   })
      // oModel.read("/cust_INETUM_SOL_DM_0001", {
      //   success: (oData, oResponse) => {
      //     console.log(oData, oResponse)
      //   },
      //   error: oError => {
      //     console.log(oError)
      //   }
      // })
      // console.log(aRecords)
    },
    onApprove: function (oEvent) {
      let oButton = oEvent.getSource()
      let oContext = oButton.getBindingContext().getObject();

      console.log(oContext)

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
      console.log(this._oGlobalFilter, this._oPriceFilter)
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
    }
  });
});