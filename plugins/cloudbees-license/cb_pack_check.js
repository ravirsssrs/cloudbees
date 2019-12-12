(function(){

    function PathTokens(path) {
        this.pathTokens = path.split('/');
        this.pathTokens = this.pathTokens.filter(function (token) {
            return (token !== '');
        });
    }
    PathTokens.prototype.endsWith = function (tokens) {
        if (this.pathTokens.length < tokens.length) {
            return false;
        }
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[tokens.length - 1 - i] !== this.pathTokens[this.pathTokens.length - 1 - i]) {
                return false;
            }
        }
        return true;
    }
    PathTokens.prototype.contains = function (token) {
        for (var i = 0; i < this.pathTokens.length; i++) {
            if (this.pathTokens[i] === token) {
                return true;
            }
        }
        return false;
    }
    
    function getJenkinsRootURL() {
        return Element.getElementsBySelector(document, '#cb_pack_check_js')[0].getAttribute('data-jenkins-root');
    }
    
    function addCloudBeesLicensingCSS() {
        var head = Element.getElementsBySelector(document, 'head')[0];
        var cbsLicenseStyle = Element.getElementsBySelector(head, '#cbsLicenseStyle');
        if (cbsLicenseStyle.length === 0) {
            var cbsLicenseStyleLink = new Element('link', { 
                'id': 'cbsLicenseStyle',
                'rel': 'stylesheet', 'type': 'text/css',
                'href': head.getAttribute('resURL') + '/plugin/cloudbees-license/style.css' 
            });
            Element.insert(head, {'bottom': cbsLicenseStyleLink});
        }
    }

    var pathTokens = new PathTokens(window.location.pathname.toLowerCase());
    if (pathTokens.contains('pluginmanager')) {
        
        function checkPluginEntitlements() {
            addCloudBeesLicensingCSS();
            Element.observe(document, 'dom:loaded', function(){
                var pluginsTable = Element.getElementsBySelector(document, 'table#plugins')[0];
                var plugins = Element.getElementsBySelector(pluginsTable, '.plugin');

                pluginsTable.addClassName("je-registration");                
                
                function getExcerpt(plugin) {
                    var excerpt = Element.getElementsBySelector(plugin, '.excerpt');
                    if (excerpt && excerpt.length === 1) {
                        return excerpt[0];
                    } else {
                        return undefined;
                    }
                }
                function getEncodedEntitlementRequirements(excerpt) {
                    var cblicence = Element.getElementsBySelector(excerpt, '.cblicence');
                    if (cblicence && cblicence.length === 1) {
                        return cblicence[0].getAttribute('data-cblicence');
                    } else {
                        return undefined;
                    }
                }
                function handleFailedEntitlementCheck(plugin, checkRsp) {
                    plugin.addClassName("cb-pack-license-fail");

                    var input = Element.getElementsBySelector(plugin, 'input');
                    if (input && input.length > 0) {
                        input[0].setAttribute('disabled', 'true');
                    }
                    
                    // Add an alert to the plugin description "excerpt", entitlement requirements etc
                    var alert = new Element('div', { 'class': 'alert alert-warning'});
                    var excerpt = getExcerpt(plugin);
                    Element.insert(excerpt, {bottom: alert});

                    if (checkRsp.reason === "bad-license-version") {
                        // licence version is too old
                        Element.insert(alert, {bottom: new Element('div').update(
                                "Your current license does not permit you to install and use this plugin. " +
                                "Please see <a href=\"https://www.cloudbees.com/plugin-licensing-requirements\">this page</a> for more details.")});
                    }
                    else {
	                    // Add the pack entitlement requirements to the alert.
	                    var entitlementReqs = checkRsp['entitlement-reqs'];
	                    
	                    Element.insert(alert, {bottom: new Element('div').update(
	                        "Your current license does not permit you to install and use this plugin. " +
	                        "It must contain a license for one of the following pack options."
	                    )});
	                    
	                    var requirementsList = new Element('ul');
	                    Element.insert(alert, {bottom: requirementsList});
	                    
	                    function addLicensingOptionGroup(packInfoGroup) {
	                        var requirementList = new Element('li');
	                        
	                        for (var i = 0; i < packInfoGroup.length; i++) {
	                            var packInfo = packInfoGroup[i];
	                            var packInfoText = new Element('span', {'class': 'pack-name red code', 'title': packInfo.oid}).update(packInfo.name);
	                            
	                            Element.insert(requirementList, {bottom: packInfoText});
	                            if (i < packInfoGroup.length - 1) {
	                                Element.insert(requirementList, {bottom: new Element('span').update('and')});
	                            }
	                        }
	
	                        Element.insert(requirementsList, {bottom: requirementList});
	                    }
	                    
	                    for (var i = 0; i < entitlementReqs.length; i++) {
	                        var packInfoGroup = entitlementReqs[i];
	                        
	                        addLicensingOptionGroup(packInfoGroup);
	                    }
                    }
                }
                function checkPackEntitlements(plugin, encodedEntitlementReqs) {
                    var url = getJenkinsRootURL() + "/license/checkPackEntitlements?entitlements=" + encodeURIComponent(encodedEntitlementReqs);

                    new Ajax.Request(url, {
                        onSuccess: function (rsp) {
                            var checkRsp = JSON.parse(rsp.responseText);
                            if (checkRsp.status !== 'ok') {
                                handleFailedEntitlementCheck(plugin, checkRsp);
                            }
                        }
                    });
                }

                for (var i = 0; i < plugins.length; i++) {
                    var plugin = plugins[i];
                    
                    var excerpt = getExcerpt(plugin);
                    if (excerpt) {
                        var encodedEntitlementReqs  = getEncodedEntitlementRequirements(excerpt);
                        if (encodedEntitlementReqs) {
                            checkPackEntitlements(plugin, encodedEntitlementReqs);
                        }
                    }
                }
            });
        }
        
        if (pathTokens.endsWith(['pluginmanager'])) {
            // Plugin "Updates" page
            checkPluginEntitlements();
        } else if (pathTokens.endsWith(['pluginmanager', 'available'])) {
            // Plugins "Available" page            
            checkPluginEntitlements();
        } else if (pathTokens.endsWith(['pluginmanager', 'installed'])) {
            // Plugins "Installed" page            
            checkPluginEntitlements();
        }
    } else {
        // Not one of the Plugin Manager pages
    }
    
    // Some in-browser tests. Be sure to comment this out.
//    function test() {
//        var pathTokens;
//        
//        // contains
//        pathTokens = new PathTokens('/a/b/c');
//        console.assert(pathTokens.contains('a'), 'pathTokens.endsWith test failed');
//        console.assert(pathTokens.contains('c'), 'pathTokens.endsWith test failed');
//        console.assert(!pathTokens.contains('x'), 'pathTokens.endsWith test failed');
//        
//        // endsWith
//        pathTokens = new PathTokens('');
//        console.assert(!pathTokens.endsWith(['']), 'pathTokens.endsWith test failed');
//        console.assert(pathTokens.endsWith([]), 'pathTokens.endsWith test failed');
//        pathTokens = new PathTokens('/a/b/c');
//        console.assert(pathTokens.endsWith(['c']), 'pathTokens.endsWith test failed');
//        console.assert(pathTokens.endsWith(['b', 'c']), 'pathTokens.endsWith test failed');
//        console.assert(pathTokens.endsWith(['a', 'b', 'c']), 'pathTokens.endsWith test failed');
//        console.assert(!pathTokens.endsWith(['a', 'b']), 'pathTokens.endsWith test failed');
//        console.assert(!pathTokens.endsWith(['a']), 'pathTokens.endsWith test failed');
//    }
//    test();
}());