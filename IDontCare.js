/**
 * Change these for your situation
 */
var validColumns = ["1", "7"]; //Columns valid for entering an ID number

/**
 * Determining what to do.
 * @param {object} e - Contains all the information about the edit
 */
function onEdit(e) {
    e.rangeLength = e.range.getValues().length; //Extra property for later use
    if (e.rangeLength == 1) {
        signInOut(e);
    }
    else {
        e.range.clear();
    }
}

/**
 * Signs the person in if they aren't already signed in.
 * If already signed in, they are signed out.
 * @param {Object} e - Contains all the information about the edit
 */
function signInOut(e) {
    var signedIn = false;
    var sheetInfo = JSON.parse(PropertiesService.getScriptProperties().getProperty(e.range.getSheet().getSheetName()));
    e.rA1 = e.range.getA1Notation();
    if (e.value && sheetInfo[e.rA1]) {
        signedIn = true;
    }
    else if(e.value) {
        e.range.offset(0, 2).setValue(new Date());

    }

    if (!signedIn) {
        e.range.clear();
    }
}

/**
 * 
 *      
 * @returns {string}
 */
function getDateTime() {
    var date = new Date();
    return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}