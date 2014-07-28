function ValidatorValidate(val, validationGroup, event) {
    val.isvalid = true;
    if ((typeof (val.enabled) == "undefined" || val.enabled != false) && IsValidationGroupMatch(val, validationGroup)) {
        if (typeof (val.evaluationfunction) == "function") {
            val.isvalid = val.evaluationfunction(val);
            var ctrl = jQuery('#' + val.controltovalidate);
            if (ctrl.hasClass('required-entry')) {
                if (TotalValidState(ctrl[0])) {
                    ctrl.removeClass('validation-failed')
                } else {
                    ctrl.addClass('validation-failed')
                }
            }
            ctrl.attr('previous-validator', val.isvalid);
            if (!val.isvalid && Page_InvalidControlToBeFocused == null && typeof (val.focusOnError) == "string" && val.focusOnError == "t") {
                ValidatorSetFocus(val, event);
            }
        }
    }
    else {
        var control = jQuery('#' + val.controltovalidate);
        control.removeClass('validation-failed');
    }
    ValidatorUpdateDisplay(val)
}
var scrollToOriginal = window.scrollTo;
window.scrollTo = function (x, y) {
    if (x != y != 0) {
        scrollToOriginal(x, y)
    }
};

function TotalValidState(ctrl) {
    var isvalid = true;
    for (var i = 0; i < ctrl.Validators.length; i++) {
        if (!ctrl.Validators[i].isvalid) {
            isvalid = false
        }
    }
    return isvalid
}
function validateEmailLength(sender, args) {

    var email = $j(sender).parents('.validate-form').find('.validate-email').val();

    if (email.length < 256) {
        args.IsValid = true;
    }
    else {
        args.IsValid = false;
    }
};