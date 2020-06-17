//Constant variables are declared here.
const config = {
    "baseUrl": (process.env.NODE_ENV == 'production')? "https://whichdocs.com" : "http://localhost:5046/",
}

const statusCode = {
    "ok"            : 200,
    "error"         : 401,
    "failed"        : 1002,
    "unauth"        : 402,
    "internalError" : 1004
}

const messages = {
    "registerationSuccess"      :"You have been successfully register, Wait for Admin to activate Your Account",
    "dataRetrievedSuccess"      : "Data retrieved successfully",    
    "loginSuccess"              : "Logged in successfully",
    "signupSuccess"             : "Your account has been registered successfully.",
    "errorRetreivingData"       : "Error in retrieving data",
    "noDataFound"               : "No Data Found",
    "logoutSuccess"             : "Successfully logout",
    "successInChangePassword"   : "Password changed successfully",
    "forgotPasswordSuccess"     : "Password sent successfully, please check your mail",
    "userDeleteSuccess"         : "User deleted successfully",
    "userAddedSuccess"          : "User added successfully",
    "userUpdatedSuccess"        : "User updated successfully",
    "authenticationFailed"      : "Authentication failed!",
    "logoutSuccess"             : "Logout successfully",
    "requestNotProcessed"       : "Request could not be processed. Please try again"
}
const validateMsg = {
    "emailAlreadyExist"     : "Email Id already exist, try with another",
    "titleAlreadyExist"     : "Title already exist, try with another",
    "usernameAlreadyExist"  : "Username already exist, try with another",
    "emailRequired"         : "Email is required",
    "firstnameRequired"     : "First name is required",
    "passwordRequired"      : "Password is required",
    "invalidEmail"          : "Invalid Email Given",
    "invalidEmailOrPassword": "Invalid email or password",
    "internalError"         : "Internal error",
    "requiredFieldsMissing" : "Required fields missing",
    "emailNotExist"         : "Email doesn't exist",
    "userNotFound"          : "User not found",
    "passwordNotMatch"      : "New password should not be same as old password",
}

const emailSubjects = {
    "verify_email"  : "Welcome to the Which Docs - Verify your email address ",
    "facebookLogin" : "Welcome to the Which Docs",
    "forgotPassword": "Which Docs - Forgot password"
}

/*var degree    = [
                    '',
                    'M.D.',
                    'D.O.',
                    'D.D.S',
                    'D.C.',
                    'O.D.',
                    'ARNP',
                    'RPT',
                    'LMT',
                    'PA-C',
                    'R.N.',
                    'J.D.',
                    'Administrator',
                    'Office Manager',
                    'Site Manager',
                    'Equipment Rep',
                    'DME Provider'
                ];*/

var states1d = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};

const apikeys = {
//    "timezone_apikey"  : "AIzaSyB44I7G32bBpjSj2WY_TjhUrx3vNuGcPos",
    "timezone_apikey"  : "AIzaSyADlEReMz1ShFM2PWlpUFo4H47hLfbtLEQ",
};

var obj = {
    config          : config,
   // degree          : degree,
    statusCode      : statusCode,
    states1d        : states1d,
    messages        : messages,
    validateMsg     : validateMsg,
    emailSubjects   : emailSubjects,
    apikeys         : apikeys
};
module.exports = obj;
const passExpDuration = 90; // days