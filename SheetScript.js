//Sorry for the bad code and documentation
// ~Bryce Clark

/**
 * Do not change these!
 * If you do, you'll be cursed! Oooooooo, super spooky!
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
        e.eIn = e.range.offset(0, staticVars.timeOffset.rIn);
        e.eOut = e.range.offset(0, staticVars.timeOffset.rOut);
        e.location = scriptCache.get(e.value);
        e.sheet = e.range.getSheet();
        var newE = checkProblems(e);
        if (newE) { //If it doesn't return "false"
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
    if (typeof e.value === "string" && e.value) {
        var rA1 = e.range.getA1Notation();
        if (e.location) { //Enter this block if signed in
            clearRow = true;
            e.sheet.getRange(e.location).offset(0, 3).setValue(getTime());
            e.sheet.setActiveSelection(rA1);
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
 * @returns {Object|Boolean} e - Edit information fixed, etc.
 */
function checkProblems(e) {
    var idRange = e.sheet.getRange(e.range.getRow(), 1);
    if (staticVars.validColumns.indexOf(e.range.getLastColumn()) == -1) { //Checking if it's in the right column
        e.sheet.setActiveSelection(idRange);
        e.range = e.sheet.getActiveRange();
    }
    if (typeof e.value !== "string") { //Will be an object if the current value is blank
        clearIt(e, true);
        return false;
    }
    return e;
}

/**
 * Returns the current time
 * @returns {string}
 */
function getTime() {
    var date = new Date();
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

/**
 * Clears the specified range of data
 * @param {Object} e - Edit information
 * @param {Boolean} [del=false] - To delete the old value or not to delete? That is the question
 */
function clearIt(e, del) {
    del = del || false;
    if (del) {
        scriptCache.remove(e.oldValue);
    }
    else if (e.location || scriptCache.get(e.value)) {
        scriptCache.remove(e.value);
    }
    e.eIn.setValue("");
    e.eOut.setValue("");
    e.range.setValue("");
}