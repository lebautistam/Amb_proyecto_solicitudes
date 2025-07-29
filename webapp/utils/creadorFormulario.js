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
    "../utils/Lenguaje"
], function (FormElement, Label, Input, DatePicker, TextArea, Select, Item, UploadCollection, MessageToast, ListMode, Lenguaje) {
    "use strict";

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
                    oControl = new sap.m.UploadCollection({
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
            }

            // if (typeof oControl.setRequired === "function") {
            //     oControl.setRequired(!!campo.cust_mandatory);
            // }

            oFormElement.addField(oControl);
            oFormContainer.addFormElement(oFormElement);
        });
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
        validarFormulario: validarFormulario
    };


});
