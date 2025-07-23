sap.ui.define([
    "../service/service",
    "sap/ui/core/format/DateFormat"
], function (service, DateFormat) {
    "use strict";
    return {
        service: service,
        formatVencimiento: function (sCustFechaVenci, sCustVto) {

            if (!sCustFechaVenci || sCustFechaVenci === null || sCustFechaVenci === "null") {
                return "";
            }
            if (!sCustFechaVenci instanceof Date || isNaN(sCustFechaVenci.getTime())) {
                return "";
            }
            let oToday = new Date();
            let oCusFeSol = new Date(sCustFechaVenci);
            if (oCusFeSol >= oToday) {
                // const oDateFormat = DateFormat.getDateInstance({
                //     style: "medium"
                //     // pattern: "dd/MM/yyyy"
                // });
                return sCustVto;
            }else{
                let sDiasVencidos = oToday.getTime() - oCusFeSol.getTime();
                const daysSinceRequest = Math.floor(sDiasVencidos / (1000 * 60 * 60 * 24));
                return `Vencida \n${daysSinceRequest} días`;
            }

        },
        formatVencimientoStatus: function(sCustFechaVenci, sCustVto){
            if (!sCustFechaVenci || sCustFechaVenci === null || sCustFechaVenci === "null") {
                return "None";
            }
            if (!sCustFechaVenci instanceof Date || isNaN(sCustFechaVenci.getTime())) {
                return "None";
            }
            let oToday = new Date();
            let oCusFeSol = new Date(sCustFechaVenci);
            // console.log(oToday, "hoyno: " + oCusFeSol);
            if (oCusFeSol >= oToday) {
                return "None";
            }else{
                return `Error`;
            }

        },
        numberUnit: function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },

        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "EN_CURSO":
                    return "Warning";
                case "COMPLETADO":
                    return "Success";
                case "CANCELADO":
                    return "None";
                case "RECHAZADO":
                    return "Error";
                default:
                    return "None";
            }
        },

        formatStatusIcon: function (sStatus) {
            switch (sStatus) {
                case "EN_CURSO":
                    return "sap-icon://pending";
                case "COMPLETADO":
                    return "sap-icon://complete";
                case "CANCELADO":
                    return "sap-icon://cancel";
                case "RECHAZADO":
                    return "sap-icon://decline";
                default:
                    return "sap-icon://status-inactive";
            }
        },

        formatDateToYYYYMMDD: function (dateString) {

            if (!dateString || dateString === null || dateString === "null") {
                return "";
            }

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return "";
            }

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;

            return formattedDate;
        },

        // Texto en Mayusculas    
        formatUpperCase: function (sValue) {
            return sValue ? sValue.toUpperCase() : "";
        },
        //  texto primera letra en mayuscula
        formatCapitalize: function (sValue) {
            if (!sValue) return "";
            return sValue.charAt(0).toUpperCase() + sValue.slice(1).toLowerCase();
        },

        formatTimeAgo: function (dateValue) {
            if (!dateValue) return "";

            try {

                const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

                // Verificar que la fecha sea válida
                if (isNaN(date.getTime())) {
                    return "";
                }

                const now = new Date();
                const diffInMs = now - date;

                // Si la fecha es futura, manejar diferente
                if (diffInMs < 0) {
                    return "En el futuro";
                }

                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

                // Solo días en adelante
                if (diffInDays === 0) return "Hoy";
                if (diffInDays === 1) return "Ayer";
                if (diffInDays < 7) return `Hace ${diffInDays} días`;

                // Semanas
                const diffInWeeks = Math.floor(diffInDays / 7);
                if (diffInDays < 30) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;

                // Meses
                const diffInMonths = Math.floor(diffInDays / 30);
                if (diffInDays < 365) return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;

                // Años
                const diffInYears = Math.floor(diffInDays / 365);
                return `Hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;

            } catch (e) {
                console.error("Error en formatTimeAgo:", e);
                return "";
            }
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