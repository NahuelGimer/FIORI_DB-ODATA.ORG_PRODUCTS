sap.ui.define([], function () {
    "use strict";
    return {
        statusPrice: function (Price) {
            var res = "";
            if (Price > 100) {
                res = Price + " Alto";
            }
            else if (Price > 10 && Price < 100) {
                res = Price + " Moderado";
            }
            else {
                res = Price + " Bajo";
            }
            return (res);
        },
        statusClass: function (Price) {
            var res = "";
            if (Price > 100) {
                res = "Error";
            }
            else if (Price > 10 && Price < 100) {
                res = "Warning";
            }
            else {
                res = "Success";
            }
            return (res);
        }
    }
})
