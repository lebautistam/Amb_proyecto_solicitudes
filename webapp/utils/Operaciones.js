sap.ui.define([
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
    "./Lenguaje",
    "./utils"
], (Log, JSONModel, Filter, FilterOperator, DateFormat, ToolbarSpacer, jQuery, MessageBox, MessageToast, formatter, service, Lenguaje, utils) => {
    "use strict";

    return {
        actionApprove: function (oContext, oView, form = false) {
            let oModel = oView.getOwnerComponent().getModel("modeloLocal");
            let oModelApi = oView.getView().getModel();
            let oModelC0000 = oView.getView().getModel("cust_INETUM_SOL_C_0000");
            let oMensajes = oModel.getProperty("/mensajes");
            let sMessage = oMensajes.I2.I2;
            const sAceptar = Lenguaje.obtenerNombreConcatenado("cust_aceptar");
            const sCancelar = Lenguaje.obtenerNombreConcatenado("cust_cancelar");
            let sAccept = oModelC0000.oData[0][sAceptar] || "Aceptar";
            let sCancel = oModelC0000.oData[0][sCancelar] || "Cancelar";
            let oProperties = {
                actions: [sAccept, sCancel],
                emphasizedAction: sAccept,

            };
            let callFuntion = function (oAction) {
                if (oAction === sAccept) {
                    if (form) {
                        utils.showBI(true);
                    }
                    let cust_activeStep = '';
                    let oFechaActual = new Date();
                    let sFechaFormatoOData = `/Date(${oFechaActual.getTime()})/`;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    let bStep;
                    const sGroupId = "updateStepsBatch";
                    oModelApi.setDeferredGroups([sGroupId]);

                    if (oContext.cust_indexStep <= oContext.cust_maxStep) {
                        bStep = true;
                    } else if (oContext.cust_indexStep > oContext.cust_maxStep) {
                        bStep = false;
                    }
                    oContext.cust_steps.results.forEach(element => {
                        if (bStep) {
                            if ((element.cust_seqStep == oContext.cust_indexStep)) {
                                cust_activeStep = false;
                            } else if (element.cust_seqStep == (oContext.cust_indexStep + 1)) {
                                cust_activeStep = true;
                            }
                        } else {
                            cust_activeStep = false;
                        }
                        if (typeof cust_activeStep === "boolean") {
                            oKeyDM0002 = oModelApi.createKey('/cust_INETUM_SOL_DM_0002', {
                                cust_INETUM_SOL_DM_0001_effectiveStartDate: element.cust_INETUM_SOL_DM_0001_effectiveStartDate,
                                cust_INETUM_SOL_DM_0001_externalCode: element.cust_INETUM_SOL_DM_0001_externalCode,
                                externalCode: element.externalCode
                            });
                            oModelApi.update(oKeyDM0002, { cust_activeStep }, {
                                groupId: sGroupId
                            });
                        }
                    });
                    oPayloadPrincipal = {
                        cust_indexStep: (bStep ? (oContext.cust_indexStep + 1) : 0),
                        cust_fechaAct: sFechaFormatoOData,
                        ...(!bStep && { cust_status: 'CO' })
                    };
                    oKeyDM0001 = oModelApi.createKey('/cust_INETUM_SOL_DM_0001', {
                        effectiveStartDate: oContext.effectiveStartDate,
                        externalCode: oContext.externalCode
                    });
                    oModelApi.update(oKeyDM0001, oPayloadPrincipal, {
                        groupId: sGroupId
                    });
                    oModelApi.submitChanges({
                        groupId: sGroupId,
                        success: (oData, oResponse) => {
                            MessageToast.show('Actualización completada con éxito.');
                            if ("onNavBack" in oView && typeof oView.onNavBack === "function") {
                                setTimeout(() => {
                                    utils.showBI(false);
                                    oView.onNavBack()
                                }, 2000);
                            };
                            if (!form) {
                                oView._getMainDataEntity();
                            }
                        },
                        error: oError => {
                            MessageBox.error("Ocurrió un error durante la actualización en lote.");
                            console.error("Error en lote:", oError);
                        }
                    });
                } else if (oAction === sCancel) {
                    MessageToast.show("Acción cancelada.");
                }
            }.bind(oView);

            utils.onShowMessage(sMessage, oMensajes.I2.tipo, callFuntion, oProperties);
        },
        actionReject: function (oContext, oView, form = false) {
            let oModel = oView.getOwnerComponent().getModel("modeloLocal");
            let oModelApi = oView.getView().getModel();
            let oModelC0000 = oView.getView().getModel("cust_INETUM_SOL_C_0000");
            let oMensajes = oModel.getProperty("/mensajes");
            let sMessage = oMensajes.I3.I3;
            const sAceptar = Lenguaje.obtenerNombreConcatenado("cust_aceptar");
            const sCancelar = Lenguaje.obtenerNombreConcatenado("cust_cancelar");
            let sAccept = oModelC0000.oData[0][sAceptar] || "Aceptar";
            let sCancel = oModelC0000.oData[0][sCancelar] || "Cancelar";
            let oProperties = {
                actions: [sAccept, sCancel],
                emphasizedAction: sAccept,

            };
            let callFuntion = function (oAction) {
                if (oAction === sAccept) {
                    if (form) {
                        utils.showBI(true);
                    }
                    let cust_activeStep = false;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    const sGroupId = "updateStepsBatchCancel";
                    oModelApi.setDeferredGroups([sGroupId]);

                    oContext.cust_steps.results.forEach(element => {
                        oKeyDM0002 = oModelApi.createKey('/cust_INETUM_SOL_DM_0002', {
                            cust_INETUM_SOL_DM_0001_effectiveStartDate: element.cust_INETUM_SOL_DM_0001_effectiveStartDate,
                            cust_INETUM_SOL_DM_0001_externalCode: element.cust_INETUM_SOL_DM_0001_externalCode,
                            externalCode: element.externalCode
                        });
                        oModelApi.update(oKeyDM0002, { cust_activeStep }, {
                            groupId: sGroupId
                        });
                    });
                    oPayloadPrincipal = {
                        cust_indexStep: 0,
                        // cust_fechaAct: sFechaFormatoOData,
                        cust_status: 'CA'
                    };
                    oKeyDM0001 = oModelApi.createKey('/cust_INETUM_SOL_DM_0001', {
                        effectiveStartDate: oContext.effectiveStartDate,
                        externalCode: oContext.externalCode
                    });
                    oModelApi.update(oKeyDM0001, oPayloadPrincipal, {
                        groupId: sGroupId
                    });
                    oModelApi.submitChanges({
                        groupId: sGroupId,
                        success: (oData, oResponse) => {
                            MessageToast.show('Actualización completada con éxito.');
                            if ("onNavBack" in oView && typeof oView.onNavBack === "function") {
                                setTimeout(() => {
                                    utils.showBI(false);
                                    oView.onNavBack()
                                }, 2000);
                            };
                            if (!form) {
                                oView._getMainDataEntity();
                            }
                        },
                        error: oError => {
                            MessageBox.error("Ocurrió un error durante la actualización en lote.");
                            console.error("Error en lote:", oError);
                        }
                    });
                } else if (oAction === sCancel) {
                    MessageToast.show("Acción cancelada.");
                }
            }.bind(oView);
            utils.onShowMessage(sMessage, oMensajes.I3.tipo, callFuntion, oProperties);
        },
        actionReturn: function (oContext, oView, form = false) {
            let oModel = oView.getOwnerComponent().getModel("modeloLocal");
            let oModelApi = oView.getView().getModel();
            let oModelC0000 = oView.getView().getModel("cust_INETUM_SOL_C_0000");
            let oMensajes = oModel.getProperty("/mensajes");
            let sMessage = oMensajes.I4.I4;
            const sAceptar = Lenguaje.obtenerNombreConcatenado("cust_aceptar");
            const sCancelar = Lenguaje.obtenerNombreConcatenado("cust_cancelar");
            let sAccept = oModelC0000.oData[0][sAceptar] || "Aceptar";
            let sCancel = oModelC0000.oData[0][sCancelar] || "Cancelar";
            let oProperties = {
                actions: [sAccept, sCancel],
                emphasizedAction: sAccept,

            };
            let callFuntion = function (oAction) {
                if (oAction === sAccept) {
                    if (form) {
                        utils.showBI(true);
                    }
                    let cust_activeStep = '';
                    let oFechaActual = new Date();
                    let sFechaFormatoOData = `/Date(${oFechaActual.getTime()})/`;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    const sGroupId = "updateStepsBatchReturn1";
                    oModelApi.setDeferredGroups([sGroupId]);

                    oContext.cust_steps.results.forEach(element => {
                        if ((element.cust_seqStep == oContext.cust_indexStep)) {
                            cust_activeStep = false;
                        } else if (element.cust_seqStep == (oContext.cust_indexStep - 1)) {
                            cust_activeStep = true;
                        }
                        if (typeof cust_activeStep === "boolean") {
                            oKeyDM0002 = oModelApi.createKey('/cust_INETUM_SOL_DM_0002', {
                                cust_INETUM_SOL_DM_0001_effectiveStartDate: element.cust_INETUM_SOL_DM_0001_effectiveStartDate,
                                cust_INETUM_SOL_DM_0001_externalCode: element.cust_INETUM_SOL_DM_0001_externalCode,
                                externalCode: element.externalCode
                            });
                            oModelApi.update(oKeyDM0002, { cust_activeStep }, {
                                groupId: sGroupId
                            });
                        }
                    });
                    oPayloadPrincipal = {
                        cust_indexStep: (oContext.cust_indexStep - 1),
                        cust_fechaAct: sFechaFormatoOData
                    };
                    oKeyDM0001 = oModelApi.createKey('/cust_INETUM_SOL_DM_0001', {
                        effectiveStartDate: oContext.effectiveStartDate,
                        externalCode: oContext.externalCode
                    });
                    oModelApi.update(oKeyDM0001, oPayloadPrincipal, {
                        groupId: sGroupId
                    });
                    oModelApi.submitChanges({
                        groupId: sGroupId,
                        success: (oData, oResponse) => {
                            MessageToast.show('Actualización completada con éxito.');
                            if ("onNavBack" in oView && typeof oView.onNavBack === "function") {
                                setTimeout(() => {
                                    utils.showBI(false);
                                    oView.onNavBack()
                                }, 2000);
                            };
                            if (!form) {
                                oView._getMainDataEntity();
                            }
                        },
                        error: oError => {
                            MessageBox.error("Ocurrió un error durante la actualización en lote.");
                            console.error("Error en lote:", oError);
                        }
                    });
                } else if (oAction === sCancel) {
                    MessageToast.show("Acción cancelada.");
                }
            }.bind(oView);

            utils.onShowMessage(sMessage, oMensajes.I4.tipo, callFuntion, oProperties);
        },
        actionBack: function (oContext, oView, form = false) {
            let oModel = oView.getOwnerComponent().getModel("modeloLocal");
            let oModelApi = oView.getView().getModel();
            let oModelC0000 = oView.getView().getModel("cust_INETUM_SOL_C_0000");
            let oMensajes = oModel.getProperty("/mensajes");
            let sMessage = oMensajes.I5.I5;
            const sAceptar = Lenguaje.obtenerNombreConcatenado("cust_aceptar");
            const sCancelar = Lenguaje.obtenerNombreConcatenado("cust_cancelar");
            let sAccept = oModelC0000.oData[0][sAceptar] || "Aceptar";
            let sCancel = oModelC0000.oData[0][sCancelar] || "Cancelar";
            let oProperties = {
                actions: [sAccept, sCancel],
                emphasizedAction: sAccept,

            };
            let callFuntion = function (oAction) {
                if (oAction === sAccept) {
                    if (form) {
                        utils.showBI(true);
                    }
                    let cust_activeStep = '';
                    let oFechaActual = new Date();
                    let sFechaFormatoOData = `/Date(${oFechaActual.getTime()})/`;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    const sGroupId = "updateStepsBatchBack";
                    oModelApi.setDeferredGroups([sGroupId]);

                    oContext.cust_steps.results.forEach(element => {
                        if ((element.cust_seqStep == oContext.cust_indexStep)) {
                            cust_activeStep = false;
                        } else if (element.cust_seqStep == 1) {
                            cust_activeStep = true;
                        }
                        if (typeof cust_activeStep === "boolean") {
                            oKeyDM0002 = oModelApi.createKey('/cust_INETUM_SOL_DM_0002', {
                                cust_INETUM_SOL_DM_0001_effectiveStartDate: element.cust_INETUM_SOL_DM_0001_effectiveStartDate,
                                cust_INETUM_SOL_DM_0001_externalCode: element.cust_INETUM_SOL_DM_0001_externalCode,
                                externalCode: element.externalCode
                            });
                            oModelApi.update(oKeyDM0002, { cust_activeStep }, {
                                groupId: sGroupId
                            });
                        }
                    });
                    oPayloadPrincipal = {
                        cust_indexStep: 1,
                        cust_fechaAct: sFechaFormatoOData
                    };
                    oKeyDM0001 = oModelApi.createKey('/cust_INETUM_SOL_DM_0001', {
                        effectiveStartDate: oContext.effectiveStartDate,
                        externalCode: oContext.externalCode
                    });
                    oModelApi.update(oKeyDM0001, oPayloadPrincipal, {
                        groupId: sGroupId
                    });
                    debugger;
                    oModelApi.submitChanges({
                        groupId: sGroupId,
                        success: (oData, oResponse) => {
                            MessageToast.show('Actualización completada con éxito.');
                            if ("onNavBack" in oView && typeof oView.onNavBack === "function") {
                                setTimeout(() => {
                                    utils.showBI(false);
                                    oView.onNavBack()
                                }, 2000);
                            };
                            if (!form) {
                                oView._getMainDataEntity();
                            }
                        },
                        error: oError => {
                            MessageBox.error("Ocurrió un error durante la actualización en lote.");
                            console.error("Error en lote:", oError);
                        }
                    });
                } else if (oAction === sCancel) {
                    MessageToast.show("Acción cancelada.");
                }
            }.bind(oView);

            utils.onShowMessage(sMessage, oMensajes.I5.tipo, callFuntion, oProperties);
        }
    }
});