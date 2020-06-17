var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
//var baseUrl = "http://localhost:6020";
var mainUrl = location.protocol + '//' + location.hostname + ':' + location.port;

// var homePageVideoMP4Link = baseUrl + "/assets/video/Welcome-video.mp4";
var homePageVideoMP4Link = baseUrl + "/assets/video/Welcome-video-2.mp4";
var homePageVideoOGGLink = baseUrl + "/assets/video/Welcome-video.ogg";

var webservices = {

    "authenticates": baseUrl + "/api/userLogin",
    "register": baseUrl + "/api/userRegister",
    "forgot_password": baseUrl + "/api/forgotPassword",
    "existMember": baseUrl + "/api/existMember",
    "listAvailableDoctor": baseUrl + "/api/getAvailableDoctors",
    "logout": baseUrl + "/api/userLogOut",
    "getSpeciality": baseUrl + "/api/getSpeciality",
    "getServices": baseUrl + "/api/getServices",
    "updateSpeciality": baseUrl + "/api/updateSpeciality",
    "updateService": baseUrl + "/api/updateService",

    "UpdateContactDetails": baseUrl + "/api/UpdateContactDetails",
    "insertOrUpdateUsernetworks": baseUrl + "/api/insertOrUpdateUsernetworks",
    "getUserProfile": baseUrl + "/api/getUserProfile",

    "getUserList": baseUrl + "/api/getUserList",
    "getpatient": baseUrl + "/api/getPatient",
    "getContactDetails": baseUrl + "/api/getContactDetails",
    "getDoctors": baseUrl + "/api/getDoctors",
    "getDoctorsReg": baseUrl + "/api/getDoctorsReg",
    "getDoctorsNonReg": baseUrl + "/api/getDoctorsNonReg",
    "getDoctorBySpeciality": baseUrl + "/api/getDoctorBySpeciality",

    "addPreference": baseUrl + "/api/addPreference",
    'getPreference': baseUrl + "/api/getPreference",
    'getPreferenceBySpecialty': baseUrl + "/api/getPreferenceBySpecialty",
    'updatePassword': baseUrl + "/api/updatePassword",
    'updateNetwork': baseUrl + "/api/updateNetwork",

    //Insurance network
    'addNetwork': baseUrl + '/api/addNetwork',
    'deleteNetwork': baseUrl + '/api/deleteNetwork',
    'getNetworkList': baseUrl + '/api/getNetworkList',
    // 'getNetwork': baseUrl + '/api/getNetwork',
    'getNetwork': baseUrl + '/api/getNetwork/:id',
    'getSelectedNetwork': baseUrl + '/api/getSelectedNetwork/:id',
    'getUserSpecificNetworkData': baseUrl + '/api/getUserSpecificNetworkData/:id',
    'getUserNetwork': baseUrl + '/api/getUserNetwork/:id',
    'migrateData': baseUrl + '/api/migrateData',
    //user
    "addUser": baseUrl + "/users/add",
    "userList": baseUrl + "/users/list",
    "findOneUser": baseUrl + "/users/userOne",
    "bulkUpdateUser": baseUrl + "/users/bulkUpdate",
    "update": baseUrl + "/users/update",

    //Doctors
    "getUserList": baseUrl + "/api/getUserList",
    "addDoctor": baseUrl + "/api/addUser",
    "registerDoctor": baseUrl + "/api/registerUser",
    "getSpecialty": baseUrl + "/api/getSpeciality",
    "deleteDoctor": baseUrl + "/api/deleteUser",
    "updateUser": baseUrl + "/api/updateUser",
    "getById": baseUrl + "/api/getById/:id",
    "getNonDocById": baseUrl + "/api/getNonDocById/:id",
    "updateStatus": baseUrl + "/api/updateStatus",
    "getDoctorsList": baseUrl + "/api/getDoctorsList",
    "getUnregisteredDoctorsList": baseUrl + "/api/getUnregisteredDoctorsList",
    "getServiceList": baseUrl + "/api/getServiceList",

    //Patients

    "getPatientList": baseUrl + "/api/getPatientList",
    "deletePatient": baseUrl + "/api/deletePatient",
    "updatePatient": baseUrl + "/api/updatePatient",
    "addPatient": baseUrl + "/api/addPatient",
    "getPatientById": baseUrl + "/api/getPatientById/:id",
    "updatePatientStatus": baseUrl + "/api/updatePatientStatus",
    "getReferralHistory": baseUrl + "/api/getReferralHistory"
}

var googleConstants = {
    "google_client_id": "54372597586-09u72notkj8g82vl3jt77h7cbutvr7ep.apps.googleusercontent.com",
}

var appConstants = {
    "authorizationKey": "dGF4aTphcHBsaWNhdGlvbg=="
}


var headerConstants = {
    "json": "application/json"
}

var pagingConstants = {
    "defaultPageSize": 10,
    "defaultPageNumber": 1
}

var messagesConstants = {
    //users
    "saveUser": "User saved successfully",
    "updateUser": "User updated successfully",
    "updateStatus": "Status updated successfully",
    "deleteUser": "User(s) deleted successfully"
}

var countryCodes = ['+1', '+91'];
// countryCodes['+1'] = '+1';
// countryCodes['+91'] = '+91';
var defaultLocation = [40.17168367266162, -100.60126146393662]; // Default location US
var defaultRange = 50 // default operating range 50 KM
var referralStatusArr = ['Inbox', 'Appt. Scheduled', 'Appt. Completed', 'Note Sent', "Note Received", "Reject", "Surgery Booked", "Document Uploaded"];

var referralStatusObj = [
    { status: 0, name: 'Inbox', display: true },
    { status: 1, name: 'Appt. Scheduled', display: true },
    { status: 2, name: 'Appt. Completed', display: true },
    { status: 3, name: 'Note Sent', display: true },
    { status: 4, name: "Note Received", display: true },
    { status: 5, name: "Reject", display: true },
    { status: 6, name: "Surgery Booked", display: true },
    { status: 7, name: "Document Uploaded", display: false }
];
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

/*var officeadminTitle = [
                          '',
                          'Scheduler',
                          'Insurance Coordinator',
                          'Receptionist',
                          'Filing Clerk',
                          'Office Administrator',
                          'Medical Assistant'
                ];*/

var stateList = [
    {
        name: 'ALABAMA',
        abbreviation: 'AL'
    },
    {
        name: 'ALASKA',
        abbreviation: 'AK'
    },
    {
        name: 'AMERICAN SAMOA',
        abbreviation: 'AS'
    },
    {
        name: 'ARIZONA',
        abbreviation: 'AZ'
    },
    {
        name: 'ARKANSAS',
        abbreviation: 'AR'
    },
    {
        name: 'CALIFORNIA',
        abbreviation: 'CA'
    },
    {
        name: 'COLORADO',
        abbreviation: 'CO'
    },
    {
        name: 'CONNECTICUT',
        abbreviation: 'CT'
    },
    {
        name: 'DELAWARE',
        abbreviation: 'DE'
    },
    {
        name: 'DISTRICT OF COLUMBIA',
        abbreviation: 'DC'
    },
    {
        name: 'FEDERATED STATES OF MICRONESIA',
        abbreviation: 'FM'
    },
    {
        name: 'FLORIDA',
        abbreviation: 'FL'
    },
    {
        name: 'GEORGIA',
        abbreviation: 'GA'
    },
    {
        name: 'GUAM',
        abbreviation: 'GU'
    },
    {
        name: 'HAWAII',
        abbreviation: 'HI'
    },
    {
        name: 'IDAHO',
        abbreviation: 'ID'
    },
    {
        name: 'ILLINOIS',
        abbreviation: 'IL'
    },
    {
        name: 'INDIANA',
        abbreviation: 'IN'
    },
    {
        name: 'IOWA',
        abbreviation: 'IA'
    },
    {
        name: 'KANSAS',
        abbreviation: 'KS'
    },
    {
        name: 'KENTUCKY',
        abbreviation: 'KY'
    },
    {
        name: 'LOUISIANA',
        abbreviation: 'LA'
    },
    {
        name: 'MAINE',
        abbreviation: 'ME'
    },
    {
        name: 'MARSHALL ISLANDS',
        abbreviation: 'MH'
    },
    {
        name: 'MARYLAND',
        abbreviation: 'MD'
    },
    {
        name: 'MASSACHUSETTS',
        abbreviation: 'MA'
    },
    {
        name: 'MICHIGAN',
        abbreviation: 'MI'
    },
    {
        name: 'MINNESOTA',
        abbreviation: 'MN'
    },
    {
        name: 'MISSISSIPPI',
        abbreviation: 'MS'
    },
    {
        name: 'MISSOURI',
        abbreviation: 'MO'
    },
    {
        name: 'MONTANA',
        abbreviation: 'MT'
    },
    {
        name: 'NEBRASKA',
        abbreviation: 'NE'
    },
    {
        name: 'NEVADA',
        abbreviation: 'NV'
    },
    {
        name: 'NEW HAMPSHIRE',
        abbreviation: 'NH'
    },
    {
        name: 'NEW JERSEY',
        abbreviation: 'NJ'
    },
    {
        name: 'NEW MEXICO',
        abbreviation: 'NM'
    },
    {
        name: 'NEW YORK',
        abbreviation: 'NY'
    },
    {
        name: 'NORTH CAROLINA',
        abbreviation: 'NC'
    },
    {
        name: 'NORTH DAKOTA',
        abbreviation: 'ND'
    },
    {
        name: 'NORTHERN MARIANA ISLANDS',
        abbreviation: 'MP'
    },
    {
        name: 'OHIO',
        abbreviation: 'OH'
    },
    {
        name: 'OKLAHOMA',
        abbreviation: 'OK'
    },
    {
        name: 'OREGON',
        abbreviation: 'OR'
    },
    {
        name: 'PALAU',
        abbreviation: 'PW'
    },
    {
        name: 'PENNSYLVANIA',
        abbreviation: 'PA'
    },
    {
        name: 'PUERTO RICO',
        abbreviation: 'PR'
    },
    {
        name: 'RHODE ISLAND',
        abbreviation: 'RI'
    },
    {
        name: 'SOUTH CAROLINA',
        abbreviation: 'SC'
    },
    {
        name: 'SOUTH DAKOTA',
        abbreviation: 'SD'
    },
    {
        name: 'TENNESSEE',
        abbreviation: 'TN'
    },
    {
        name: 'TEXAS',
        abbreviation: 'TX'
    },
    {
        name: 'UTAH',
        abbreviation: 'UT'
    },
    {
        name: 'VERMONT',
        abbreviation: 'VT'
    },
    {
        name: 'VIRGIN ISLANDS',
        abbreviation: 'VI'
    },
    {
        name: 'VIRGINIA',
        abbreviation: 'VA'
    },
    {
        name: 'WASHINGTON',
        abbreviation: 'WA'
    },
    {
        name: 'WEST VIRGINIA',
        abbreviation: 'WV'
    },
    {
        name: 'WISCONSIN',
        abbreviation: 'WI'
    },
    {
        name: 'WYOMING',
        abbreviation: 'WY'
    }
];