sap.ui.define([
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator",

], function (MessageBox, MessageToast, BusyIndicator) {
    "use strict";

    return {
        console: console,
        styleClass: "sapUiSizeCompact",
        i18n: null,


        onShowMessage: function (_message, _type, _fnCallback, _oProperties) {
            let oProperties = {
                styleClass: this.styleClass
            };
            if (_oProperties !== undefined && _oProperties !== null) {
                oProperties = _oProperties;
            }
            if (_fnCallback !== undefined && _fnCallback !== null) {
                oProperties.onClose = _fnCallback;
            }
            try {
                if (_message !== undefined && _type !== undefined) {
                    switch (_type) {
                        case "info":
                            MessageBox.information(_message, oProperties);
                            break;
                        case "error":
                            MessageBox.error(_message, oProperties);
                            break;
                        case "warn":
                            MessageBox.warning(_message, oProperties);
                            break;
                        case "toast":
                            MessageToast.show(_message);
                            break;
                        case "done":
                            MessageBox.success(_message, oProperties);
                            break;
                    }
                } else {
                    this.console.warn("_message or _type are undefined");
                }
            } catch (err) {
                this.console.warn(err.stack);
            }
        },

        showBI: function (value) {
            if (value) {
                BusyIndicator.show(0);
            } else {
                BusyIndicator.hide();
            }
        },

        _deleteProcessedRequest: function (oContext, oView) {
            try {
                const oModel = oView.getOwnerComponent().getModel("cust_INETUM_SOL_DM_0001");
                const oProperties = oModel.getProperty("/cust_INETUM_SOL_DM_0001");
                const index = oProperties.findIndex(item => item.externalCode === oContext.externalCode);
                if (index > -1) {
                    oProperties.splice(index, 1); 
                }
                oModel.refresh(true);
            } catch (error) {
                console.error("Error al eliminar solicitud de modelo fn _deleteProcessedRequest:", error)
            }finally{
                oView.getView().getModel("busy").setProperty("/tableBusy", false);
            }
        }

    };
});