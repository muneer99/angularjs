var baseUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
//var baseUrl = "http://localhost:6020";
var mainUrl = location.protocol + '//' + location.hostname + ':' + location.port;

var webservices = {

    //Authenticate
    "authenticate": baseUrl + "/api/adminLogin",
    "forgotPassword": baseUrl + "/api/forgotPassword",

    //Doctors
    "getUserList": baseUrl + "/api/getUserList",
    "addDoctor": baseUrl + "/api/addUser",
    "getSpecialty": baseUrl + "/api/getSpeciality",
    "deleteDoctor": baseUrl + "/api/deleteUser",
    "updateUser": baseUrl + "/api/updateUser",
    "getById": baseUrl + "/api/getById/:id",
    "updateStatus": baseUrl + "/api/updateStatus",
    "getDoctorsList": baseUrl + "/api/getDoctorsList",

    //Patients
    "getPatientList": baseUrl + "/api/getPatientList",
    "deletePatient": baseUrl + "/api/deletePatient",
    "updatePatient": baseUrl + "/api/updatePatient",
    "addPatient": baseUrl + "/api/addPatient",
    "getPatientById": baseUrl + "/api/getPatientById/:id",
    "updatePatientStatus": baseUrl + "/api/updatePatientStatus",

    //Insurance network
    'addNetwork': baseUrl + '/api/addNetwork',
    'deleteNetwork': baseUrl + '/api/deleteNetwork',
    'getNetworkList': baseUrl + '/api/getNetworkList',
    'getNetwork': baseUrl + '/api/getNetwork/:id',
    'getUserNetwork': baseUrl + '/api/getUserNetwork/:id',
    'getSelectedNetwork':baseUrl + '/api/getSelectedNetwork/:id',
    'getServiceList': baseUrl+'/api/getServices'
};


var countryCodes = ['+1', '+91'];

var statusCode = {
    "ok": 200,
    "error": 401,
    "failed": 1002,
    "unauth": 1003,
    "internalError": 1004
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
    "deleteUser": "User(s) deleted successfully",

    //schools
    "saveSchool": "School saved successfully"
}

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