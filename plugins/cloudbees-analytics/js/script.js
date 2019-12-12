if (typeof onSetupWizardInitialized !== 'undefined' && onSetupWizardInitialized !== null) {
    onSetupWizardInitialized(function(wizard) {
        var jenkins = wizard.jenkins; // wizard-provided jenkins api

        wizard.addActions({
            // the expression cannot include .plugin-setup-wizard-container, it starts from the wizard element
            '.cb-registration-form button.install-home': function() {
                jenkins.get("/trackSetupWizard/licenseOptions");
            },
            '.registration-panel button#btn-com_cloudbees_jenkins_plugins_license_nectar_CJDRegistrar': function() {
                jenkins.get("/trackSetupWizard/evalOnlineLicenseForm");
            },
            '.registration-panel button#btn-com_cloudbees_jenkins_plugins_license_nectar_CJDOfflineRegistrar': function() {
                jenkins.get("/trackSetupWizard/offlineLicenseForm");
            },
            '.registration-panel button#btn-com_cloudbees_jenkins_plugins_license_ManualRegistrar': function() {
                jenkins.get("/trackSetupWizard/manualLicenseForm");
            },
            //'.install-custom': function() { // it collides with the default one :-/
            '.button-set .install-custom': function() {
                jenkins.get("/trackSetupWizard/pluginsSelectionForm");
            },
            //'.install-recommended': function() { // it collides with the default one :-/
            '.button-set .install-recommended': function() {
                jenkins.get("/trackSetupWizard/pluginsRecommendedSelected");
            },
            '.plugin-selector + .modal-footer .install-home': function() { // good one, isn't it?
                jenkins.get("/trackSetupWizard/pluginsInstallationOptions");
            },
            //'.skip-configure-instance': function() { // it collides with the default one :-/
            '.modal-footer .skip-configure-instance': function() {
                jenkins.get("/trackSetupWizard/skipConfigureInstance");
            }
        });
    });
}