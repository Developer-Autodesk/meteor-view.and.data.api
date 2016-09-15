
import '../../public/extensions/Autodesk.ADN.Viewing.Extension.Basic/Autodesk.ADN.Viewing.Extension.Basic.js';
import '../../public/extensions/Autodesk.ADN.Viewing.Extension.DockingPanel/Autodesk.ADN.Viewing.Extension.DockingPanel.js';
import '../../public/extensions/Autodesk.ADN.Viewing.Extension.Workshop/Autodesk.ADN.Viewing.Extension.Workshop.js';


Template.viewer.onCreated(function(){

    //console.log('viewer template created.')
    Meteor.call('getAccessToken', function (error, result) {
        if (error) {
            console.log(error);
        }
        else {
            var token = result.access_token;
            console.log(token);

            //initialize the viewer
            initViewer(token);

        }

    });

});



var initViewer = function (token) {

    var defaultUrn = getDefaultUrn();

    if (defaultUrn.indexOf('urn:') !== 0)
        defaultUrn = 'urn:' + defaultUrn;

    function getToken(){
        //sync call
        var token = Meteor.call('getAccessToken');
        console.log(token);
        return token.access_token;
    }

    function initializeViewer(containerId, documentId, role) {
        var viewerContainer = document.getElementById(containerId);
        var viewer = new Autodesk.Viewing.Private.GuiViewer3D(
            viewerContainer);
        viewer.start();

        Autodesk.Viewing.Document.load(documentId,
            function (document) {
                var rootItem = document.getRootItem();
                var geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(
                    rootItem,
                    { 'type': 'geometry', 'role': role },
                    true);

                viewer.load(document.getViewablePath(geometryItems[0]));
            },

            // onErrorCallback
            function (msg) {
                console.log("Error loading document: " + msg);
            }
        );

        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function(){

            console.log('GEOMETRY_LOADED_EVENT');
            
            viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Basic');
            
            viewer.loadExtension('Autodesk.ADN.Viewing.Extension.DockingPanel');

            viewer.loadExtension('Autodesk.ADN.Viewing.Extension.Workshop');
            
        });
    }

    function initialize() {
        var options = {
            env: "AutodeskProduction",
            //getAccessToken: getToken,
            //refreshToken: getToken
            accessToken : token
        };

        Autodesk.Viewing.Initializer(options, function () {
            initializeViewer('viewer', defaultUrn, '3d');
        });
    }

    //call
    initialize();


}