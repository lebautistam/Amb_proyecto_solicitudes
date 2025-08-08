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
                    oView.getOwnerComponent().getModel("busy").setProperty("/tableBusy", true);
                    let oFechaActual = new Date();
                    let sFechaFormatoOData = `/Date(${oFechaActual.getTime()})/`;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    let bStep;
                    const sGroupId = "updateStepsBatch";
                    try {
                        oModelApi.setDeferredGroups([sGroupId]);

                        if (parseInt(oContext.cust_indexStep) <= parseInt(oContext.cust_maxStep)) {
                            bStep = true;
                        } else if (parseInt(oContext.cust_indexStep) > parseInt(oContext.cust_maxStep)) {
                            bStep = false;
                        }
                        oContext.cust_steps.results.forEach(element => {
                            let cust_activeStep = null;
                            if (bStep) {
                                if (parseInt(element.cust_seqStep) == parseInt(oContext.cust_indexStep)) {
                                    cust_activeStep = false;
                                } else if (parseInt(element.cust_seqStep) == (parseInt(oContext.cust_indexStep) + 1)) {
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
                            cust_indexStep: (bStep ? (parseInt(oContext.cust_indexStep) + 1) : 0),
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
                                setTimeout(() => {
                                    utils._deleteProcessedRequest(oContext, oView);
                                }, 2000);
                            },
                            error: oError => {
                                const oParams = {
                                    actions: [MessageBox.Action.CLOSE]
                                }
                                utils.onShowMessage(`Ocurrió un error al aprobar la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                                console.log("Ocurrio un error al aprobar la solicitud", " ", oError)
                            }
                        });

                    } catch (oError) {
                        if (form) {
                            utils.showBI(false);
                        }
                        oView.getOwnerComponent().getModel("busy").setProperty("/tableBusy", false);
                        const oParams = {
                            actions: [MessageBox.Action.CLOSE]
                        }
                        utils.onShowMessage(`Ocurrió un error al aprobar la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                        console.log("Ocurrio un error al rechazar la solicitud", " ", oError)
                    }
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
                    oView.getOwnerComponent().getModel("busy").setProperty("/tableBusy", true);
                    let cust_activeStep = false;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    const sGroupId = "updateStepsBatchCancel";
                    try {
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
                                setTimeout(() => {
                                    utils._deleteProcessedRequest(oContext, oView);
                                }, 2000);
                            },
                            error: oError => {
                                const oParams = {
                                    actions: [MessageBox.Action.CLOSE]
                                }
                                utils.onShowMessage(`Ocurrió un error al rechazar la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                                console.log("Ocurrio un error al actualizar la solicitud", " ", oError)
                            }
                        });
                    } catch (oError) {
                        const oParams = {
                            actions: [MessageBox.Action.CLOSE]
                        }
                        utils.onShowMessage(`Ocurrió un error al rechazar la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                        console.log("Ocurrio un error al rechazar la solicitud", " ", oError)
                    }
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
                    oView.getOwnerComponent().getModel("busy").setProperty("/tableBusy", true);
                    let oFechaActual = new Date();
                    let sFechaFormatoOData = `/Date(${oFechaActual.getTime()})/`;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    const sGroupId = "updateStepsBatchReturn1";
                    try {
                        oModelApi.setDeferredGroups([sGroupId]);

                        oContext.cust_steps.results.forEach(element => {
                            let cust_activeStep = null;
                            if (parseInt(element.cust_seqStep) == parseInt(oContext.cust_indexStep)) {
                                cust_activeStep = false;
                            } else if (parseInt(element.cust_seqStep) == (parseInt(oContext.cust_indexStep) - 1)) {
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
                            cust_indexStep: (parseInt(oContext.cust_indexStep) - 1),
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
                                setTimeout(() => {
                                    utils._deleteProcessedRequest(oContext, oView);
                                }, 2000);
                            },
                            error: oError => {
                                const oParams = {
                                    actions: [MessageBox.Action.CLOSE]
                                }
                                utils.onShowMessage(`Ocurrió un error al retroceder la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                                console.log("Ocurrio un error al retroceder la solicitud", " ", oError)
                            }
                        });
                    } catch (oError) {
                        const oParams = {
                            actions: [MessageBox.Action.CLOSE]
                        }
                        utils.onShowMessage(`Ocurrió un error al retroceder la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                        console.log("Ocurrio un error al retroceder la solicitud", " ", oError)
                    }

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
                    oView.getOwnerComponent().getModel("busy").setProperty("/tableBusy", true);
                    let oFechaActual = new Date();
                    let sFechaFormatoOData = `/Date(${oFechaActual.getTime()})/`;
                    let oKeyDM0002;
                    let oKeyDM0001;
                    let oPayloadPrincipal = {};
                    const sGroupId = "updateStepsBatchBack";
                    try {
                        oModelApi.setDeferredGroups([sGroupId]);

                        oContext.cust_steps.results.forEach(element => {
                            let cust_activeStep = null;
                            if (parseInt(element.cust_seqStep) == parseInt(oContext.cust_indexStep)) {
                                cust_activeStep = false;
                            } else if (parseInt(element.cust_seqStep) == 1) {
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
                                setTimeout(() => {
                                    utils._deleteProcessedRequest(oContext, oView);
                                }, 2000);
                            },
                            error: oError => {
                                const oParams = {
                                    actions: [MessageBox.Action.CLOSE]
                                }
                                utils.onShowMessage(`Ocurrió un error al devolver la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                                console.log("Ocurrio un error al actualizar la solicitud", " ", oError)
                            }
                        });
                    } catch (oError) {
                        const oParams = {
                            actions: [MessageBox.Action.CLOSE]
                        }
                        utils.onShowMessage(`Ocurrió un error al devolver la solicitud ${oContext.cust_nombreSolicitud}`, "error", null, oParams)
                        console.log("Ocurrio un error al devolver la solicitud", " ", oError)
                    }

                } else if (oAction === sCancel) {
                    MessageToast.show("Acción cancelada.");
                }
            }.bind(oView);

            utils.onShowMessage(sMessage, oMensajes.I5.tipo, callFuntion, oProperties);
        }
    }
});