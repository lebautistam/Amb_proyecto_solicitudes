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
    "../utils/Lenguaje",
    "../service/service",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (FormElement, Label, Input, DatePicker, TextArea, Select, Item, UploadCollection, MessageToast, ListMode, Lenguaje, service, Filter, FilterOperator) {
    "use strict";
    function _viewAttachment(attachment, oController) {
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
        oItem.attachPress(function (oEvent) {
            // console.log(this.getUrl())
            // sap.m.URLHelper.redirect(this.getUrl(), true);
            oEvent.preventDefault();

            const sDataURI = this.getUrl(); // Obtiene la Data URI del item
            const sFileName = this.getFileName(); // Obtiene el nombre de archivo del item
            // Crear un elemento <a> temporal en el DOM
            const a = document.createElement('a');
            a.href = sDataURI;
            a.download = sFileName; // Esto le dice al navegador que lo descargue con este nombre
            document.body.appendChild(a); // Añadirlo al DOM (necesario para Firefox)
            a.click(); // Simular un clic
            document.body.removeChild(a);
        });

        return oItem;
    }
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
    function generarFormulario(oController, sContainerId, aCampos) {
        const oView = oController.getView();
        const oFormContainer = oView.byId(sContainerId);
        const oModel = oController.getOwnerComponent().getModel();
        if (!oFormContainer) return;
        oFormContainer.destroyFormElements();

        aCampos.forEach(campo => {

            const sLenguaje = Lenguaje.obtenerNombreConcatenado("cust_etiquetaInput");
            const sLabel = sLenguaje;
            console.log(sLabel)
            const iLength = campo.cust_fieldLenght ? parseInt(campo.cust_fieldLenght, 10) : undefined;
            // Mapeo propiedades de la api
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

            switch (sTipoControl) {

                case "Select":
                    oControl = new Select({
                        selectedKey: campo.cust_value
                    });
                    // Temporal mientras llenan datos en api
                    // (campo.options || []).forEach(opt => {
                    //     oControl.addItem(new Item({
                    //         key: opt.key,
                    //         text: opt.text
                    //     }));
                    // });
                    break;

                case "DatePicker":
                    oControl = new DatePicker({
                        value: campo.cust_value,
                        displayFormat: "dd/MM/yyyy",
                        valueFormat: "yyyy-MM-dd"
                    });
                    break;

                case "Input":
                    oControl = new Input({
                        value: campo.cust_value,
                        maxLength: iLength || 100
                    });
                    break;

                case "TextArea":
                    oControl = new TextArea({
                        value: campo.cust_value,
                        rows: 3
                    });
                    break;


                case "Attachment":
                    oControl = new UploadCollection({
                        mode: sap.m.ListMode.SingleSelectMaster,
                        multiple: false,
                        uploadEnabled: false,      // Deshabilita el botón de carga
                        terminationEnabled: false,
                        instantUpload: false,
                        showSeparators: "All",
                        // Función que se dispara cuando se adjunta un archivo
                        change: oController.onDetectorAdjunto.bind(oController)
                    });
                    break;
            }
            //Adición de identificador al campo
            oControl.data("fieldName", campo.externalCode);

            // oControl.setEditable(false);
            //Controles de editable y mandatorio según los campos y cust_mandatory
            if (sTipoControl !== "Attachment") {
                oControl.setEditable(false);
            } else {
                oControl.setUploadEnabled(false);
                const aFilter = [
                    new Filter("attachmentId", FilterOperator.EQ, campo.cust_value)
                ];
                service.readDataERP("/Attachment", oModel, aFilter)
                    .then(data => {
                        if (data.data.results.length) {
                            const oItem = this._viewAttachment(data.data.results[0], oController);
                            oControl.addItem(oItem);
                        }
                    })
                    .catch(error => {
                        console.error("Error: ", error.message);
                    });
                // const oAttachment = Promise.all(oResult);
                // console.log(oAttachment)
            }

            // if (typeof oControl.setRequired === "function") {
            //     oControl.setRequired(!!campo.cust_mandatory);
            // }

            oFormElement.addField(oControl);
            oFormContainer.addFormElement(oFormElement);
        });
    }

    function _crearDataURI(sMimeType, sBase64Content) {
        return `data:${sMimeType};base64,${sBase64Content}`;
    }

    function obtenerDatosFormulario(oView, sContainerId, aCampos) {
        const oFormContainer = oView.byId(sContainerId);
        if (!oFormContainer) return {};

        const resultado = {};

        aCampos.forEach(campo => {
            const control = encontrarControlPorCampo(oFormContainer, campo.externalCode);
            if (!control) return;

            let valor;
            switch (campo.cust_fieldType) {
                case "P": valor = control.getSelectedKey(); break;
                case "A": break;
                default: valor = control.getValue(); break;
            }

            resultado[campo.externalCode] = valor;
        });

        return resultado;
    }

    function encontrarControlPorCampo(oFormContainer, fieldName) {
        const aFormElements = oFormContainer.getFormElements();
        for (let fe of aFormElements) {
            for (let control of fe.getFields()) {
                if (control.data("fieldName") === fieldName) {
                    return control;
                }
            }
        }
        return null;
    }

    /**
   * Valida que los campos obligatorios de un formulario dinámico no estén vacíos.
   * @param {sap.ui.core.mvc.View} oView La vista actual.
   * @param {String} sContainerId El ID del contenedor del formulario.
   * @param {Array} aCampos El array con las definiciones de los campos.
   * @param {sap.ui.core.mvc.Controller} oController El contexto del controlador para casos especiales (adjuntos).
   * @returns {Boolean} 'true' si el formulario es válido, 'false' si no.
   */
    function validarFormulario(oView, sContainerId, aCampos, oController) {
        let bFormularioValido = true;
        const oFormContainer = oView.byId(sContainerId);

        aCampos.forEach(campo => {
            const control = encontrarControlPorCampo(oFormContainer, campo.externalCode);
            if (control) {
                control.setValueState(sap.ui.core.ValueState.None);
            }

            if (!!campo.cust_mandatory) {
                let bCampoValido = false;

                if (campo.cust_fieldType === "A") {
                    if (oController._contenidoArchivo) {
                        bCampoValido = true;
                    }
                } else {
                    if (control) {
                        let valor;
                        switch (campo.cust_fieldType) {
                            case "P": // Select
                                valor = control.getSelectedKey();
                                break;
                            default: // Input, DatePicker, TextArea
                                valor = control.getValue();
                                break;
                        }
                        if (valor) {
                            bCampoValido = true;
                        }
                    }
                }

                if (!bCampoValido) {
                    bFormularioValido = false;
                    if (control) {
                        control.setValueState(sap.ui.core.ValueState.Error);
                    }
                }
            }
        });

        return bFormularioValido;
    }

    return {
        generarFormulario: generarFormulario,
        obtenerDatosFormulario: obtenerDatosFormulario,
        validarFormulario: validarFormulario,
        _viewAttachment: _viewAttachment,
        _crearDataURI: _crearDataURI
    };


});
