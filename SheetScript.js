//Sorry for the bad code and documentation
// ~Bryce Clark

/**
 * Do not change these!
 */
var scriptCache = CacheService.getScriptCache();
var staticVars = JSON.parse(PropertiesService.getScriptProperties().getProperty("static"));

/**
 * Determining what to do.
 * @param {object} e - Contains all the information about the edit
 */
function onEdit(e) {
    var lock = LockService.getScriptLock();
    e.rangeLength = e.range.getValues().length; //Extra property for later use
    if (e.rangeLength == 1) {
        var newE = checkProblems(e);
        if (newE) {
            signInOut(newE);
        }
    }
    lock.releaseLock();
}

/**
 * Signs the person in if they aren't already signed in.
 * If already signed in, they are signed out.
 * @param {Object} e - Contains all the information about the edit
 */
function signInOut(e) {
    var clearRow = false;
    if (e.value) {
        e.location = scriptCache.get(e.value);
        var rA1 = e.range.getA1Notation();
        if (e.location) { //Enter this block if signed in
            e.eIn = e.range.offset(0, staticVars.timeOffset.rIn);
            e.eOut = e.range.offset(0, staticVars.timeOffset.rOut);
            var sheet = e.source.getActiveSheet();
            clearRow = true;
            sheet.getRange(e.location).offset(0, 3).setValue(getTime());
            sheet.setActiveSelection(rA1);
        }
        else { //Enter this block if not signed in
            e.range.offset(0, 2).setValue(getTime());
            if (staticVars.signInExpiration) {
                scriptCache.put(e.value, rA1, staticVars.signInExpiration);
            }
            else {
                scriptCache.put(e.value, rA1);
            }
        }
    }
    else { //Determined that the value was erased, so delete the data and clear the row
        clearRow = true;
    }

    if (clearRow) {
        clearIt(e);
    }
}

/**
 * Check for problems in the code
 * @param {Object} e - Contains all the information about the edit
 * @returns {Object} e - Edit information fixed, etc.
 */
function checkProblems(e) {
    if (!e.value) {
        clearIt(e);
        return false;
    }
    else {
        var idRange = e.range.getSheet().getRange(e.range.getRow(), e.value);
        if (staticVars.validColumns.indexOf(e.range.getLastColumn()) == -1) { //Checking if it's in the right column
            e.range.setActiveSelection(idRange);
        }
        return e;
    }
}

/**
 * Returns the current time
 * @returns {string}
 */
function getTime() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}


function clearIt(e) {
    if (e.location || scriptCache.get(e.value)) {
        scriptCache.remove(e.value);
        e.eIn.setValue("");
        e.eOut.setValue("");
    }
    e.range.setValue("");
}