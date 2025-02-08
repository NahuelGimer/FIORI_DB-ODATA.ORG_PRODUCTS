sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/model/json/JSONModel",
    "../utils/formatter/formatter"
], (Controller, MessageToast, MessageBox, Sorter, Filter, FilterOperator, FilterType,
    JSONModel, formatter) => {
    "use strict";

    return Controller.extend("project101.controller.View1", {
        formatter: formatter,
        onInit() {
            this.Odata = this.getView().getModel();
            var data = { Product: { ID: "", PRODUCTNAME: "", PRODUCTDESCRIPTION: "", PRODUCTVALUE: "", PRODUCTRATING: "" } }
            var oJSONData = {
                busy: false,
                order: 0
            },
                oModel = new JSONModel(oJSONData);
            var model = new JSONModel(data);
            this.getView().setModel(oModel, "appView");
            this.getView().setModel(model, "mProduct");

        },

        onSearch: function () {
            var oView = this.getView(),
                sValue = oView.byId("searchField").getValue().trim(), // Obtener y limpiar el valor de búsqueda
                oList = oView.byId("productsList"),
                oBinding = oList.getBinding("items"),
                aFilters = [];
        
            // Intentar convertir el valor a número (si es un ID numérico)
            var nValue = Number(sValue);
        
            // Si sValue no está vacío, aplicar filtros
            if (sValue) {
                // Filtrar por ID numérico si es válido
                if (!isNaN(nValue)) {
                    aFilters.push(new Filter("ID", FilterOperator.EQ, nValue));
                } else {
                    // Si no es numérico, buscar por ID como texto
                    aFilters.push(new Filter("ID", FilterOperator.Contains, sValue));
                }
            }
        
            // Aplicar los filtros a la lista
            oBinding.filter(aFilters, FilterType.Application);
        },

        onCreate: function () {
            var oView = this.getView();
            if (!this.openCreateDialog) {
                this.openCreateDialog = sap.ui.xmlfragment("IdFragment01", "project101.utils.fragments.CreateDialog", this);
                oView.addDependent(this.openCreateDialog);
            }
            this.getView().getModel("mProduct").setProperty("/Product", {});
            this.openCreateDialog.open();
        },

        onDeleteSpecific: function () {
            var oView = this.getView();
            if (!this.openDeleteSpecificDialog) {
                this.openDeleteSpecificDialog = sap.ui.xmlfragment("IdFragment02", "project101.utils.fragments.DeleteSpecificDialog", this);
                oView.addDependent(this.openDeleteSpecificDialog);
            }
            this.openDeleteSpecificDialog.open();
        },

        onEdit: function () {
            var oView = this.getView();
            if (!this.openEditDialog) {
                this.openEditDialog = sap.ui.xmlfragment("IdFragment03", "project101.utils.fragments.EditDialog", this);
                oView.addDependent(this.openEditDialog);
            }

            var oList = this.byId("productsList");
            var oView = this.getView();
            var oModel = oView.getModel("mProduct");
    var oSelectedItem = oList.getSelectedItem(); // Obtener el ítem seleccionado
    var oItemContext = oSelectedItem.getBindingContext(); // Obtener contexto del ítem seleccionado
    var oItemData = oItemContext.getObject(); // Obtener los datos del producto seleccionado
    var ProductData = {
        "ID": Number(oItemData.ID),  
        "Name": oItemData.Name,
        "Description": oItemData.Description,
        "Price": oItemData.Price,
        "Rating": oItemData.Rating
    };
    // Cargar los datos en el modelo para edición
    oModel.setProperty("/Product/ID", ProductData.ID);
    oModel.setProperty("/Product/PRODUCTNAME", ProductData.Name);
    oModel.setProperty("/Product/PRODUCTDESCRIPTION", ProductData.Description);
    oModel.setProperty("/Product/PRODUCTPRICE", ProductData.Price);
    oModel.setProperty("/Product/PRODUCTRATING", ProductData.Rating);
            this.openEditDialog.open();
        },



        openCreateProductDialog: function (oEvent) {
            var oModel = this.getView().getModel("mProduct");
            var ID = oModel.getProperty("/Product/ID");
            var ProductName = oModel.getProperty("/Product/PRODUCTNAME");
            var ProductDescription = oModel.getProperty("/Product/PRODUCTDESCRIPTION");
            var ProductPrice = oModel.getProperty("/Product/PRODUCTPRICE");
            var ProductRating = oModel.getProperty("/Product/PRODUCTRATING");
            var oList = this.byId("productsList");
            var oBinding = oList.getBinding("items");
            var aItems = oList.getItems();
            var aProductArray = [];
            var ProductData = {
                "ID": Number(ID),  // Convertir a número para asegurar comparación correcta
                "Name": ProductName,
                "Description": ProductDescription,
                "Price": ProductPrice,
                "Rating": ProductRating
            };

            // Recorrer la lista y almacenar los datos en la matriz
            for (var i = 0; i < aItems.length; i++) {
                var oItemContext = aItems[i].getBindingContext();
                if (oItemContext) {
                    var oItemData = oItemContext.getObject();
                    aProductArray.push({
                        ID: Number(oItemData.ID),  // Convertir a número para comparar correctamente
                        Name: oItemData.PRODUCTNAME,
                        Description: oItemData.PRODUCTDESCRIPTION,
                        Price: oItemData.PRODUCTPRICE,
                        Rating: oItemData.PRODUCTRATING
                    });
                }
            }

            // Verificar si el ID ya existe en la matriz
            var Exists = aProductArray.some(function (product) {
                return product.ID === ProductData.ID; // Comparación numérica
            });

            if (Exists) {
                console.log(this.getView().getModel("i18n").getProperty("IDExists"));
                sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("IDExists"));
                return; // Salir sin crear el producto
            } else {
                // Crear el nuevo producto si el ID no existe
                var oContext = oBinding.create(ProductData);

                // Seleccionar y enfocar el nuevo ítem creado
                oList.getItems().forEach(function (oItem) {
                    if (oItem.getBindingContext() === oContext) {
                        oItem.focus();
                        oItem.setSelected(true);
                    }
                });
            }

            

            this.openCreateDialog.close();
        }

        ,


        closeCreateProductDialog: function () {
            this.openCreateDialog.close();
        },

        openDeleteSpecificProductDialog: function () {
            var oView = this.getView(),
                oModel = oView.getModel("mProduct"),
                sID = oModel.getProperty("/Product/ID"), // ID seleccionado
                oList = this.byId("productsList"),
                oBinding = oList.getBinding("items"),
                oContextToDelete = null;
            var nID = Number(sID);
            oBinding.getContexts().forEach(function (oContext) {
                if (Number(oContext.getProperty("ID")) === nID) {
                    oContextToDelete = oContext;
                }
            });

            if (oContextToDelete) {
                oContextToDelete.delete().then(() => {
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("deleteSpecificSuccess") + " " + sID);
                }).catch((oError) => {
                    sap.m.MessageBox.error(this.getView().getModel("i18n").getProperty("deleteSpecificError01") + " " + sID + " " +
                        this.getView().getModel("i18n").getProperty("deleteSpecificError02"));
                });
            } else {
                sap.m.MessageToast.show(
                    this.getView().getModel("i18n").getProperty("deleteSpecificError01") +
                    " " + sID + " " +
                    this.getView().getModel("i18n").getProperty("deleteSpecificError02")
                );
            }

            if (nID >= 0 && nID < 9) {
                sap.m.MessageToast.show(
                    this.getView().getModel("i18n").getProperty("deleteSpecificError01") +
                    " " + sID + " " +
                    this.getView().getModel("i18n").getProperty("deleteSpecificError03")
                );
            }

            this.openDeleteSpecificDialog.close();
        }
        ,

        closeDeleteSpecificProductDialog: function () {
            this.openDeleteSpecificDialog.close();
        },

        openEditProductDialog: function (oEvent) {

            var oModel = this.getView().getModel("mProduct");
            var ID = oModel.getProperty("/Product/ID");
            var ProductName = oModel.getProperty("/Product/PRODUCTNAME");
            var ProductDescription = oModel.getProperty("/Product/PRODUCTDESCRIPTION");
            var ProductPrice = oModel.getProperty("/Product/PRODUCTPRICE");
            var ProductRating = oModel.getProperty("/Product/PRODUCTRATING");
            var oList = this.byId("productsList");
            var oBinding = oList.getBinding("items");
            var aItems = oList.getItems();
            var aProductArray = [];
            var ProductData = {
                "ID": Number(ID),  // Convertir a número para asegurar comparación correcta
                "Name": ProductName,
                "Description": ProductDescription,
                "Price": ProductPrice,
                "Rating": ProductRating
            };


            // Recorrer la lista y almacenar los datos en la matriz
            for (var i = 0; i < aItems.length; i++) {
                var oItemContext = aItems[i].getBindingContext();
                if (oItemContext) {
                    var oItemData = oItemContext.getObject();
                    aProductArray.push({
                        ID: Number(oItemData.ID),  // Convertir a número para comparar correctamente
                        Name: oItemData.PRODUCTNAME,
                        Description: oItemData.PRODUCTDESCRIPTION,
                        Price: oItemData.PRODUCTPRICE,
                        Rating: oItemData.PRODUCTRATING
                    });
                }
            }

            // Verificar si el ID ya existe en la matriz
            var Exists = aProductArray.some(function (product) {
                return product.ID === ProductData.ID; // Comparación numérica
            });

            if (Exists) {
                console.log(this.getView().getModel("i18n").getProperty("IDExists"));
                sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("IDExists"));
                return; // Salir sin crear el producto
            } else {
                // Crear el nuevo producto si el ID no existe
                var oContext = oBinding.create(ProductData);

                // Seleccionar y enfocar el nuevo ítem creado
                oList.getItems().forEach(function (oItem) {
                    if (oItem.getBindingContext() === oContext) {
                        oItem.focus();
                        oItem.setSelected(true);
                    }
                });
            }

            this.openEditDialog.close();
        }

        ,


        closeEditProductDialog: function () {
            this.openEditDialog.close();
        },

        onDelete: function () {
            var oContext,
                oProductsList = this.byId("productsList"),
                oSelected = oProductsList.getSelectedItem(),
                sID = oSelected.getBindingContext().getProperty("ID")

            if (oSelected) {
                oContext = oSelected.getBindingContext();
                oContext.delete()
                if (oSelected.getBindingContext().getProperty("ID") === sID) {
                    sap.m.MessageToast.show(
                        this.getView().getModel("i18n").getProperty("deleteSpecificError01") +
                        " " + sID + " " +
                        this.getView().getModel("i18n").getProperty("deleteSpecificError03")
                    );
                } else {
                    MessageToast.show(this.getView().getModel("i18n").getProperty("deleteSpecificSuccess") + " " + sID)
                }
            }

        },

        onRefresh: function () {
            var oBinding = this.byId("productsList").getBinding("items");

            oBinding.refresh();
            MessageToast.show(this.getView().getModel("i18n").getProperty("refreshData"));
        },


        onSort: function () {
            var oView = this.getView(),
                aStates = ["asc", "desc"],
                iOrder = oView.getModel("appView").getProperty("/order"),
                sOrder;

            // Ciclar entre los estados
            iOrder = (iOrder + 1) % aStates.length;
            sOrder = aStates[iOrder];

            oView.getModel("appView").setProperty("/order", iOrder);
            oView.byId("productsList").getBinding("items")
                .sort(new Sorter("ID", sOrder === "desc", false));
        },

        onSortAZ: function () {
            var oView = this.getView(),
                aStates = ["asc", "desc"],
                iOrder = oView.getModel("appView").getProperty("/order"),
                sOrder;

            // Cycle between the states
            iOrder = (iOrder + 1) % aStates.length;
            sOrder = aStates[iOrder];

            oView.getModel("appView").setProperty("/order", iOrder);
            oView.byId("productsList").getBinding("items")
                .sort(sOrder && new Sorter("Name", sOrder === "desc"));

        },


    });
});