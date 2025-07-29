sap.ui.define([
], function () {
    "use strict";
    return {

        /**
         * Crear datos en SuccessFactors
         * @param {string} sEntity - Nombre de la entidad (ej: "/cust_INETUM_SOL_C_0001")
         * @param {object} oService - Modelo OData del servicio
         * @param {object} oDataToSend - Datos a crear
         * @returns {Promise} Promise con la respuesta
         */
        createDataERP: function (sEntity, oService, oDataToSend) {
            return new Promise((resolve, reject) => {

                oService.create(sEntity, oDataToSend, {
                    success: (data, response) => {
                        resolve({ data, response });
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            });
        },

        /**
         * Leer datos de SuccessFactors
         * @param {string} sEntity - Nombre de la entidad
         * @param {object} oService - Modelo OData del servicio
         * @param {array} aFilter - Array de filtros UI5
         * @param {object} oParam - Parámetros adicionales {bParam: boolean, oParameter: object}
         * @returns {Promise} Promise con la respuesta
         */
        readDataERP: function (sEntity, oService, aFilter = [], oParam = { bParam: false, oParameter: undefined }) {
            return new Promise((resolve, reject) => {
                oService.read(sEntity, {
                    filters: aFilter,
                    urlParameters: oParam.bParam ? oParam.oParameter : {},
                    success: (data, response) => {
                        resolve({ data, response });
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            });
        },

        /**
         * Actualizar datos en SuccessFactors
         * @param {string} sEntity - Ruta completa con claves (ej: "/cust_INETUM_SOL_C_0001(externalCode=123)")
         * @param {object} oService - Modelo OData del servicio
         * @param {object} oDataToUpdate - Datos a actualizar
         * @returns {Promise} Promise con la respuesta
         */
        updateDataERP: function (sEntity, oService, oDataToUpdate) {
            return new Promise((resolve, reject) => {
                oService.update(sEntity, oDataToUpdate, {
                    success: (data, response) => {
                        resolve({ data, response });
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            });
        },

        /**
         * Eliminar datos de SuccessFactors
         * @param {string} sEntity - Ruta completa con claves
         * @param {object} oService - Modelo OData del servicio
         * @returns {Promise} Promise con la respuesta
         */
        deleteDataERP: function (sEntity, oService) {
            return new Promise((resolve, reject) => {
                oService.remove(sEntity, {
                    success: (data, response) => {
                        resolve({ data, response });
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            });
        },
        /**
         * Llama a una Function Import de OData.
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - El modelo OData del servicio.
         * @param {string} sFunctionName - El nombre de la Function Import.
         * @param {object} [mParameters] - Parámetros opcionales.
         * @param {'GET'|'POST'} [mParameters.method="GET"] - El método HTTP a usar.
         * @param {object} [mParameters.urlParameters] - Parámetros para la URL.
         * @param {object} [mParameters.payload] - El payload para las llamadas POST.
         * @returns {Promise<object>} Una promesa que se resuelve con el resultado de la función.
         */
        callFunction: function (oModel, sFunctionName, mParameters) {
            return new Promise((resolve, reject) => {
                oModel.callFunction(sFunctionName, {
                    method: mParameters?.method || "GET",
                    urlParameters: mParameters?.urlParameters,
                    payload: mParameters?.payload,
                    success: (oData) => resolve(oData),
                    error: (oError) => reject(oError)
                });
            });
        },

        /**
         * Ejecuta múltiples operaciones (crear, actualizar, eliminar) en un solo lote (batch).
         * Es la función más flexible para operaciones en lote.
         * @param {sap.ui.model.odata.v2.ODataModel} oModel - El modelo OData del servicio.
         * @param {object[]} aOperations - Un array de objetos, cada uno definiendo una operación.
         * @param {'create'|'update'|'remove'} aOperations[].type - El tipo de operación.
         * @param {string} aOperations[].path - La entidad para 'create' o la ruta clave para 'update'/'remove'.
         * @param {object} [aOperations[].payload] - El payload de datos para 'create' o 'update'.
         * @returns {Promise<object>} Una promesa que se resuelve cuando el lote se completa.
         */
        executeBatch: function (oModel, aOperations) {
            return new Promise((resolve, reject) => {
                // Asegúrate de que el modelo esté configurado para usar lotes
                oModel.setUseBatch(true);
                const sDeferredGroupId = `batch_${new Date().getTime()}`;
                oModel.setDeferredGroups([sDeferredGroupId]);

                aOperations.forEach(op => {
                    switch (op.type) {
                        case "create":
                            oModel.create(op.path, op.payload, {
                                groupId: sDeferredGroupId
                            });
                            break;
                        case "update":
                            oModel.update(op.path, op.payload, {
                                groupId: sDeferredGroupId
                            });
                            break;
                        case "remove":
                            oModel.remove(op.path, {
                                groupId: sDeferredGroupId
                            });
                            break;
                        default:
                            console.error(`Tipo de operación en lote no soportada: ${op.type}`);
                    }
                });

                oModel.submitChanges({
                    groupId: sDeferredGroupId,
                    success: (oData) => resolve(oData),
                    error: (oError) => reject(oError)
                });
            });
        }

    };
});