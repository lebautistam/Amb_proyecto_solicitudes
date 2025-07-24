sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../service/service",
    "../model/formatter",
    "sap/ui/core/routing/History"

], (Controller, JSONModel, Filter, FilterOperator, Service, formatter, History) => {
    "use strict";

    return Controller.extend("com.amb.ambpendiapro.controller.VisualizarSolicitud", {
        onInit() {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteVisualizacionSolicitud").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            const sExternalCode = oEvent.getParameter("arguments").externalCode;
            const sEffectiveDate = oEvent.getParameter("arguments").effectiveStartDate;
            console.log(sExternalCode, "   ", sEffectiveDate)
            // Construimos el path para el Element Binding
            // El formato es NombreDeLaEntidad(Clave1='valor1',Clave2=datetime'valor2')
            // const sObjectPath = this.getView().getModel("cust_INETUM_SOL_DM_0001").createKey("cust_nombreDeTuEntidadSet", {
            //     externalCode: sExternalCode,
            //     efectiveStartDate: new Date(sEffectiveDate) // Reconstruir la fecha si es necesario
            // });

            // Hacemos el binding del elemento a la vista completa
            // this.getView().bindElement({
            //     path: "/" + sObjectPath,
            //     model: "cust_INETUM_SOL_DM_0001",
            //     events: {
            //         change: this._onBindingChange.bind(this), // Se dispara cuando los datos se cargan
            //         dataRequested: function () {
            //             // Opcional: mostrar un busy indicator
            //             this.getView().setBusy(true);
            //         }.bind(this),
            //         dataReceived: function () {
            //             // Opcional: ocultar el busy indicator
            //             this.getView().setBusy(false);
            //         }.bind(this)
            //     }
            // });
        }
    });
});