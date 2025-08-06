sap.ui.define([
    "sap/ui/layout/form/FormElement",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/TextArea",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/UploadCollection",
    "sap/m/MessageToast",
    "sap/m/library",
    "./Lenguaje",
    "../service/service",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "./utils",
], function (FormElement, Label, Input, DatePicker, TextArea, Select, Item, UploadCollection, MessageToast, ListMode, Lenguaje, service, Filter, FilterOperator, utils) {
    "use strict";
    /**
    * construye un objeto de adjunto para visualizar
    * y descargarlo
    * @param {object} attachment metadata del objeto adjunto
    * @returns {object} item a agregar a la vista
    * @public
    */
    function _viewAttachment(attachment) {
        const oItem = new sap.m.UploadCollectionItem({
            fileName: attachment.fileName,
            mimeType: attachment.mimeType,
            // La URL es la que permite la descarga. La creamos a partir del Base64.
            url: _crearDataURI(attachment.mimeType, attachment.fileContent),
            // Para que el navegador inicie la descarga al hacer clic
            attributes: [
                new sap.m.ObjectAttribute({
                    title: "Descargar",
                    text: attachment.fileName,
                    active: true
                })
            ],
            // Deshabilitamos los botones de editar y eliminar por item
            enableEdit: false,
            enableDelete: false,
            visibleEdit: false,
            visibleDelete: false
        });
        //Para poder descargar el archivo (opcional)
        oItem.attachPress(function (oEvent) {
            oEvent.preventDefault();
            const sDataURI = this.getUrl();
            const sFileName = this.getFileName();
            // Crear un elemento <a> temporal en el DOM
            const a = document.createElement('a');
            a.href = sDataURI;
            a.download = sFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });

        return oItem;
    }
    /**
    * construye campos dinámicamente conforme al tipo de campo y longitud
    * @param {object} oController objeto de la vista donde se llama la función
    * @param {string} sContainerId id del contenedor donde se crearan los campos del form
    * @param {object} aCampos campos del formulario a crear
    * @public
    */
    /**
     * aCampos: array de objetos del nuevo modelo
     * {
     *   cust_etiquetaInput_en_US: "Nombre",
     *   cust_field: "NAME",
     *   cust_fieldType: "TXT" | "TXTA" | "DATE" | "SEL" | "EMAIL" | "ATT",
     *   cust_fieldLenght: "100",
     *   options?: [{ key, text }]
     * }
     */
    async function generarFormulario(oController, sContainerId, aCampos) {
        const oView = oController.getView();
        const oFormContainer = oView.byId(sContainerId);
        const oModel = oController.getOwnerComponent().getModel();
        if (!oFormContainer) return;
        oFormContainer.destroyFormElements();
        console.log(aCampos)
        for (const campo of aCampos) {
            try {
                const sLenguaje = Lenguaje.obtenerNombreConcatenado("cust_etiquetaInput");
                const sLabel = sLenguaje;
                const iLength = campo.cust_fieldLenght ? parseInt(campo.cust_fieldLenght, 10) : undefined;
    
                // Mapeo de propiedades de la API
                let sTipoControl;
                switch (String(campo.cust_fieldtype)) {
                    case "P": sTipoControl = "Select"; break;
                    case "F": sTipoControl = "DatePicker"; break;
                    case "I": sTipoControl = "Input"; break;
                    case "S": sTipoControl = "TextArea"; break;
                    case "A": sTipoControl = "Attachment"; break;
                    default: sTipoControl = "Input";
                }
    
                const oFormElement = new FormElement({
                    label: new Label({ text: sLabel })
                });
    
                let oControl;
    
                // Creamos el control basado en el tipo
                switch (sTipoControl) {
                    case "Select":
                        // 1. ESPERAMOS por el valor del backend
                        const oCustLabel = await service.readDataERP("/PicklistLabel", oModel, [new Filter("optionId", "EQ", campo.cust_value)]);
                        const sSelectValue = oCustLabel?.data?.results[0]?.label || ""; // Valor por defecto
    
                        oControl = new Input({
                            value: sSelectValue,
                            editable: false
                        });
                        break;
                    case "DatePicker":
                        oControl = new DatePicker({
                            value: campo.cust_value,
                            displayFormat: "dd/MM/yyyy",
                            valueFormat: "yyyy-MM-dd",
                            editable: false
                        });
                        break;
                    case "Input":
                        oControl = new Input({
                            value: campo.cust_value,
                            maxLength: iLength || 100,
                            editable: false
                        });
                        break;
                    case "Attachment":
                        oControl = new UploadCollection({
                            mode: sap.m.ListMode.SingleSelectMaster,
                            multiple: false,
                            uploadEnabled: false,
                            terminationEnabled: false
                        });
    
                        // 2. También usamos await aquí para consistencia
                        const oAdjuntoData = await service.readDataERP("/Attachment", oModel, [new Filter("attachmentId", "EQ", campo.cust_value)]);
                        if (oAdjuntoData.data.results.length) {
                            const oItem = this._viewAttachment(oAdjuntoData.data.results[0]); // Asumo que _viewAttachment existe en oController
                            oControl.addItem(oItem);
                        }
                        break;
                    default:
                         oControl = new Input({
                            value: campo.cust_value,
                            maxLength: iLength || 100,
                            editable: false
                        });
                }
    
                if (oControl) {
                    oControl.data("fieldName", campo.externalCode);
                    oFormElement.addField(oControl);
                    oFormContainer.addFormElement(oFormElement);
                }
    
            } catch (error) {
                console.error("Error al generar el campo dinámico:", campo.externalCode, error);
                // Puedes decidir si continuar con el siguiente campo o detenerte
            }
        }
    }
    /**
    * crea la cadena url para descargar o visualizar el adjunto
    * @param {object} sMimeType tipo de archivo
    * @param {object} sBase64Content codigo base64 del
    * @returns {string} url
    * @public
    */
    function _crearDataURI(sMimeType, sBase64Content) {
        return `data:${sMimeType};base64,${sBase64Content}`;
    }

    return {
        generarFormulario: generarFormulario,
        _viewAttachment: _viewAttachment,
        _crearDataURI: _crearDataURI
    };


});
