sap.ui.define(
  [
    "sap/ui/core/util/MockServer",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/date/UI5Date",
  ],
  function (MockServer, Log, jQuery, UI5Date) {
    "use strict";

    return {
      //inizializzo il mockserver
      init: function () {
        // create
        var oMockServer = new MockServer({
          rootUri: "/",
        });

        // simulo i metadata del mockdata
        oMockServer.simulate("../localService/metadata.xml", {
          sMockdataBaseUrl: "../localService/mockdata",
          bGenerateMissingMockData: true,
        });

        //gestione di importazione di una funziona
        var aRequests = oMockServer.getRequests();
        aRequests.push({
          method: "GET",
          path: new RegExp("FindUpcomingMeetups(.*)"),
          response: function (oXhr) {
            Log.debug("Incoming request for FindUpcomingMeetups");
            var today = UI5Date.getInstance();
            //today.toUTCString(0);
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            jQuery.ajax({
              url:
                "/Meetups?$filter=EventDate ge " +
                "/Date(" +
                today.getTime() +
                ")/",
              dataType: "json",
              async: false,
              success: function (oData) {
                oXhr.respondJSON(200, {}, JSON.stringify(oData));
              },
            });
            return true;
          },
        });
        oMockServer.setRequests(aRequests);

        //gestione custom URL
        var fnCustom = function (oEvent) {
          var oXhr = oEvent.getParameter("oXhr");
          if (oXhr && oXhr.url.indexOf("first") > -1) {
            oEvent.getParameter("oFilteredData").results.splice(3, 100);
          }
        };
        oMockServer.attachAfter("GET", fnCustom, "Meetups");

        // start
        oMockServer.start();

        Log.info("Running the app with mock data");
      },
    };
  }
);
