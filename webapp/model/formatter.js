sap.ui.define([
], function () {
    "use strict";
    return {
        approvalStatus: function (status) {
            if (status === "A") {
                return "Success";
            } else {
                return "Error";
            }
        },
        editingStatus: function (isActive) {
            if (isActive) {
                return "Active";
            } else {
                return "Draft";
            }
        },
        setStatusIcon: function (isDraft) {
            if (isDraft === sap.m.ObjectMarkerType.Draft) {
                return "sap-icon://edit";
            }
            return "sap-icon://complete";
        },
        setColor: function (isDraft) {
            if (isDraft === sap.m.ObjectMarkerType.Draft) {
                return "#0754f8";
            }
        },
        setStatusColor: function (isDraft) {
            if (isDraft === sap.m.ObjectMarkerType.Draft) {
                return "#0754f8";
            }
            return "#1d2d3e";
        },
        getFechaFormateada: function (fecha) {
            return this.formatDateFromBackend(fecha);
        },
        formatDateFromBackend: function (dateString) {
            // Separar la parte entera de la parte decimal
            var dateTime = dateString.split(".");
            var datePart = dateTime[0];

            // Extraer cada componente de la fecha
            var year = datePart.substring(0, 4);
            var month = datePart.substring(4, 6);
            var day = datePart.substring(6, 8);

            return day + "/" + month + "/" + year;
        },
        nombreCamposLog01: function (campo) {
            const oCamposLog = this.getView().getModel("modeloLocal").getProperty("/CamposLog01");
            return oCamposLog[campo] || "UPDATE";
        },
        nombreCamposLog08: function (campo) {
            const oCamposLog = this.getView().getModel("modeloLocal").getProperty("/CamposLog08");
            return oCamposLog[campo] || "UPDATE";
        },
        fechaLog01: function (fecha) {
            return fecha.substring(6, 8) + "/" + fecha.substring(4, 6) + "/" + fecha.substring(0, 4);
        },
        fechaLog05: function (fecha) {
            return fecha.substring(6, 8) + "/" + fecha.substring(4, 6) + "/" + fecha.substring(0, 4);
        },
        fechaLog08: function (fecha) {
            return fecha.substring(6, 8) + "/" + fecha.substring(4, 6) + "/" + fecha.substring(0, 4);
        },
        numberUnitDecimalExit: function (sValue, sCurrency) {
            if (!sValue) {
                return "0,00";
            }

            var oFloatFormatter = sap.ui.core.format.NumberFormat.getFloatInstance();
            oFloatFormatter.oFormatOptions.maxFractionDigits = 2;
            oFloatFormatter.oFormatOptions.minFractionDigits = 2;
            oFloatFormatter.oFormatOptions.maxIntegerDigits = 17;
            oFloatFormatter.oFormatOptions.decimalSeparator = ",";
            oFloatFormatter.oFormatOptions.groupingSeparator = ".";
            oFloatFormatter.oFormatOptions.roundingMode = "away_from_zero";

            // Ajusta el formato dependiendo de la moneda
            //if (sCurrency === "JPY") {
            //  sValue = sValue / 100;
            //}

            return oFloatFormatter.format(sValue);
        }

    };
});